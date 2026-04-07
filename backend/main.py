import csv
import io
import json
import os
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pybelief import dempster
from itertools import combinations
from typing import Any, Dict, Iterator, List, Optional, Tuple, Union
from pybelief.core.belief_mass import BeliefMass
from pybelief.fusion.dempster import combine_multiple as dempster_fusion
from pybelief.fusion.pcr import combine_multiple as pcr5_fusion, combine_multiple_pcr6 as pcr6_fusion

from sklearn.base import clone
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
def _classifier_param_schemas() -> dict[str, list[ParamSpec]]:
    return {
        "svm": [
            ParamSpec(key="C", label="C", kind="number", default=1.0, min=1e-4, max=1000.0, step=0.1),
            ParamSpec(key="kernel", label="Kernel", kind="select", default="rbf", options=["rbf", "linear", "poly"]),
        ],
        "knn": [
            ParamSpec(key="n_neighbors", label="n_neighbors", kind="number", default=5, min=1, max=50, step=1),
        ],
        "naive_bayes": [
            ParamSpec(key="var_smoothing", label="var_smoothing", kind="number", default=1e-9, min=1e-12, max=1.0, step=1e-10),
        ],
        "rf": [
            ParamSpec(key="n_estimators", label="n_estimators", kind="number", default=100, min=10, max=500, step=10),
            ParamSpec(key="max_depth", label="max_depth", kind="number", default=0, min=0, max=50, step=1),
        ],
        "gradient_boosting": [
            ParamSpec(key="n_estimators", label="n_estimators", kind="number", default=100, min=10, max=500, step=10),
            ParamSpec(key="learning_rate", label="learning_rate", kind="number", default=0.1, min=0.01, max=1.0, step=0.01),
        ],
        "logistic_regression": [
            ParamSpec(key="C", label="C", kind="number", default=1.0, min=1e-4, max=1000.0, step=0.1),
            ParamSpec(key="max_iter", label="max_iter", kind="number", default=2000, min=100, max=5000, step=100),
        ],
        "decision_tree": [
            ParamSpec(key="max_depth", label="max_depth", kind="number", default=0, min=0, max=50, step=1),
        ],
        "extra_trees": [
            ParamSpec(key="n_estimators", label="n_estimators", kind="number", default=200, min=10, max=500, step=10),
        ],
        "mlp": [
            ParamSpec(key="hidden_layer_1", label="Hidden units (layer 1)", kind="number", default=64, min=8, max=256, step=8),
            ParamSpec(key="hidden_layer_2", label="Hidden units (layer 2)", kind="number", default=32, min=0, max=256, step=8),
            ParamSpec(key="max_iter", label="max_iter", kind="number", default=400, min=50, max=2000, step=50),
        ],
    }


def _classifier_registry() -> list[Classifiers]:
    schemas = _classifier_param_schemas()
    meta = [
        ("svm", "Support Vector Machine (SVM)"),
        ("knn", "K-Nearest Neighbors (KNN)"),
        ("naive_bayes", "Naive Bayes"),
        ("rf", "Random Forest"),
        ("gradient_boosting", "Gradient Boosting"),
        ("logistic_regression", "Logistic Regression"),
        ("decision_tree", "Decision Tree"),
        ("extra_trees", "Extra Trees"),
        ("mlp", "MLP Neural Network"),
    ]
    return [Classifiers(id=i, name=n, param_schema=schemas.get(i, [])) for i, n in meta]


@app.get("/ml/models", response_model=GetClassifiersResponse)
def get_classifiers() -> GetClassifiersResponse:
    """Endpoint to retrieve available classifiers.

    Returns:
        GetClassifiersResponse: A list of supported classifiers with descriptions.
    """
    return GetClassifiersResponse(classifiers=_classifier_registry())

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

