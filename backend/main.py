import csv
import io
import json
import os
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pybelief import dempster
from typing import Any, Union
from pybelief.core.belief_mass import BeliefMass
from pybelief.fusion.dempster import combine_multiple as dempster_fusion
from pybelief.fusion.pcr import combine_multiple as pcr5_fusion, combine_multiple_pcr6 as pcr6_fusion
from typing import List

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, LabelEncoder, OneHotEncoder
from scipy.sparse import issparse

#Importowanie datasetów
from sklearn.datasets import (
    load_breast_cancer,
    load_wine,
    load_iris,
    load_digits,
    make_classification,
    make_moons,
    make_circles,
    make_blobs,
)
#Importowanie modeli
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neural_network import MLPClassifier

from models import Methods, GetMethodsResponse, FusionRequest, FusionResponse, FusionResult, DataSet, GetDataSetsResponse, DatasetPreviewColumn, DatasetPreviewResponse, UploadDatasetResponse, Classifiers, GetClassifiersResponse, ClassifierConfig, MLFusionRequest, MLFusionResponse, MLFusionResult, Example, ExampleSource, GetExamplesResponse

#Funkcje dostepne w API
METHODS = [
    Methods(
        id="dempster",
        name="Dempster-Shafer Theory (DST)",
        description="Classic Dempster's rule with normalization of conflict. Works well when evidence sources have low conflict."
    ),
    Methods(
        id="pcr5",
        name="PCR5 (DSmT)",
        description="Proportional Conflict Redistribution (PCR5). Redistributes conflict instead of normalizing it, handling high-conflict evidence more robustly."
    ),
    Methods(
        id="pcr6",
        name="PCR6 (DSmT)",
        description="Proportional Conflict Redistribution (PCR6). Redistributes conflict for 3+ sources proportionally to contributing masses."
    )
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

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


    fusion_methods = {
        "dempster": dempster_fusion,
        "pcr5": pcr5_fusion,
        "pcr6": pcr6_fusion
    }

    if request.fusion_method not in fusion_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Fusion method '{request.fusion_method}' is not supported."
    )


    if len(request.sources) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"Fusion requires at least 2 sources for fusion."
    )


    # Konwersja danych wejściowych na obiekty BeliefMass
    belief_masses = []

    for source in request.sources:

        #walidacja sumy mas
        total_mass = sum(source.masses.values())
        if total_mass > 1.0:
            raise HTTPException(
                status_code=400,
                detail=f"Function '{source.name}' has total mass {total_mass}, which exceeds 1.0."
        )
        mass_map = {frozenset([k]): v for k, v in source.masses.items()}
        belief_masses.append(BeliefMass(mass_map))

    # Wykonanie fuzji
    try:
        combined_belief, conflict = fusion_methods[request.fusion_method](belief_masses)
    except Exception as e:
        raise HTTPException(
                status_code=400,
                detail=str(e)
        )


    # Przygotowanie odpowiedzi
    result_masses = {','.join(sorted(k)): v for k, v in combined_belief.items()}
    fusion_result = FusionResult(masses=result_masses, conflict=conflict)

    return FusionResponse(
        fusion_method=request.fusion_method,
        result=fusion_result
    )

#---------------Pobranie dostępnych datasetów-----------------

BUILTIN_DATASETS = [
    DataSet(id="breast_cancer", name="Breast Cancer"),
    DataSet(id="wine", name="Wine"),
    DataSet(id="iris", name="Iris"),
    DataSet(id="digits", name="Digits (8x8 images)"),
    DataSet(id="high_dim", name="High Dimensional (Synthetic)"),
    DataSet(id="two_moons", name="Two Moons (Synthetic)"),
    DataSet(id="two_circles", name="Two Circles (Synthetic)"),
    DataSet(id="blobs_3c", name="Blobs - 3 Classes (Synthetic)"),
    DataSet(id="imbalanced_3c", name="Imbalanced - 3 Classes (Synthetic)"),
]

