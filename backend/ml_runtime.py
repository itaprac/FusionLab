import csv
import io
import json
import os
from uuid import uuid4
from typing import Any, List, Optional

import numpy as np
from fastapi import HTTPException
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.datasets import (
    load_breast_cancer,
    load_digits,
    load_iris,
    load_wine,
    make_blobs,
    make_circles,
    make_classification,
    make_moons,
)
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from models import (
    Classifiers,
    DataSet,
    DatasetPreviewColumn,
    DatasetPreviewResponse,
    ParamSpec,
)


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

BUILTIN_DATASET_NAMES = {dataset.id: dataset.name for dataset in BUILTIN_DATASETS}
TARGET_COLUMN_ALIASES = {"target", "label", "class", "species"}
MAX_UPLOAD_CSV_BYTES = 2 * 1024 * 1024
MAX_UPLOAD_CSV_ROWS = 5000
MAX_UPLOAD_CSV_COLUMNS = 100
MAX_UPLOAD_CSV_CLASSES = 25
MAX_ML_DATASET_ROWS = 5000
MAX_ML_DATASET_FEATURES = 250
MAX_ML_DATASET_CLASSES = 25
MAX_ML_DATASET_CELLS = 500_000

BUILTIN_DATASET_SCRIPT_SPECS: dict[str, dict[str, Any]] = {
    "breast_cancer": {
        "imports": ["from sklearn.datasets import load_breast_cancer"],
        "body": "X, y = load_breast_cancer(return_X_y=True)",
    },
    "wine": {
        "imports": ["from sklearn.datasets import load_wine"],
        "body": "X, y = load_wine(return_X_y=True)",
    },
    "iris": {
        "imports": ["from sklearn.datasets import load_iris"],
        "body": "X, y = load_iris(return_X_y=True)",
    },
    "digits": {
        "imports": ["from sklearn.datasets import load_digits"],
        "body": "X, y = load_digits(return_X_y=True)",
    },
    "high_dim": {
        "imports": ["from sklearn.datasets import make_classification"],
        "body": "\n".join(
            [
                "X, y = make_classification(",
                "    n_samples=2000,",
                "    n_features=200,",
                "    n_informative=30,",
                "    n_redundant=20,",
                "    n_repeated=0,",
                "    n_classes=3,",
                "    n_clusters_per_class=2,",
                "    class_sep=1.0,",
                "    flip_y=0.01,",
                "    random_state=42,",
                ")",
            ]
        ),
    },
    "two_moons": {
        "imports": ["from sklearn.datasets import make_moons"],
        "body": "X, y = make_moons(n_samples=1200, noise=0.25, random_state=42)",
    },
    "two_circles": {
        "imports": ["from sklearn.datasets import make_circles"],
        "body": "X, y = make_circles(n_samples=1200, noise=0.08, factor=0.45, random_state=42)",
    },
    "blobs_3c": {
        "imports": ["from sklearn.datasets import make_blobs"],
        "body": "\n".join(
            [
                "X, y = make_blobs(",
                "    n_samples=1500,",
                "    centers=3,",
                "    n_features=6,",
                "    cluster_std=[1.5, 2.0, 1.0],",
                "    random_state=42,",
                ")",
            ]
        ),
    },
    "imbalanced_3c": {
        "imports": ["from sklearn.datasets import make_classification"],
        "body": "\n".join(
            [
                "X, y = make_classification(",
                "    n_samples=2500,",
                "    n_features=20,",
                "    n_informative=10,",
                "    n_redundant=4,",
                "    n_repeated=0,",
                "    n_classes=3,",
                "    n_clusters_per_class=2,",
                "    weights=[0.70, 0.20, 0.10],",
                "    class_sep=1.0,",
                "    flip_y=0.02,",
                "    random_state=42,",
                ")",
            ]
        ),
    },
}


def get_builtin_dataset_script_spec(dataset_id: str) -> dict[str, Any]:
    spec = BUILTIN_DATASET_SCRIPT_SPECS.get(dataset_id)
    if spec is None:
        raise HTTPException(status_code=400, detail="Unknown dataset")
    return spec


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