def build_classifier(model_id: str, params: Optional[dict[str, Any]] = None):
    """Build sklearn model / pipeline; optional `params` override defaults (validated per model)."""
    p = params or {}

    if model_id == "svm":
        kw: dict[str, Any] = {"probability": True, "kernel": "rbf", "random_state": 42, "C": 1.0}
        if "C" in p:
            kw["C"] = max(1e-4, float(p["C"]))
        if "kernel" in p and p["kernel"] in ("rbf", "linear", "poly"):
            kw["kernel"] = p["kernel"]
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(**kw)),
        ])

    if model_id == "knn":
        n_neighbors = int(p.get("n_neighbors", 5))
        n_neighbors = max(1, min(200, n_neighbors))
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=n_neighbors)),
        ])

    if model_id == "naive_bayes":
        vs = float(p.get("var_smoothing", 1e-9))
        vs = max(1e-12, min(1.0, vs))
        return GaussianNB(var_smoothing=vs)

    if model_id == "gradient_boosting":
        ne = int(p.get("n_estimators", 100))
        ne = max(10, min(500, ne))
        lr = float(p.get("learning_rate", 0.1))
        lr = max(0.01, min(1.0, lr))
        return GradientBoostingClassifier(n_estimators=ne, learning_rate=lr, random_state=42)

    if model_id == "rf":
        ne = int(p.get("n_estimators", 100))
        ne = max(10, min(500, ne))
        md_raw = int(p.get("max_depth", 0))
        md: Optional[int] = None if md_raw <= 0 else max(1, min(100, md_raw))
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=ne, max_depth=md, random_state=42)),
        ])

    if model_id == "logistic_regression":
        C = float(p.get("C", 1.0))
        C = max(1e-4, min(1000.0, C))
        mi = int(p.get("max_iter", 2000))
        mi = max(100, min(10000, mi))
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(C=C, max_iter=mi, random_state=42)),
        ])

    if model_id == "decision_tree":
        md_raw = int(p.get("max_depth", 0))
        md: Optional[int] = None if md_raw <= 0 else max(1, min(100, md_raw))
        return DecisionTreeClassifier(max_depth=md, random_state=42)

    if model_id == "extra_trees":
        ne = int(p.get("n_estimators", 200))
        ne = max(10, min(500, ne))
        return ExtraTreesClassifier(n_estimators=ne, random_state=42)

    if model_id == "mlp":
        h1 = int(p.get("hidden_layer_1", 64))
        h2 = int(p.get("hidden_layer_2", 32))
        h1 = max(8, min(512, h1))
        h2 = max(0, min(512, h2))
        hidden = (h1,) if h2 <= 0 else (h1, h2)
        mi = int(p.get("max_iter", 400))
        mi = max(50, min(5000, mi))
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=hidden, max_iter=mi, random_state=42)),
        ])

    raise HTTPException(status_code=400, detail=f"Unknown classifier: {model_id}")


def build_training_model(
    model_id: str,
    preprocessor: ColumnTransformer | None = None,
    params: Optional[dict[str, Any]] = None,
):
    model = build_classifier(model_id, params)
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


DETAIL_SAMPLE_LIMIT = 150


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
MAX_SEARCH_MODELS = 16
MAX_SEARCH_EVALS = 250_000


def _count_search_evaluations(n_models: int) -> int:
    if n_models < 2:
        return 0
    n_subsets = 2**n_models - n_models - 1
    return n_subsets * len(FUSION_METHODS_SEARCH)


def _build_bbas_per_sample(
    model_probabilities: List[np.ndarray],
    class_labels: List[str],
) -> List[List[BeliefMass]]:
    n_eval = model_probabilities[0].shape[0]
    bbas_per_sample: List[List[BeliefMass]] = []
    for i in range(n_eval):
        sample_bbas = []
        for model_proba in model_probabilities:
            proba = model_proba[i]
            bba = proba_to_bba(proba, class_labels)
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
        scores[j] = sum(float(bba.get_mass(label)) for bba in sample_bbas) / n
    s = float(scores.sum())
    if s > 1e-15:
        scores /= s
    else:
        scores[:] = 1.0 / max(len(class_labels), 1)
    return scores


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

    for idx in range(n_eval):
        sample_bbas = [bbas_per_sample[idx][j] for j in subset_indices]
        try:
            if fusion_method == "dempster":
                try:
                    fused, conflict = dempster_fusion(sample_bbas)
                except ValueError as ve:
                    if "DST fusion impossible" not in str(ve):
                        raise
                    # Total conflict (K=1): no normalized DST result — use mean singleton masses.
                    singleton_scores = _average_singleton_scores_from_bbas(sample_bbas, class_labels)
                    total_conflict += 1.0
                    fused_scores.append(singleton_scores)
                    predicted_label = class_labels[int(np.argmax(singleton_scores))]
                    y_pred.append(label_lookup[predicted_label])
                    continue
            elif fusion_method == "pcr5":
                fused, conflict = pcr5_fusion(sample_bbas)
            elif fusion_method == "pcr6":
                fused, conflict = pcr6_fusion(sample_bbas)
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
                items = list(fused.items())
                if items:
                    best_hyp, _ = max(items, key=lambda x: x[1])
                    predicted_label = next(iter(best_hyp))
                else:
                    singleton_scores = _average_singleton_scores_from_bbas(sample_bbas, class_labels)
                    predicted_label = class_labels[int(np.argmax(singleton_scores))]
                    fused_scores[-1] = singleton_scores

            if predicted_label not in label_lookup:
                singleton_scores = _average_singleton_scores_from_bbas(sample_bbas, class_labels)
                predicted_label = class_labels[int(np.argmax(singleton_scores))]
                fused_scores[-1] = singleton_scores

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
    avg_conflict = (total_conflict / n_eval) if total_conflict > 0 and n_eval > 0 else None
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
