import json
import os
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
from itertools import combinations
from typing import Any, Dict, Iterator, List, Optional, Tuple, Union
from evidencelib import MassFunction as BeliefMass

from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import issparse

from models import (
    Methods,
    GetMethodsResponse,
    FusionRequest,
    FusionResponse,
    FusionResult,
    DataSet,
    GetDataSetsResponse,
    DatasetPreviewColumn,
    DatasetPreviewResponse,
    UploadDatasetResponse,
    Classifiers,
    GetClassifiersResponse,
    ClassifierConfig,
    ParamSpec,
    MLFusionRequest,
    MLFusionResponse,
    MLExportCodeResponse,
    MLFusionResult,
    MLFusionSearchRequest,
    MLFusionSearchResponse,
    MLFusionSearchEntry,
    FusionSampleAnalysis,
    FusionSampleDetail,
    Example,
    ExampleSource,
    GetExamplesResponse,
)
from belief_adapter import (
    FUSION_RULE_DESCRIPTIONS,
    FUSION_RULE_ORDER,
    build_dst_frame_from_labels,
    build_mass,
    build_masses_from_singletons,
    combine_masses,
    get_singleton_mass,
    mass_to_response,
    pignistic_scores,
)
from ml_export import generate_builtin_export_code, generate_fusion_calculator_export_code, generate_uploaded_export_code
from ml_runtime import (
    BUILTIN_DATASETS,
    _classifier_registry,
    build_dataset_preview,
    build_training_model,
    build_uploaded_feature_matrix,
    build_uploaded_preprocessor,
    assert_ml_dataset_within_limits,
    load_dataset,
    parse_feature_columns_form,
    prepare_uploaded_dataset,
    read_uploaded_csv,
)


#Funkcje dostepne w API
METHODS = [
    Methods(
        id=method_id,
        name=FUSION_RULE_DESCRIPTIONS[method_id]["name"],
        description=FUSION_RULE_DESCRIPTIONS[method_id]["description"],
        category=FUSION_RULE_DESCRIPTIONS[method_id]["category"],
    )
    for method_id in FUSION_RULE_ORDER
]

# Przykłady dla kalkulatora
EXAMPLES = [
    Example(
        id="dst_low_conflict",
        name="DST – Low conflict (consistent sources)",
        description="Sources largely agree. Conflict is low.",
        sources=[
            ExampleSource(
                name="Source 1",
                masses={
                    "A": 0.90,
                    "B": 0.10,
                },
            ),
            ExampleSource(
                name="Source 2",
                masses={
                    "A": 0.90,
                    "B": 0.10,
                },
            ),
        ],
    ),
    Example(
        id="dst_moderate_conflict",
        name="DST – Moderate conflict",
        description="Partial disagreement between sources.",
        sources=[
            ExampleSource(
                name="Source 1",
                masses={
                    "A": 0.50,
                    "B": 0.30,
                    "U": 0.20,
                },
            ),
            ExampleSource(
                name="Source 2",
                masses={
                    "A": 0.30,
                    "B": 0.50,
                    "U": 0.20,
                },
            ),
        ],
    ),
    Example(
        id="pcr5_high_conflict",
        name="PCR5 – High conflict (contradictory sources)",
        description="Sources strongly contradict each other.",
        sources=[
            ExampleSource(
                name="Source 1",
                masses={
                    "A": 0.75,
                    "B": 0.05,
                    "U": 0.20,
                },
            ),
            ExampleSource(
                name="Source 2",
                masses={
                    "A": 0.05,
                    "B": 0.75,
                    "U": 0.20,
                },
            ),
        ],
    ),
    Example(
        id="avalanche_hazard",
        name="Avalanche Hazard (Mountains)",
        description="Fuse weather forecast + field observations to estimate avalanche danger",
        sources=[
            ExampleSource(
                name="Source 1 – Meteorological conditions",
                masses={
                    "Level 2 – Moderate": 0.20,
                    "Level 3 – Considerable": 0.30,
                    "Level 4 – High": 0.35,
                    "Uncertainty": 0.15,
                },
            ),
            ExampleSource(
                name="Source 2 – Field observations",
                masses={
                    "Level 2 – Moderate": 0.40,
                    "Level 3 – Considerable": 0.30,
                    "Level 4 – High": 0.10,
                    "Uncertainty": 0.20,
                },
            ),
        ],
    )
]


app = FastAPI()


@app.middleware("http")
async def strip_api_prefix(request: Request, call_next):
    if request.scope["path"].startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:]
    return await call_next(request)


DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def get_cors_origins() -> List[str]:
    configured_origins = os.getenv("CORS_ORIGINS", "")
    extra_origins = [
        origin.strip()
        for origin in configured_origins.split(",")
        if origin.strip()
    ]
    return DEFAULT_CORS_ORIGINS + extra_origins


# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> Dict[str, str]:
    return {"status": "ok"}

# Endpoint z przykładami dla kalkulatora
@app.get("/examples", response_model=GetExamplesResponse)
def get_examples() -> GetExamplesResponse:
    """Endpoint to retrieve available calculator examples.

    Returns:
        GetExamplesResponse: A list of predefined fusion examples.
    """
    return GetExamplesResponse(examples=EXAMPLES)


#Pobranie dostępnych metod fuzji

