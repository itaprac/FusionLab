import json
from textwrap import dedent

from models import ClassifierConfig
from ml_runtime import BUILTIN_DATASET_NAMES, get_builtin_dataset_script_spec, normalize_model_params


def _json_literal(value):
    return json.dumps(value, ensure_ascii=True, indent=4)


def _build_models_config(models: list[ClassifierConfig]) -> str:
    normalized = [{"id": model.id, "params": normalize_model_params(model.id, model.params)} for model in models]
    return _json_literal(normalized)


def _build_builtin_imports(dataset_imports: list[str]) -> str:
    lines = [
        "import numpy as np",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.preprocessing import StandardScaler",
        "from sklearn.svm import SVC",
        "from sklearn.neighbors import KNeighborsClassifier",
        "from sklearn.naive_bayes import GaussianNB",
        "from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, ExtraTreesClassifier",
        "from sklearn.linear_model import LogisticRegression",
        "from sklearn.tree import DecisionTreeClassifier",
        "from sklearn.neural_network import MLPClassifier",
        *dataset_imports,
        "",
        "from pybelief.core.belief_mass import BeliefMass",
        "from pybelief.fusion.dempster import combine_multiple as dempster_fusion",
        "from pybelief.fusion.pcr import combine_multiple as pcr5_fusion, combine_multiple_pcr6 as pcr6_fusion",
    ]
    return "\n".join(lines)


def _build_uploaded_imports() -> str:
    return "\n".join(
        [
            "import numpy as np",
            "import pandas as pd",
            "from sklearn.pipeline import Pipeline",
            "from sklearn.preprocessing import StandardScaler",
            "from sklearn.svm import SVC",
            "from sklearn.neighbors import KNeighborsClassifier",
            "from sklearn.naive_bayes import GaussianNB",
            "from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, ExtraTreesClassifier",
            "from sklearn.linear_model import LogisticRegression",
            "from sklearn.tree import DecisionTreeClassifier",
            "from sklearn.neural_network import MLPClassifier",
            "",
            "from pybelief.core.belief_mass import BeliefMass",
            "from pybelief.fusion.dempster import combine_multiple as dempster_fusion",
            "from pybelief.fusion.pcr import combine_multiple as pcr5_fusion, combine_multiple_pcr6 as pcr6_fusion",
        ]
    )


def _build_classifier_function() -> str:
    return dedent(
        """
        def build_model(model_id, params):
            if model_id == "svm":
                return Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", SVC(probability=True, kernel=params["kernel"], C=params["C"], random_state=42)),
                ])
            if model_id == "knn":
                return Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", KNeighborsClassifier(n_neighbors=params["n_neighbors"])),
                ])
            if model_id == "naive_bayes":
                return GaussianNB(var_smoothing=params["var_smoothing"])
            if model_id == "gradient_boosting":
                return GradientBoostingClassifier(
                    n_estimators=params["n_estimators"],
                    learning_rate=params["learning_rate"],
                    random_state=42,
                )
            if model_id == "rf":
                return Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", RandomForestClassifier(
                        n_estimators=params["n_estimators"],
                        max_depth=params["max_depth"],
                        random_state=42,
                    )),
                ])
            if model_id == "logistic_regression":
                return Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", LogisticRegression(C=params["C"], max_iter=params["max_iter"], random_state=42)),
                ])
            if model_id == "decision_tree":
                return DecisionTreeClassifier(max_depth=params["max_depth"], random_state=42)
            if model_id == "extra_trees":
                return ExtraTreesClassifier(n_estimators=params["n_estimators"], random_state=42)
            if model_id == "mlp":
                hidden = (params["hidden_layer_1"],) if params["hidden_layer_2"] <= 0 else (params["hidden_layer_1"], params["hidden_layer_2"])
                return Pipeline([
                    ("scaler", StandardScaler()),
                    ("clf", MLPClassifier(hidden_layer_sizes=hidden, max_iter=params["max_iter"], random_state=42)),
                ])
            raise ValueError(f"Unknown model: {model_id}")
        """
    ).strip()


def _build_fusion_helpers() -> str:
    return dedent(
        """
        def proba_to_bba(proba_row, labels):
            masses = {frozenset([label]): float(prob) for label, prob in zip(labels, proba_row)}
            return BeliefMass(masses).normalize()


        def align_proba(model, X, labels):
            raw = model.predict_proba(X)
            aligned = np.zeros((len(X), len(labels)), dtype=float)
            local_labels = [str(label) for label in model.classes_]
            for i, label in enumerate(local_labels):
                aligned[:, labels.index(label)] = raw[:, i]
            return aligned


        def fuse_sample(sample_bbas, labels, fusion_method):
            if fusion_method == "dempster":
                fused, _ = dempster_fusion(sample_bbas)
            elif fusion_method == "pcr5":
                fused, _ = pcr5_fusion(sample_bbas)
            elif fusion_method == "pcr6":
                fused, _ = pcr6_fusion(sample_bbas)
            else:
                raise ValueError(f"Unknown fusion method: {fusion_method}")

            scores = np.array([float(fused.get_mass(label)) for label in labels], dtype=float)
            if not np.any(scores):
                scores[:] = 1.0 / len(labels)
            return labels[int(np.argmax(scores))]
        """
    ).strip()