TARGET_COLUMN_ALIASES = {"target", "label", "class", "species"}


def read_uploaded_csv(content: bytes) -> tuple[List[str], List[dict[str, str]]]:
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must be encoded as UTF-8.") from exc

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV must contain a header row.")

    fieldnames = [name.strip() for name in reader.fieldnames if name is not None]
    if not fieldnames:
        raise HTTPException(status_code=400, detail="CSV header row is empty.")
    reader.fieldnames = fieldnames

    rows: list[dict[str, str]] = []

    for row_index, row in enumerate(reader, start=2):
        if row is None or None in row:
            raise HTTPException(status_code=400, detail=f"Malformed CSV row at line {row_index}.")

        normalized_row = {
            column: (value.strip() if value is not None else "")
            for column, value in row.items()
            if column is not None
        }

        if all(value == "" for value in normalized_row.values()):
            continue

        rows.append(normalized_row)

    if not rows:
        raise HTTPException(status_code=400, detail="CSV must contain at least one data row.")

    return fieldnames, rows


def infer_column_kind(values: List[str]) -> str:
    non_empty_values = [value for value in values if value != ""]
    if not non_empty_values:
        return "categorical"

    try:
        for value in non_empty_values:
            float(value)
    except ValueError:
        return "categorical"

    return "numeric"


def get_default_target_column(fieldnames: List[str]) -> str:
    normalized = {name.strip().lower(): name for name in fieldnames}
    for alias in TARGET_COLUMN_ALIASES:
        if alias in normalized:
            return normalized[alias]
    return fieldnames[-1]


def build_dataset_preview(fieldnames: List[str], rows: List[dict[str, str]]) -> DatasetPreviewResponse:
    columns = []
    for column in fieldnames:
        values = [row[column] for row in rows]
        columns.append(
            DatasetPreviewColumn(
                name=column,
                kind=infer_column_kind(values),
                uniqueValues=len(set(values)),
            )
        )

    return DatasetPreviewResponse(
        columns=columns,
        sampleRows=rows[:5],
        totalRows=len(rows),
        suggestedTargetColumn=get_default_target_column(fieldnames),
    )


def normalize_feature_columns(fieldnames: List[str], target_column: str, feature_columns: List[str] | None) -> List[str]:
    if target_column not in fieldnames:
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' does not exist in CSV.")

    if feature_columns is None:
        selected_columns = [column for column in fieldnames if column != target_column]
    else:
        selected_columns = []
        for column in feature_columns:
            if column not in fieldnames:
                raise HTTPException(status_code=400, detail=f"Feature column '{column}' does not exist in CSV.")
            if column == target_column:
                raise HTTPException(status_code=400, detail="Target column cannot also be used as a feature.")
            if column not in selected_columns:
                selected_columns.append(column)

    if not selected_columns:
        raise HTTPException(status_code=400, detail="Select at least one feature column.")

    return selected_columns


def prepare_uploaded_dataset(
    file_name: str,
    content: bytes,
    requested_target_column: str | None = None,
    requested_feature_columns: List[str] | None = None,
) -> tuple[DataSet, dict[str, Any], int, int, List[str]]:
    fieldnames, rows = read_uploaded_csv(content)
    target_column = requested_target_column or get_default_target_column(fieldnames)
    feature_columns = normalize_feature_columns(fieldnames, target_column, requested_feature_columns)

    feature_types: dict[str, str] = {}
    for column in feature_columns:
        values = [row[column] for row in rows]
        if any(value == "" for value in values):
            raise HTTPException(status_code=400, detail=f"Column '{column}' contains empty values.")
        feature_types[column] = infer_column_kind(values)

    target_values = [row[target_column] for row in rows]
    if any(value == "" for value in target_values):
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' contains empty values.")

    classes = sorted(set(target_values))
    if len(classes) < 2:
        raise HTTPException(status_code=400, detail="Dataset must contain at least 2 classes.")

    dataset_id = f"custom_{uuid4().hex[:8]}"
    base_name = os.path.splitext(file_name or "Custom Dataset")[0].replace("_", " ").strip() or "Custom Dataset"
    dataset = DataSet(id=dataset_id, name=f"{base_name} (Uploaded)")

    return dataset, {
        "dataset": dataset,
        "rows": rows,
        "feature_columns": feature_columns,
        "target_column": target_column,
        "feature_types": feature_types,
    }, len(rows), len(feature_columns), classes