@app.get("/methods", response_model=GetMethodsResponse)
def get_methods() -> GetMethodsResponse:
    """Endpoint to retrieve available fusion methods.

    Returns:
        GetMethodsResponse: A list of supported fusion methods with descriptions.
    """
    return GetMethodsResponse(methods=METHODS)


@app.post("/fusion", response_model=FusionResponse)
def fuse_beliefs(request: FusionRequest) -> FusionResponse:
    """
    Endpoint to fuse belief masses using the selected fusion method.

    Args:
        request (FusionRequest): The fusion request containing the method and sources.

    Returns:
        FusionResponse: The fusion response containing the fused masses and conflict value.

    Raises:
        HTTPException: If the method is unsupported, too few sources are provided, or source masses are invalid.
    """


    if request.fusion_method not in FUSION_RULE_DESCRIPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Fusion method '{request.fusion_method}' is not supported."
    )


    if len(request.sources) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"Fusion requires at least 2 sources for fusion."
    )


    # Konwersja danych wejściowych na obiekty evidencelib.
    try:
        belief_masses = build_masses_from_singletons([source.masses for source in request.sources])
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e

    # Wykonanie fuzji
    try:
        combined_belief, conflict = combine_masses(belief_masses, request.fusion_method)
    except Exception as e:
        raise HTTPException(
                status_code=400,
                detail=str(e)
        )


    # Przygotowanie odpowiedzi
    result_masses = mass_to_response(combined_belief)
    fusion_result = FusionResult(masses=result_masses, conflict=conflict)

    return FusionResponse(
        fusion_method=request.fusion_method,
        result=fusion_result
    )


@app.post("/fusion/export-code", response_model=MLExportCodeResponse)
def export_fusion_code(request: FusionRequest) -> MLExportCodeResponse:
    code, filename = generate_fusion_calculator_export_code(
        request.fusion_method,
        request.sources,
    )
    return MLExportCodeResponse(
        code=code,
        filename=filename,
        datasetKind="calculator",
    )

@app.get("/ml/datasets", response_model=GetDataSetsResponse)
def get_datasets() -> GetDataSetsResponse:
    """Endpoint to retrieve available datasets.

    Returns:
        GetDataSetsResponse: A list of supported datasets with descriptions.
    """
    return GetDataSetsResponse(datasets=BUILTIN_DATASETS)


@app.post("/ml/datasets/preview", response_model=DatasetPreviewResponse)
async def preview_dataset(file: UploadFile = File(...)) -> DatasetPreviewResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    fieldnames, rows = read_uploaded_csv(content)
    return build_dataset_preview(fieldnames, rows)


@app.post("/ml/datasets/upload", response_model=UploadDatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    target_column: str | None = Form(None),
    feature_columns: str | None = Form(None),
) -> UploadDatasetResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    dataset, dataset_entry, rows, features, classes = prepare_uploaded_dataset(
        file.filename,
        content,
        requested_target_column=target_column.strip() if target_column else None,
        requested_feature_columns=parsed_feature_columns,
    )

    return UploadDatasetResponse(
        dataset=dataset,
        rows=rows,
        features=features,
        classes=classes,
    )


#---------------Pobranie dostępnych modeli-----------------
@app.get("/ml/models", response_model=GetClassifiersResponse)
def get_classifiers() -> GetClassifiersResponse:
    """Endpoint to retrieve available classifiers.

    Returns:
        GetClassifiersResponse: A list of supported classifiers with descriptions.
    """
    return GetClassifiersResponse(classifiers=_classifier_registry())

#---------------Fuzja w ML-----------------
#funkcje pomocnicze

def proba_to_bba(proba: np.ndarray, class_labels: List[str], frame=None) -> BeliefMass:
    masses = {label: float(proba[i]) for i, label in enumerate(class_labels)}
    if frame is None:
        return build_masses_from_singletons([masses])[0]
    return build_mass(frame, masses)


def calculate_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_score: np.ndarray | None = None,
) -> dict[str, float | None]:
    metrics: dict[str, float | None] = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
        "roc_auc": None,
    }

    if y_score is None or len(np.unique(y_true)) < 2:
        return metrics

    try:
        if y_score.ndim == 1:
            metrics["roc_auc"] = float(roc_auc_score(y_true, y_score))
        elif y_score.shape[1] == 2:
            metrics["roc_auc"] = float(roc_auc_score(y_true, y_score[:, 1]))
        else:
            metrics["roc_auc"] = float(
                roc_auc_score(y_true, y_score, multi_class="ovr", average="weighted")
            )
    except ValueError:
        metrics["roc_auc"] = None

    return metrics


DETAIL_SAMPLE_LIMIT = 150
MAX_ML_MODELS = 8
MAX_ML_TRAINING_UNITS = 10_000_000


def _majority_vote_labels(y_preds_matrix: np.ndarray, n_classes: int) -> np.ndarray:
    """y_preds_matrix shape (n_models, n_test); returns (n_test,) encoded class indices."""
    n_test = y_preds_matrix.shape[1]
    out = np.empty(n_test, dtype=int)
    for j in range(n_test):
        votes = y_preds_matrix[:, j].astype(int, copy=False)
        counts = np.bincount(votes, minlength=n_classes)
        out[j] = int(np.argmax(counts))
    return out