def _build_run_block(dataset_loader: str, is_uploaded: bool) -> str:
    load_block = "X, y = load_dataset()" if not is_uploaded else "X, y = load_dataset()"
    return dedent(
        f"""
        {dataset_loader}


        def main():
            {load_block}
            labels = sorted({{str(label) for label in y}})
            trained_models = []

            for model_cfg in MODELS:
                model = build_model(model_cfg["id"], model_cfg["params"])
                model.fit(X, y)
                trained_models.append((model_cfg["id"], model))

            model_probabilities = []
            for _model_id, model in trained_models:
                model_probabilities.append(align_proba(model, X, labels))

            fused_predictions = []
            for row_idx in range(len(X)):
                sample_bbas = [proba_to_bba(proba[row_idx], labels) for proba in model_probabilities]
                fused_predictions.append(fuse_sample(sample_bbas, labels, FUSION_METHOD))

            print("Done.")
            print("Models:", [model_cfg["id"] for model_cfg in MODELS])
            print("Fusion:", FUSION_METHOD)
            print("First fused predictions:", fused_predictions[:10])


        if __name__ == "__main__":
            main()
        """
    ).strip()


def generate_builtin_export_code(
    dataset_id: str,
    models: list[ClassifierConfig],
    fusion_method: str,
    use_cross_validation: bool,
    cv_folds: int,
) -> tuple[str, str]:
    del use_cross_validation
    del cv_folds
    dataset_name = BUILTIN_DATASET_NAMES.get(dataset_id, dataset_id)
    dataset_spec = get_builtin_dataset_script_spec(dataset_id)

    script = "\n\n".join(
        [
            "# Generated by FusionLab. Minimal runnable export.",
            _build_builtin_imports(dataset_spec["imports"]),
            "\n".join(
                [
                    f"DATASET_NAME = {dataset_name!r}",
                    f"FUSION_METHOD = {fusion_method!r}",
                    f"MODELS = {_build_models_config(models)}",
                ]
            ),
            _build_classifier_function(),
            _build_fusion_helpers(),
            _build_run_block(
                dedent(
                    f"""
                    def load_dataset():
                        {dataset_spec['body']}
                        y = np.asarray([str(label) for label in y], dtype=object)
                        return X, y
                    """
                ).strip(),
                is_uploaded=False,
            ),
        ]
    ).strip() + "\n"

    return script, f"mlfusion_export_{dataset_id}.py"


def generate_uploaded_export_code(
    dataset_name: str,
    original_filename: str,
    target_column: str,
    feature_columns: list[str],
    feature_types: dict[str, str],
    models: list[ClassifierConfig],
    fusion_method: str,
    use_cross_validation: bool,
    cv_folds: int,
) -> tuple[str, str]:
    del feature_types
    del use_cross_validation
    del cv_folds

    script = "\n\n".join(
        [
            "# Generated by FusionLab. Minimal runnable export.",
            "# Set CSV_PATH to your local dataset file before running.",
            _build_uploaded_imports(),
            "\n".join(
                [
                    f"DATASET_NAME = {dataset_name!r}",
                    f"CSV_PATH = {'YOUR_DATASET_PATH/' + original_filename!r}",
                    f"TARGET_COLUMN = {target_column!r}",
                    f"FEATURE_COLUMNS = {_json_literal(feature_columns)}",
                    f"FUSION_METHOD = {fusion_method!r}",
                    f"MODELS = {_build_models_config(models)}",
                ]
            ),
            _build_classifier_function(),
            _build_fusion_helpers(),
            _build_run_block(
                dedent(
                    """
                    def load_dataset():
                        df = pd.read_csv(CSV_PATH)
                        X = pd.get_dummies(df[FEATURE_COLUMNS], drop_first=False)
                        y = df[TARGET_COLUMN].astype(str).to_numpy()
                        return X.to_numpy(), y
                    """
                ).strip(),
                is_uploaded=True,
            ),
        ]
    ).strip() + "\n"

    stem = original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename
    safe_stem = stem.replace(" ", "_").lower() or "custom_dataset"
    return script, f"mlfusion_export_{safe_stem}.py"