def parse_feature_columns_form(feature_columns: str | None) -> List[str] | None:
    if not feature_columns:
        return None

    try:
        decoded_feature_columns = json.loads(feature_columns)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="feature_columns must be a JSON array.") from exc

    if not isinstance(decoded_feature_columns, list) or not all(isinstance(column, str) for column in decoded_feature_columns):
        raise HTTPException(status_code=400, detail="feature_columns must be a JSON array of column names.")

    return decoded_feature_columns


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
CLASSIFIERS = [
    Classifiers(id="svm", name="Support Vector Machine (SVM)"),
    Classifiers(id="knn", name="K-Nearest Neighbors (KNN)"),
    Classifiers(id="naive_bayes", name="Naive Bayes"),
    Classifiers(id="rf", name="Random Forest"),
    Classifiers(id="gradient_boosting", name="Gradient Boosting"),
    Classifiers(id="logistic_regression", name="Logistic Regression"),
    Classifiers(id="decision_tree", name="Decision Tree"),
    Classifiers(id="extra_trees", name="Extra Trees"),
    Classifiers(id="mlp", name="MLP Neural Network"),
]

@app.get("/ml/models", response_model=GetClassifiersResponse)
def get_classifiers() -> GetClassifiersResponse:
    """Endpoint to retrieve available classifiers.

    Returns:
        GetClassifiersResponse: A list of supported classifiers with descriptions.
    """
    return GetClassifiersResponse(classifiers=CLASSIFIERS)

#---------------Fuzja w ML-----------------
#funkcje pomocnicze

#Ładowanie datasetów, gdzie return_X_y=True zwraca X i y jako numpy array
def load_dataset(dataset_id: str):
    if dataset_id == "breast_cancer":
        X, y = load_breast_cancer(return_X_y=True)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "wine":
        X, y = load_wine(return_X_y=True)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "iris":
        X, y = load_iris(return_X_y=True)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "digits":
        X, y = load_digits(return_X_y=True)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "high_dim":
        # Synthetic high-dimensional classification dataset (reproducible)
        X, y = make_classification(
            n_samples=2000,
            n_features=200,
            n_informative=30,
            n_redundant=20,
            n_repeated=0,
            n_classes=3,
            n_clusters_per_class=2,
            class_sep=1.0,
            flip_y=0.01,
            random_state=42,
        )
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "two_moons":
        X, y = make_moons(n_samples=1200, noise=0.25, random_state=42)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "two_circles":
        X, y = make_circles(n_samples=1200, noise=0.08, factor=0.45, random_state=42)
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "blobs_3c":
        X, y = make_blobs(
            n_samples=1500,
            centers=3,
            n_features=6,
            cluster_std=[1.5, 2.0, 1.0],
            random_state=42,
        )
        return {"kind": "array", "X": X, "y": y}
    if dataset_id == "imbalanced_3c":
        X, y = make_classification(
            n_samples=2500,
            n_features=20,
            n_informative=10,
            n_redundant=4,
            n_repeated=0,
            n_classes=3,
            n_clusters_per_class=2,
            weights=[0.70, 0.20, 0.10],
            class_sep=1.0,
            flip_y=0.02,
            random_state=42,
        )
        return {"kind": "array", "X": X, "y": y}
    raise HTTPException(status_code=400, detail="Unknown dataset")