def _build_fusion_sample_analysis(
    le: LabelEncoder,
    model_ids: List[str],
    y_test: np.ndarray,
    idx_test: np.ndarray,
    y_preds_matrix: np.ndarray,
    y_fused: np.ndarray,
    per_model_results: List[MLFusionResult],
) -> FusionSampleAnalysis:
    n_test = len(y_test)
    n_classes = len(le.classes_)

    def enc_to_str(z: int) -> str:
        return str(le.inverse_transform([int(z)])[0])

    best_idx = 0
    for i in range(len(model_ids)):
        if per_model_results[i].accuracy > per_model_results[best_idx].accuracy:
            best_idx = i
    best_model_id = model_ids[best_idx]
    y_best = y_preds_matrix[best_idx]

    mv = _majority_vote_labels(y_preds_matrix, n_classes)

    gain_b = loss_b = tcb = twb = 0
    gain_m = loss_m = tcm = twm = 0
    rescue = 0

    gain_b_indices: List[int] = []
    loss_b_indices: List[int] = []

    for i in range(n_test):
        yt = int(y_test[i])
        yf = int(y_fused[i])
        fusion_ok = yf == yt
        best_ok = int(y_best[i]) == yt
        mv_ok = int(mv[i]) == yt
        all_wrong = bool(np.all(y_preds_matrix[:, i] != yt))

        if fusion_ok and not best_ok:
            gain_b += 1
            gain_b_indices.append(i)
        elif best_ok and not fusion_ok:
            loss_b += 1
            loss_b_indices.append(i)
        elif fusion_ok and best_ok:
            tcb += 1
        else:
            twb += 1

        if fusion_ok and not mv_ok:
            gain_m += 1
        elif mv_ok and not fusion_ok:
            loss_m += 1
        elif fusion_ok and mv_ok:
            tcm += 1
        else:
            twm += 1

        if fusion_ok and all_wrong:
            rescue += 1

    def make_detail(test_i: int) -> FusionSampleDetail:
        preds = {mid: enc_to_str(y_preds_matrix[k, test_i]) for k, mid in enumerate(model_ids)}
        return FusionSampleDetail(
            test_index=test_i,
            original_row_index=int(idx_test[test_i]),
            y_true=enc_to_str(y_test[test_i]),
            y_fused=enc_to_str(y_fused[test_i]),
            predictions=preds,
        )

    gb_total = len(gain_b_indices)
    lb_total = len(loss_b_indices)
    gb_trunc = gb_total > DETAIL_SAMPLE_LIMIT
    lb_trunc = lb_total > DETAIL_SAMPLE_LIMIT
    gains_list = [make_detail(i) for i in gain_b_indices[:DETAIL_SAMPLE_LIMIT]]
    losses_list = [make_detail(i) for i in loss_b_indices[:DETAIL_SAMPLE_LIMIT]]

    return FusionSampleAnalysis(
        test_set_size=n_test,
        best_model_id=best_model_id,
        gain_vs_best=gain_b,
        loss_vs_best=loss_b,
        tie_correct_vs_best=tcb,
        tie_wrong_vs_best=twb,
        gain_vs_majority=gain_m,
        loss_vs_majority=loss_m,
        tie_correct_vs_majority=tcm,
        tie_wrong_vs_majority=twm,
        rescue_all_wrong=rescue,
        gains_vs_best=gains_list,
        gains_vs_best_total=gb_total,
        gains_vs_best_truncated=gb_trunc,
        losses_vs_best=losses_list,
        losses_vs_best_total=lb_total,
        losses_vs_best_truncated=lb_trunc,
    )


def _parse_model_configs_json(raw: Any) -> list[ClassifierConfig]:
    if not isinstance(raw, list) or not raw:
        raise HTTPException(status_code=400, detail="models must be a non-empty JSON array.")
    out: list[ClassifierConfig] = []
    for item in raw:
        if isinstance(item, str):
            out.append(ClassifierConfig(id=item, params={}))
        elif isinstance(item, dict) and "id" in item:
            out.append(ClassifierConfig(**item))
        else:
            raise HTTPException(status_code=400, detail="Each model must be a string id or {id, params}.")
    return out


FUSION_METHODS_SEARCH = ("dempster", "pcr5", "pcr6")
MAX_SEARCH_MODELS = 8
MAX_SEARCH_EVALS = 1_000
MAX_SEARCH_FUSION_SAMPLE_EVALS = 500_000


def _assert_ml_request_allowed(
    X: np.ndarray,
    y: np.ndarray,
    model_configs: List[ClassifierConfig],
    *,
    use_cross_validation: bool,
    cv_folds: int,
    context: str,
) -> None:
    assert_ml_dataset_within_limits(X, y, context=context)

    n_models = len(model_configs)
    if n_models < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 models for ML fusion.")
    if n_models > MAX_ML_MODELS:
        raise HTTPException(status_code=400, detail=f"Select at most {MAX_ML_MODELS} models.")

    rows = int(X.shape[0])
    features = int(X.shape[1]) if getattr(X, "ndim", 0) >= 2 else 1
    cv_multiplier = cv_folds if use_cross_validation else 1
    cost_units = rows * max(features, 1) * n_models * cv_multiplier
    if cost_units > MAX_ML_TRAINING_UNITS:
        raise HTTPException(
            status_code=400,
            detail=(
                "ML request is too large to train interactively. "
                "Use fewer rows, features, models, or disable cross-validation."
            ),
        )