def read_uploaded_csv(content: bytes) -> tuple[List[str], List[dict[str, str]]]:
    if len(content) > MAX_UPLOAD_CSV_BYTES:
        limit_mb = MAX_UPLOAD_CSV_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"CSV file is too large. Upload at most {limit_mb:.0f} MB.",
        )

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
    if len(fieldnames) > MAX_UPLOAD_CSV_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"CSV has too many columns. Maximum allowed is {MAX_UPLOAD_CSV_COLUMNS}.",
        )
    if len(set(fieldnames)) != len(fieldnames):
        raise HTTPException(status_code=400, detail="CSV header contains duplicate column names.")
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
        if len(rows) > MAX_UPLOAD_CSV_ROWS:
            raise HTTPException(
                status_code=400,
                detail=f"CSV has too many rows. Maximum allowed is {MAX_UPLOAD_CSV_ROWS}.",
            )

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
    if len(classes) > MAX_UPLOAD_CSV_CLASSES:
        raise HTTPException(
            status_code=400,
            detail=f"Dataset has too many classes. Maximum allowed is {MAX_UPLOAD_CSV_CLASSES}.",
        )

    dataset_id = f"custom_{uuid4().hex[:8]}"
    base_name = os.path.splitext(file_name or "Custom Dataset")[0].replace("_", " ").strip() or "Custom Dataset"
    dataset = DataSet(id=dataset_id, name=f"{base_name} (Uploaded)")

    return dataset, {
        "dataset": dataset,
        "rows": rows,
        "feature_columns": feature_columns,
        "target_column": target_column,
        "feature_types": feature_types,
        "original_filename": file_name or "custom_dataset.csv",
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


def normalize_model_params(model_id: str, params: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    p = params or {}

    if model_id == "svm":
        normalized: dict[str, Any] = {"C": 1.0, "kernel": "rbf"}
        if "C" in p:
            normalized["C"] = max(1e-4, min(1000.0, float(p["C"])))
        if "kernel" in p and p["kernel"] in ("rbf", "linear", "poly"):
            normalized["kernel"] = p["kernel"]
        return normalized

    if model_id == "knn":
        n_neighbors = int(p.get("n_neighbors", 5))
        return {"n_neighbors": max(1, min(200, n_neighbors))}

    if model_id == "naive_bayes":
        vs = float(p.get("var_smoothing", 1e-9))
        return {"var_smoothing": max(1e-12, min(1.0, vs))}

    if model_id == "gradient_boosting":
        ne = int(p.get("n_estimators", 100))
        lr = float(p.get("learning_rate", 0.1))
        return {
            "n_estimators": max(10, min(500, ne)),
            "learning_rate": max(0.01, min(1.0, lr)),
        }

    if model_id == "rf":
        ne = int(p.get("n_estimators", 100))
        md_raw = int(p.get("max_depth", 0))
        md = None if md_raw <= 0 else max(1, min(100, md_raw))
        return {
            "n_estimators": max(10, min(500, ne)),
            "max_depth": md,
        }

    if model_id == "logistic_regression":
        c_value = float(p.get("C", 1.0))
        max_iter = int(p.get("max_iter", 2000))
        return {
            "C": max(1e-4, min(1000.0, c_value)),
            "max_iter": max(100, min(10000, max_iter)),
        }

    if model_id == "decision_tree":
        md_raw = int(p.get("max_depth", 0))
        return {"max_depth": None if md_raw <= 0 else max(1, min(100, md_raw))}

    if model_id == "extra_trees":
        ne = int(p.get("n_estimators", 200))
        return {"n_estimators": max(10, min(500, ne))}

    if model_id == "mlp":
        h1 = int(p.get("hidden_layer_1", 64))
        h2 = int(p.get("hidden_layer_2", 32))
        max_iter = int(p.get("max_iter", 400))
        return {
            "hidden_layer_1": max(8, min(512, h1)),
            "hidden_layer_2": max(0, min(512, h2)),
            "max_iter": max(50, min(5000, max_iter)),
        }

    raise HTTPException(status_code=400, detail=f"Unknown classifier: {model_id}")


def build_classifier(model_id: str, params: Optional[dict[str, Any]] = None):
    normalized = normalize_model_params(model_id, params)

    if model_id == "svm":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(probability=True, kernel=normalized["kernel"], random_state=42, C=normalized["C"])),
        ])

    if model_id == "knn":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=normalized["n_neighbors"])),
        ])

    if model_id == "naive_bayes":
        return GaussianNB(var_smoothing=normalized["var_smoothing"])

    if model_id == "gradient_boosting":
        return GradientBoostingClassifier(
            n_estimators=normalized["n_estimators"],
            learning_rate=normalized["learning_rate"],
            random_state=42,
        )

    if model_id == "rf":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(
                n_estimators=normalized["n_estimators"],
                max_depth=normalized["max_depth"],
                random_state=42,
            )),
        ])

    if model_id == "logistic_regression":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(C=normalized["C"], max_iter=normalized["max_iter"], random_state=42)),
        ])

    if model_id == "decision_tree":
        return DecisionTreeClassifier(max_depth=normalized["max_depth"], random_state=42)

    if model_id == "extra_trees":
        return ExtraTreesClassifier(n_estimators=normalized["n_estimators"], random_state=42)

    if model_id == "mlp":
        h1 = normalized["hidden_layer_1"]
        h2 = normalized["hidden_layer_2"]
        hidden = (h1,) if h2 <= 0 else (h1, h2)
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=hidden, max_iter=normalized["max_iter"], random_state=42)),
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


def assert_ml_dataset_within_limits(
    X: np.ndarray,
    y: np.ndarray,
    *,
    context: str = "Dataset",
) -> None:
    rows = int(X.shape[0]) if getattr(X, "ndim", 0) >= 1 else 0
    features = int(X.shape[1]) if getattr(X, "ndim", 0) >= 2 else 1
    classes = int(len(set(np.asarray(y, dtype=object).tolist())))
    cells = rows * features

    if rows > MAX_ML_DATASET_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"{context} has too many rows for ML training. Maximum allowed is {MAX_ML_DATASET_ROWS}.",
        )
    if features > MAX_ML_DATASET_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"{context} has too many feature columns for ML training. Maximum allowed is {MAX_ML_DATASET_FEATURES}.",
        )
    if classes > MAX_ML_DATASET_CLASSES:
        raise HTTPException(
            status_code=400,
            detail=f"{context} has too many classes for ML training. Maximum allowed is {MAX_ML_DATASET_CLASSES}.",
        )
    if cells > MAX_ML_DATASET_CELLS:
        raise HTTPException(
            status_code=400,
            detail=f"{context} is too large for ML training. Maximum allowed is {MAX_ML_DATASET_CELLS} feature cells.",
        )