def build_uploaded_feature_matrix(rows: List[dict[str, str]], feature_columns: List[str], feature_types: dict[str, str]) -> np.ndarray:
    matrix = []
    for row in rows:
        matrix.append([
            float(row[column]) if feature_types[column] == "numeric" else row[column]
            for column in feature_columns
        ])
    return np.asarray(matrix, dtype=object)


def build_uploaded_preprocessor(feature_columns: List[str], feature_types: dict[str, str]) -> ColumnTransformer:
    numeric_indices = [index for index, column in enumerate(feature_columns) if feature_types[column] == "numeric"]
    categorical_indices = [index for index, column in enumerate(feature_columns) if feature_types[column] != "numeric"]

    transformers = []
    if numeric_indices:
        transformers.append(
            (
                "numeric",
                FunctionTransformer(lambda values: np.asarray(values, dtype=float)),
                numeric_indices,
            )
        )
    if categorical_indices:
        transformers.append(
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_indices,
            )
        )

    return ColumnTransformer(transformers=transformers, sparse_threshold=0)

def build_classifier(model_id: str):
    """Tworzy model z domyślnymi parametrami na podstawie ID.

    Args:
        model_id: ID modelu

    Returns:
        Gotowy model (Pipeline lub classifier)
    """
    if model_id == "svm":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(probability=True, kernel="rbf", random_state=42))
        ])

    if model_id == "knn":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=5))
        ])

    if model_id == "naive_bayes":
        return GaussianNB()

    if model_id == "gradient_boosting":
        return GradientBoostingClassifier(n_estimators=100, random_state=42)

    if model_id == "rf":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=100, random_state=42))
        ])

    if model_id == "logistic_regression":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=2000, random_state=42))
        ])

    if model_id == "decision_tree":
        return DecisionTreeClassifier(random_state=42)

    if model_id == "extra_trees":
        return ExtraTreesClassifier(n_estimators=200, random_state=42)

    if model_id == "mlp":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=400, random_state=42))
        ])

    raise HTTPException(status_code=400, detail=f"Unknown classifier: {model_id}")


def build_training_model(model_id: str, preprocessor: ColumnTransformer | None = None):
    model = build_classifier(model_id)
    if preprocessor is None:
        return model

    return Pipeline([
        ("preprocessor", clone(preprocessor)),
        ("model", model),
    ])

def proba_to_bba(proba: np.ndarray, class_labels: List[str]) -> BeliefMass:
    masses = {}
    for i, label in enumerate(class_labels):
        masses[frozenset([label])] = float(proba[i])

    return BeliefMass(masses).normalize() #NIE JESTEM pewna co do normalize(), czy nie usunąć!-------


def calculate_classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_score: np.ndarray | None = None,
) -> dict[str, float | None]:
    metrics: dict[str, float | None] = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
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