def _count_search_evaluations(n_models: int) -> int:
    if n_models < 2:
        return 0
    total = 0
    for r in range(2, n_models + 1):
        subset_count = len(list(combinations(range(n_models), r)))
        total += subset_count * 2  # dempster + pcr6
        if r == 2:
            total += subset_count  # pcr5 is defined for exactly two sources
    return total


def _build_bbas_per_sample(
    model_probabilities: List[np.ndarray],
    class_labels: List[str],
) -> List[List[BeliefMass]]:
    frame = build_dst_frame_from_labels(class_labels)
    n_eval = model_probabilities[0].shape[0]
    bbas_per_sample: List[List[BeliefMass]] = []
    for i in range(n_eval):
        sample_bbas = []
        for model_proba in model_probabilities:
            proba = model_proba[i]
            bba = proba_to_bba(proba, class_labels, frame)
            sample_bbas.append(bba)
        bbas_per_sample.append(sample_bbas)
    return bbas_per_sample


def _average_singleton_scores_from_bbas(
    sample_bbas: List[BeliefMass],
    class_labels: List[str],
) -> np.ndarray:
    """
    Fallback when Dempster's rule hits total conflict (K=1): singleton masses are
    averaged across sources and renormalized. DST is undefined in that case;
    this keeps the ML pipeline well-defined.
    """
    n = len(sample_bbas)
    scores = np.zeros(len(class_labels), dtype=float)
    for j, label in enumerate(class_labels):
        scores[j] = sum(get_singleton_mass(bba, label) for bba in sample_bbas) / n
    s = float(scores.sum())
    if s > 1e-15:
        scores /= s
    else:
        scores[:] = 1.0 / max(len(class_labels), 1)
    return scores


def _average_pairwise_conflict(sample_bbas: List[BeliefMass]) -> float | None:
    if len(sample_bbas) < 2:
        return None

    total = 0.0
    pairs = 0
    for i, left in enumerate(sample_bbas[:-1]):
        for right in sample_bbas[i + 1:]:
            pairs += 1
            for h1, m1 in left.items():
                for h2, m2 in right.items():
                    if not (h1 & h2):
                        total += float(m1) * float(m2)

    return total / pairs if pairs else None


def _run_fusion_on_bbas(
    bbas_per_sample: List[List[BeliefMass]],
    subset_indices: List[int],
    fusion_method: str,
    class_labels: List[str],
    label_lookup: dict[str, int],
    y_eval: np.ndarray,
    model_ids: Optional[List[str]] = None,
) -> Tuple[Dict[str, Any], np.ndarray]:
    n_eval = len(bbas_per_sample)
    y_pred: List[int] = []
    fused_scores: List[np.ndarray] = []
    total_conflict = 0.0
    conflict_count = 0

    for idx in range(n_eval):
        sample_bbas = [bbas_per_sample[idx][j] for j in subset_indices]

        try:
            try:
                fused, conflict = combine_masses(sample_bbas, fusion_method)
            except ValueError as ve:
                if fusion_method != "dempster" or "DST fusion impossible" not in str(ve):
                    raise
                # Total conflict (K=1): no normalized DST result — use mean singleton masses.
                singleton_scores = _average_singleton_scores_from_bbas(sample_bbas, class_labels)
                fused_scores.append(singleton_scores)
                predicted_label = class_labels[int(np.argmax(singleton_scores))]
                y_pred.append(label_lookup[predicted_label])
                total_conflict += 1.0
                conflict_count += 1
                continue

            if conflict is not None:
                total_conflict += float(conflict)
                conflict_count += 1

            score_map = pignistic_scores(fused, class_labels)
            decision_scores = np.array([score_map[label] for label in class_labels], dtype=float)
            score_sum = float(decision_scores.sum())
            if score_sum > 1e-15:
                decision_scores = decision_scores / score_sum
            else:
                decision_scores = _average_singleton_scores_from_bbas(sample_bbas, class_labels)

            fused_scores.append(decision_scores)
            predicted_label = class_labels[int(np.argmax(decision_scores))]
            if predicted_label not in label_lookup:
                raise HTTPException(status_code=500, detail=f"Unknown fused label '{predicted_label}'.")
            y_pred.append(label_lookup[predicted_label])
        except HTTPException:
            raise
        except Exception as e:
            sub = ""
            if model_ids:
                sub = ",".join(model_ids[j] for j in subset_indices)
                sub = f" [{sub}]"
            raise HTTPException(
                status_code=500,
                detail=f"Fusion error at sample {idx} with {len(sample_bbas)} models{sub}: {str(e)}",
            ) from e

    fused_metrics = calculate_classification_metrics(
        y_eval,
        np.asarray(y_pred),
        np.asarray(fused_scores) if fused_scores else None,
    )
    avg_conflict = (total_conflict / conflict_count) if conflict_count > 0 else None
    fused_metrics["conflict"] = avg_conflict
    return fused_metrics, np.asarray(y_pred, dtype=int)


def _execute_ml_training(
    X: np.ndarray,
    y: np.ndarray,
    model_configs: List[ClassifierConfig],
    fusion_method: str,
    preprocessor: ColumnTransformer | None = None,
    use_cross_validation: bool = False,
    cv_folds: int = 5,
) -> Tuple[
    List[str],
    LabelEncoder,
    List[str],
    dict[str, int],
    List[str],
    np.ndarray,
    np.ndarray,
    np.ndarray,
    List[MLFusionResult],
    str,
    List[List[BeliefMass]],
]:
    model_ids = [c.id for c in model_configs]
    params_map = {c.id: c.params for c in model_configs}

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    class_labels = [str(index) for index in range(len(le.classes_))]
    label_lookup = {label: index for index, label in enumerate(class_labels)}
    class_labels_human = [str(c) for c in le.classes_]

    row_indices = np.arange(X.shape[0], dtype=int)
    n_samples = X.shape[0]

    evaluation_mode = "cv_oof" if use_cross_validation else "holdout"

    model_probabilities: List[np.ndarray] = []
    y_preds_rows: List[np.ndarray] = []
    y_eval: np.ndarray
    idx_eval: np.ndarray
    per_model_results: List[MLFusionResult] = []

    if use_cross_validation:
        if n_samples < cv_folds * 2:
            raise HTTPException(
                status_code=400,
                detail=f"Need at least {cv_folds * 2} samples for {cv_folds}-fold cross-validation.",
            )
        try:
            cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid CV configuration: {exc}") from exc

        for model_id in model_ids:
            model = build_training_model(model_id, preprocessor, params_map.get(model_id, {}))
            try:
                proba_oof = cross_val_predict(
                    model, X, y_encoded, cv=cv, method="predict_proba", n_jobs=1
                )
            except Exception as exc:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cross-validation failed for model '{model_id}': {exc}",
                ) from exc
            model_probabilities.append(proba_oof)
            y_preds_rows.append(np.argmax(proba_oof, axis=1))

        y_eval = y_encoded
        idx_eval = row_indices

        for model_id, proba_oof, y_pred_oof in zip(model_ids, model_probabilities, y_preds_rows):
            m = calculate_classification_metrics(y_encoded, y_pred_oof, proba_oof)
            per_model_results.append(
                MLFusionResult(
                    kind="model",
                    model_id=model_id,
                    fusion_method=fusion_method,
                    accuracy=m["accuracy"],
                    precision=m["precision"],
                    recall=m["recall"],
                    f1_score=m["f1_score"],
                    roc_auc=m["roc_auc"],
                    conflict=None,
                )
            )
    else:
        try:
            X_train, X_test, y_train, y_test, _idx_train, idx_test = train_test_split(
                X,
                y_encoded,
                row_indices,
                test_size=0.25,
                random_state=42,
                stratify=y_encoded,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Dataset cannot be split for training: {str(exc)}") from exc

        for model_id in model_ids:
            model = build_training_model(model_id, preprocessor, params_map.get(model_id, {}))
            try:
                model.fit(X_train, y_train)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400, detail=f"Model '{model_id}' could not be trained: {str(exc)}"
                ) from exc
            model_probabilities.append(model.predict_proba(X_test))
            y_preds_rows.append(model.predict(X_test))

        y_eval = y_test
        idx_eval = idx_test

        for model_id, model_proba, y_pred_model in zip(model_ids, model_probabilities, y_preds_rows):
            m = calculate_classification_metrics(y_test, y_pred_model, model_proba)
            per_model_results.append(
                MLFusionResult(
                    kind="model",
                    model_id=model_id,
                    fusion_method=fusion_method,
                    accuracy=m["accuracy"],
                    precision=m["precision"],
                    recall=m["recall"],
                    f1_score=m["f1_score"],
                    roc_auc=m["roc_auc"],
                    conflict=None,
                )
            )

    y_preds_matrix = np.stack(y_preds_rows, axis=0)
    bbas_per_sample = _build_bbas_per_sample(model_probabilities, class_labels)

    return (
        model_ids,
        le,
        class_labels,
        label_lookup,
        class_labels_human,
        y_preds_matrix,
        y_eval,
        idx_eval,
        per_model_results,
        evaluation_mode,
        bbas_per_sample,
    )


def execute_ml_fusion(
    X: np.ndarray,
    y: np.ndarray,
    model_configs: List[ClassifierConfig],
    fusion_method: str,
    preprocessor: ColumnTransformer | None = None,
    use_cross_validation: bool = False,
    cv_folds: int = 5,
) -> MLFusionResponse:
    if issparse(X):
        X = X.toarray()

    y = np.asarray(y)
    _assert_ml_request_allowed(
        X,
        y,
        model_configs,
        use_cross_validation=use_cross_validation,
        cv_folds=cv_folds,
        context="Dataset",
    )

    (
        model_ids,
        le,
        class_labels,
        label_lookup,
        class_labels_human,
        y_preds_matrix,
        y_eval,
        idx_eval,
        per_model_results,
        evaluation_mode,
        bbas_per_sample,
    ) = _execute_ml_training(
        X,
        y,
        model_configs,
        fusion_method,
        preprocessor,
        use_cross_validation,
        cv_folds,
    )

    fused_metrics, y_fused_arr = _run_fusion_on_bbas(
        bbas_per_sample,
        list(range(len(model_ids))),
        fusion_method,
        class_labels,
        label_lookup,
        y_eval,
        model_ids,
    )

    fused_result = MLFusionResult(
        kind="fusion",
        model_id=None,
        fusion_method=fusion_method,
        accuracy=fused_metrics["accuracy"],
        precision=fused_metrics["precision"],
        recall=fused_metrics["recall"],
        f1_score=fused_metrics["f1_score"],
        roc_auc=fused_metrics["roc_auc"],
        conflict=fused_metrics["conflict"],
    )

    sample_analysis = _build_fusion_sample_analysis(
        le,
        model_ids,
        y_eval,
        idx_eval,
        y_preds_matrix,
        y_fused_arr,
        per_model_results,
    )

    n_classes = len(le.classes_)
    cm = confusion_matrix(y_eval, y_fused_arr, labels=np.arange(n_classes, dtype=int))

    return MLFusionResponse(
        results=[*per_model_results, fused_result],
        sample_analysis=sample_analysis,
        evaluationMode=evaluation_mode,
        classLabels=class_labels_human,
        confusionMatrixFusion=cm.tolist(),
    )