def execute_ml_fusion(
    X: np.ndarray,
    y: np.ndarray,
    model_ids: List[str],
    fusion_method: str,
    preprocessor: ColumnTransformer | None = None,
) -> MLFusionResponse:
    if issparse(X):
        X = X.toarray()

    y = np.asarray(y)

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    class_labels = [str(index) for index in range(len(le.classes_))]
    label_lookup = {label: index for index, label in enumerate(class_labels)}

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.25, random_state=42, stratify=y_encoded
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Dataset cannot be split for training: {str(exc)}") from exc

    bbas_per_sample: List[List[BeliefMass]] = []

    classifiers = []
    model_probabilities: List[np.ndarray] = []
    for model_id in model_ids:
        model = build_training_model(model_id, preprocessor)
        try:
            model.fit(X_train, y_train)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Model '{model_id}' could not be trained: {str(exc)}") from exc
        classifiers.append(model)
        model_probabilities.append(model.predict_proba(X_test))

    per_model_results = []
    for model_id, model, model_proba in zip(model_ids, classifiers, model_probabilities):
        y_pred_model = model.predict(X_test)
        model_metrics = calculate_classification_metrics(y_test, y_pred_model, model_proba)
        per_model_results.append(
            MLFusionResult(
                kind="model",
                model_id=model_id,
                fusion_method=fusion_method,
                accuracy=model_metrics["accuracy"],
                precision=model_metrics["precision"],
                recall=model_metrics["recall"],
                f1_score=model_metrics["f1_score"],
                roc_auc=model_metrics["roc_auc"],
                conflict=None
            )
        )

    for i in range(len(X_test)):
        sample_bbas = []

        for model_proba in model_probabilities:
            proba = model_proba[i]
            bba = proba_to_bba(proba, class_labels)
            sample_bbas.append(bba)

        bbas_per_sample.append(sample_bbas)

    y_pred = []
    fused_scores = []
    total_conflict = 0.0

    for idx, sample_bbas in enumerate(bbas_per_sample):
        try:
            if fusion_method == "dempster":
                fused, conflict = dempster_fusion(sample_bbas)
            elif fusion_method == "pcr5":
                fused, conflict = pcr5_fusion(sample_bbas)
            else:
                raise HTTPException(status_code=400, detail="Unknown fusion method")

            if conflict is not None:
                total_conflict += conflict

            singleton_scores = np.array(
                [float(fused.get_mass(label)) for label in class_labels],
                dtype=float,
            )
            fused_scores.append(singleton_scores)

            if np.any(singleton_scores):
                predicted_label = class_labels[int(np.argmax(singleton_scores))]
            else:
                best_label = max(fused.items(), key=lambda x: x[1])[0]
                predicted_label = next(iter(best_label))

            if predicted_label not in label_lookup:
                raise HTTPException(status_code=500, detail=f"Unknown fused label '{predicted_label}'.")
            y_pred.append(label_lookup[predicted_label])
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Fusion error at sample {idx} with {len(sample_bbas)} models: {str(e)}"
            )

    fused_metrics = calculate_classification_metrics(
        y_test,
        np.asarray(y_pred),
        np.asarray(fused_scores) if fused_scores else None,
    )
    avg_conflict = (total_conflict / len(X_test)) if total_conflict > 0 and len(X_test) > 0 else None

    fused_result = MLFusionResult(
        kind="fusion",
        model_id=None,
        fusion_method=fusion_method,
        accuracy=fused_metrics["accuracy"],
        precision=fused_metrics["precision"],
        recall=fused_metrics["recall"],
        f1_score=fused_metrics["f1_score"],
        roc_auc=fused_metrics["roc_auc"],
        conflict=avg_conflict
    )

    return MLFusionResponse(results=[*per_model_results, fused_result])

@app.post("/ml/run", response_model=MLFusionResponse)
def fuse_ml(request: MLFusionRequest):
    """Uruchamia ML pipeline: trenuje modele, fuzja predykcji, zwraca accuracy.

    Frontend wysyła:
    {
      "datasetId": "iris",
      "models": ["svm", "rf"],
      "fusionMethod": "dempster"
    }
    """
    dataset_bundle = load_dataset(request.datasetId)
    return execute_ml_fusion(
        dataset_bundle["X"],
        dataset_bundle["y"],
        request.models,
        request.fusionMethod,
    )


@app.post("/ml/run-upload", response_model=MLFusionResponse)
async def fuse_uploaded_ml(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form(...),
    models: str = Form(...),
    fusion_method: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    parsed_feature_columns = parse_feature_columns_form(feature_columns)
    try:
        model_ids = json.loads(models)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="models must be a JSON array.") from exc
    if not isinstance(model_ids, list) or not all(isinstance(model_id, str) for model_id in model_ids):
        raise HTTPException(status_code=400, detail="models must be a JSON array of model IDs.")

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

    return execute_ml_fusion(X, y, model_ids, fusion_method, preprocessor)