def _assert_fusion_search_allowed(n_models: int) -> None:
    if n_models < 2:
        raise HTTPException(status_code=400, detail="Combination search requires at least 2 models.")
    if n_models > MAX_SEARCH_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Select at most {MAX_SEARCH_MODELS} models for combination search.",
        )
    if _count_search_evaluations(n_models) > MAX_SEARCH_EVALS:
        raise HTTPException(
            status_code=400,
            detail="Too many fusion combinations to evaluate; select fewer models.",
        )


def _assert_fusion_search_sample_cost(total: int, n_eval_samples: int) -> None:
    if total * n_eval_samples > MAX_SEARCH_FUSION_SAMPLE_EVALS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Combination search is too large for this dataset. "
                "Use fewer models, fewer rows, or disable cross-validation."
            ),
        )


def iter_fusion_search_entries(
    bbas_per_sample: List[List[BeliefMass]],
    model_ids: List[str],
    class_labels: List[str],
    label_lookup: dict[str, int],
    y_eval: np.ndarray,
) -> Iterator[Tuple[int, int, MLFusionSearchEntry]]:
    """Yields (done, total, entry) for each fusion combination (subset × rule)."""
    n_models = len(model_ids)
    total = _count_search_evaluations(n_models)
    done = 0
    indices = list(range(n_models))
    for r in range(2, n_models + 1):
        for subset_idx in combinations(indices, r):
            subset_list = list(subset_idx)
            for fm in FUSION_METHODS_SEARCH:
                if fm == "pcr5" and len(subset_list) != 2:
                    continue
                fused_metrics, _y_pred = _run_fusion_on_bbas(
                    bbas_per_sample,
                    subset_list,
                    fm,
                    class_labels,
                    label_lookup,
                    y_eval,
                    model_ids,
                )
                entry = MLFusionSearchEntry(
                    model_ids=[model_ids[i] for i in subset_list],
                    fusion_method=fm,
                    accuracy=fused_metrics["accuracy"],
                    precision=fused_metrics["precision"],
                    recall=fused_metrics["recall"],
                    f1_score=fused_metrics["f1_score"],
                    roc_auc=fused_metrics["roc_auc"],
                    conflict=fused_metrics["conflict"],
                )
                done += 1
                yield done, total, entry


def execute_ml_fusion_search(
    X: np.ndarray,
    y: np.ndarray,
    model_configs: List[ClassifierConfig],
    preprocessor: ColumnTransformer | None = None,
    use_cross_validation: bool = False,
    cv_folds: int = 5,
) -> MLFusionSearchResponse:
    n_models = len(model_configs)
    _assert_fusion_search_allowed(n_models)

    if issparse(X):
        X = X.toarray()
    y = np.asarray(y)
    _assert_ml_request_allowed(
        X,
        y,
        model_configs,
        use_cross_validation=use_cross_validation,
        cv_folds=cv_folds,
        context="Dataset",
    )

    (
        model_ids,
        _le,
        class_labels,
        label_lookup,
        class_labels_human,
        _y_preds_matrix,
        y_eval,
        _idx_eval,
        per_model_results,
        evaluation_mode,
        bbas_per_sample,
    ) = _execute_ml_training(
        X,
        y,
        model_configs,
        fusion_method="dempster",
        preprocessor=preprocessor,
        use_cross_validation=use_cross_validation,
        cv_folds=cv_folds,
    )
    _assert_fusion_search_sample_cost(_count_search_evaluations(n_models), len(y_eval))

    entries = [e for _done, _total, e in iter_fusion_search_entries(
        bbas_per_sample,
        model_ids,
        class_labels,
        label_lookup,
        y_eval,
    )]

    entries.sort(key=lambda e: (-e.accuracy, -e.f1_score, -e.precision))
    best = entries[0]
    ranking = entries[:100]

    return MLFusionSearchResponse(
        best=best,
        ranking=ranking,
        evaluationMode=evaluation_mode,
        total_combinations_evaluated=len(entries),
        per_model_results=per_model_results,
        classLabels=class_labels_human,
    )


def _ndjson_stream_ml_fusion_search(
    X: np.ndarray,
    y: np.ndarray,
    model_configs: List[ClassifierConfig],
    preprocessor: ColumnTransformer | None,
    use_cross_validation: bool,
    cv_folds: int,
) -> Iterator[str]:
    """NDJSON lines: phase → progress → … → complete | error."""
    n_models = len(model_configs)
    try:
        _assert_fusion_search_allowed(n_models)
    except HTTPException as exc:
        det = exc.detail
        detail_str = det if isinstance(det, str) else json.dumps(det)
        yield json.dumps({"type": "error", "detail": detail_str}) + "\n"
        return

    try:
        yield json.dumps({"type": "phase", "phase": "training"}) + "\n"

        if issparse(X):
            X = X.toarray()
        y = np.asarray(y)
        _assert_ml_request_allowed(
            X,
            y,
            model_configs,
            use_cross_validation=use_cross_validation,
            cv_folds=cv_folds,
            context="Dataset",
        )

        (
            model_ids,
            _le,
            class_labels,
            label_lookup,
            class_labels_human,
            _y_preds_matrix,
            y_eval,
            _idx_eval,
            per_model_results,
            evaluation_mode,
            bbas_per_sample,
        ) = _execute_ml_training(
            X,
            y,
            model_configs,
            fusion_method="dempster",
            preprocessor=preprocessor,
            use_cross_validation=use_cross_validation,
            cv_folds=cv_folds,
        )

        total = _count_search_evaluations(n_models)
        _assert_fusion_search_sample_cost(total, len(y_eval))
        throttle = max(1, total // 200)
        last_sent = 0
        entries: List[MLFusionSearchEntry] = []

        yield json.dumps({"type": "progress", "phase": "combinations", "done": 0, "total": total}) + "\n"

        for done, tot, entry in iter_fusion_search_entries(
            bbas_per_sample,
            model_ids,
            class_labels,
            label_lookup,
            y_eval,
        ):
            entries.append(entry)
            if done == 1 or done == tot or done - last_sent >= throttle:
                last_sent = done
                yield json.dumps({"type": "progress", "phase": "combinations", "done": done, "total": tot}) + "\n"

        entries.sort(key=lambda e: (-e.accuracy, -e.f1_score, -e.precision))
        best = entries[0]
        ranking = entries[:100]
        response = MLFusionSearchResponse(
            best=best,
            ranking=ranking,
            evaluationMode=evaluation_mode,
            total_combinations_evaluated=len(entries),
            per_model_results=per_model_results,
            classLabels=class_labels_human,
        )
        yield json.dumps({"type": "complete", "data": response.model_dump()}) + "\n"
    except Exception as exc:
        if isinstance(exc, HTTPException):
            det: Any = exc.detail
            detail_str = det if isinstance(det, str) else json.dumps(det)
        else:
            detail_str = str(exc)
        yield json.dumps({"type": "error", "detail": detail_str}) + "\n"

@app.post("/ml/run", response_model=MLFusionResponse)
def fuse_ml(request: MLFusionRequest):
    """Uruchamia ML pipeline: trenuje modele, fuzja predykcji, zwraca accuracy."""
    dataset_bundle = load_dataset(request.datasetId)
    return execute_ml_fusion(
        dataset_bundle["X"],
        dataset_bundle["y"],
        request.models,
        request.fusionMethod,
        use_cross_validation=request.useCrossValidation,
        cv_folds=request.cvFolds,
    )


@app.post("/ml/run-upload", response_model=MLFusionResponse)
async def fuse_uploaded_ml(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    models: str = Form(...),
    fusion_method: str = Form(...),
    use_cross_validation: str = Form("false"),
    cv_folds: int = Form(5),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    try:
        raw_models = json.loads(models)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="models must be valid JSON.") from exc
    model_configs = _parse_model_configs_json(raw_models)

    ucv = str(use_cross_validation).lower() in ("true", "1", "yes", "on")

    if cv_folds < 2 or cv_folds > 15:
        raise HTTPException(status_code=400, detail="cv_folds must be between 2 and 15.")

    _, dataset_entry, _, _, _ = prepare_uploaded_dataset(
        file.filename,
        content,
        requested_target_column=target_column.strip(),
        requested_feature_columns=parsed_feature_columns,
    )

    X = build_uploaded_feature_matrix(
        dataset_entry["rows"],
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )
    y = np.asarray([row[dataset_entry["target_column"]] for row in dataset_entry["rows"]], dtype=object)
    preprocessor = build_uploaded_preprocessor(
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )

    return execute_ml_fusion(
        X,
        y,
        model_configs,
        fusion_method,
        preprocessor,
        use_cross_validation=ucv,
        cv_folds=cv_folds,
    )


@app.post("/ml/export-code", response_model=MLExportCodeResponse)
def export_ml_code(request: MLFusionRequest) -> MLExportCodeResponse:
    code, filename = generate_builtin_export_code(
        request.datasetId,
        request.models,
        request.fusionMethod,
        request.useCrossValidation,
        request.cvFolds,
    )
    return MLExportCodeResponse(
        code=code,
        filename=filename,
        datasetKind="builtin",
    )


@app.post("/ml/export-code-upload", response_model=MLExportCodeResponse)
async def export_uploaded_ml_code(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    models: str = Form(...),
    fusion_method: str = Form(...),
    use_cross_validation: str = Form("false"),
    cv_folds: int = Form(5),
) -> MLExportCodeResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    try:
        raw_models = json.loads(models)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="models must be valid JSON.") from exc
    model_configs = _parse_model_configs_json(raw_models)

    ucv = str(use_cross_validation).lower() in ("true", "1", "yes", "on")
    if cv_folds < 2 or cv_folds > 15:
        raise HTTPException(status_code=400, detail="cv_folds must be between 2 and 15.")

    dataset, dataset_entry, _, _, _ = prepare_uploaded_dataset(
        file.filename,
        content,
        requested_target_column=target_column.strip(),
        requested_feature_columns=parsed_feature_columns,
    )
    code, filename = generate_uploaded_export_code(
        dataset.name,
        dataset_entry["original_filename"],
        dataset_entry["target_column"],
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
        model_configs,
        fusion_method,
        ucv,
        cv_folds,
    )
    return MLExportCodeResponse(
        code=code,
        filename=filename,
        datasetKind="uploaded",
    )


@app.post("/ml/search", response_model=MLFusionSearchResponse)
def ml_search(request: MLFusionSearchRequest) -> MLFusionSearchResponse:
    """Train all selected models once, then evaluate every subset (size ≥ 2) × fusion rule."""
    dataset_bundle = load_dataset(request.datasetId)
    return execute_ml_fusion_search(
        dataset_bundle["X"],
        dataset_bundle["y"],
        request.models,
        use_cross_validation=request.useCrossValidation,
        cv_folds=request.cvFolds,
    )


@app.post("/ml/search-upload", response_model=MLFusionSearchResponse)
async def ml_search_upload(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    models: str = Form(...),
    use_cross_validation: str = Form("false"),
    cv_folds: int = Form(5),
) -> MLFusionSearchResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    try:
        raw_models = json.loads(models)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="models must be valid JSON.") from exc
    model_configs = _parse_model_configs_json(raw_models)

    ucv = str(use_cross_validation).lower() in ("true", "1", "yes", "on")

    if cv_folds < 2 or cv_folds > 15:
        raise HTTPException(status_code=400, detail="cv_folds must be between 2 and 15.")

    _, dataset_entry, _, _, _ = prepare_uploaded_dataset(
        file.filename,
        content,
        requested_target_column=target_column.strip(),
        requested_feature_columns=parsed_feature_columns,
    )

    X = build_uploaded_feature_matrix(
        dataset_entry["rows"],
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )
    y = np.asarray([row[dataset_entry["target_column"]] for row in dataset_entry["rows"]], dtype=object)
    preprocessor = build_uploaded_preprocessor(
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )

    return execute_ml_fusion_search(
        X,
        y,
        model_configs,
        preprocessor,
        use_cross_validation=ucv,
        cv_folds=cv_folds,
    )


@app.post("/ml/search-stream")
def ml_search_stream(request: MLFusionSearchRequest) -> StreamingResponse:
    """Same as /ml/search but streams NDJSON progress (training phase + combination counts)."""
    dataset_bundle = load_dataset(request.datasetId)
    return StreamingResponse(
        _ndjson_stream_ml_fusion_search(
            dataset_bundle["X"],
            dataset_bundle["y"],
            request.models,
            None,
            request.useCrossValidation,
            request.cvFolds,
        ),
        media_type="application/x-ndjson",
    )


@app.post("/ml/search-upload-stream")
async def ml_search_upload_stream(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    models: str = Form(...),
    use_cross_validation: str = Form("false"),
    cv_folds: int = Form(5),
) -> StreamingResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    try:
        raw_models = json.loads(models)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="models must be valid JSON.") from exc
    model_configs = _parse_model_configs_json(raw_models)

    ucv = str(use_cross_validation).lower() in ("true", "1", "yes", "on")

    if cv_folds < 2 or cv_folds > 15:
        raise HTTPException(status_code=400, detail="cv_folds must be between 2 and 15.")

    _, dataset_entry, _, _, _ = prepare_uploaded_dataset(
        file.filename,
        content,
        requested_target_column=target_column.strip(),
        requested_feature_columns=parsed_feature_columns,
    )

    X = build_uploaded_feature_matrix(
        dataset_entry["rows"],
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )
    y = np.asarray([row[dataset_entry["target_column"]] for row in dataset_entry["rows"]], dtype=object)
    preprocessor = build_uploaded_preprocessor(
        dataset_entry["feature_columns"],
        dataset_entry["feature_types"],
    )

    return StreamingResponse(
        _ndjson_stream_ml_fusion_search(
            X,
            y,
            model_configs,
            preprocessor,
            ucv,
            cv_folds,
        ),
        media_type="application/x-ndjson",
    )


FRONTEND_DIST_DIR = Path(
    os.getenv(
        "FRONTEND_DIST_DIR",
        Path(__file__).resolve().parents[1] / "frontend" / "dist",
    )
).resolve()

if FRONTEND_DIST_DIR.exists():
    assets_dir = FRONTEND_DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str) -> FileResponse:
        requested_path = (FRONTEND_DIST_DIR / full_path).resolve()
        is_inside_dist = requested_path == FRONTEND_DIST_DIR or FRONTEND_DIST_DIR in requested_path.parents

        if full_path and is_inside_dist and requested_path.is_file():
            return FileResponse(requested_path)

        return FileResponse(FRONTEND_DIST_DIR / "index.html")
