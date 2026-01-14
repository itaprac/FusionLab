from encodings.punycode import digits
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pybelief import dempster
from typing import Union
from pybelief.core.belief_mass import BeliefMass
from pybelief.fusion.dempster import combine_multiple as dempster_fusion
from pybelief.fusion.pcr import combine_multiple as pcr5_fusion
from typing import List

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import issparse

#Importowanie datasetów
from sklearn.datasets import load_breast_cancer, load_wine, load_iris, load_digits, make_classification
#Importowanie modeli
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier

from models import Methods, GetMethodsResponse, FusionRequest, FusionResponse, FusionResult, DataSet, GetDataSetsResponse, Classifiers, GetClassifiersResponse, ClassifierConfig, MLFusionRequest, MLFusionResponse, MLFusionResult, Example, ExampleSource, GetExamplesResponse

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
        "pcr5": pcr5_fusion
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

DATASETS = [
    DataSet(id="breast_cancer", name="Breast Cancer"),
    DataSet(id="wine", name="Wine"),
    DataSet(id="iris", name="Iris"),
    DataSet(id="digits", name="Digits (8x8 images)"),
    DataSet(id="high_dim", name="High Dimensional (Synthetic)")
]


@app.get("/ml/datasets", response_model=GetDataSetsResponse)
def get_datasets() -> GetDataSetsResponse:
    """Endpoint to retrieve available datasets.

    Returns:
        GetDataSetsResponse: A list of supported datasets with descriptions.
    """
    return GetDataSetsResponse(datasets=DATASETS)


#---------------Pobranie dostępnych modeli-----------------
CLASSIFIERS = [
    Classifiers(id="svm", name="Support Vector Machine (SVM)"),
    Classifiers(id="knn", name="K-Nearest Neighbors (KNN)"),
    Classifiers(id="naive_bayes", name="Naive Bayes"),
    Classifiers(id="rf", name="Random Forest"),
    Classifiers(id="gradient_boosting", name="Gradient Boosting")
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
        return load_breast_cancer(return_X_y=True)
    if dataset_id == "wine":
        return load_wine(return_X_y=True)
    if dataset_id == "iris":
        return load_iris(return_X_y=True)
    if dataset_id == "digits":
        return load_digits(return_X_y=True)
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
        return X, y
    raise HTTPException(status_code=400, detail="Unknown dataset")

def build_classifier(model_id: str):
    """Tworzy model z domyślnymi parametrami na podstawie ID.

    Args:
        model_id: ID modelu ('svm', 'knn', 'naive_bayes', 'gradient_boosting', 'rf')

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

    raise HTTPException(status_code=400, detail=f"Unknown classifier: {model_id}")

def proba_to_bba(proba: np.ndarray, class_labels: List[str]) -> BeliefMass:
    masses = {}
    for i, label in enumerate(class_labels):
        masses[frozenset([label])] = float(proba[i])

    return BeliefMass(masses).normalize() #NIE JESTEM pewna co do normalize(), czy nie usunąć!-------

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
    # Ładowanie danych
    X, y = load_dataset(request.datasetId)

# Jeśli w przyszłości będzie możliwość łądowania X którą jest macierzą rzadką to trzeba to obsłużyć
# if issparse(X):
#   X = X.toarray()
# Na wypadek gdy y nie jest w formacie numpy array, u nas return_X_y=True zwraca numpy array
#   y = np.asarray(y)

# Kouje etykiedy do liczb całkowitych jeśli są w innej formie, aktualnie u nas wszystkie dataset'y mają y jako liczby całkowite
#   le = LabelEncoder()
#   y_encoded = le.fit_transform(y)

    # Lista unikalnych etykiet klas jako stringi np. y = [0,1,1,2,2,0] => ["0","1","2"]
    class_labels = [str(c) for c in np.unique(y)]

    # Podział na zbiór treningowy i testowy
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # Przechowywanie BBA dla każdego testowego przykładu
    bbas_per_sample: List[List[BeliefMass]] = []

    # 1. Trenowanie modeli z listy ID
    classifiers = []
    for model_id in request.models:
        model = build_classifier(model_id)
        model.fit(X_train, y_train)
        classifiers.append(model)

    # 1b. Accuracy dla każdego modelu osobno
    per_model_results = []
    for model_id, model in zip(request.models, classifiers):
        y_pred_model = model.predict(X_test)
        model_acc = float(np.mean(np.array(y_pred_model) == y_test))
        per_model_results.append(
            MLFusionResult(
                kind="model",
                model_id=model_id,
                fusion_method=request.fusionMethod,
                accuracy=model_acc,
                conflict=None
            )
        )

    # 2. Build BBA per test sample
    for i in range(len(X_test)):
        sample_bbas = []

        for model in classifiers:
            proba = model.predict_proba(X_test[i].reshape(1, -1))[0]
            bba = proba_to_bba(proba, class_labels)
            sample_bbas.append(bba)

        bbas_per_sample.append(sample_bbas)

    # 3. Fuse per sample + predict class
    y_pred = []
    total_conflict = 0.0

    for idx, sample_bbas in enumerate(bbas_per_sample):
        try:
            if request.fusionMethod == "dempster":
                fused, conflict = dempster_fusion(sample_bbas)
            elif request.fusionMethod == "pcr5":
                fused, conflict = pcr5_fusion(sample_bbas)
            else:
                raise HTTPException(status_code=400, detail="Unknown fusion method")

            # conflict może być None przy 3+ modelach
            if conflict is not None:
                total_conflict += conflict

            # decision = max belief
            best_label = max(fused.items(), key=lambda x: x[1])[0]
            y_pred.append(int(list(best_label)[0]))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Fusion error at sample {idx} with {len(sample_bbas)} models: {str(e)}"
            )

    # 4. Accuracy
    accuracy = float(np.mean(np.array(y_pred) == y_test))
    # Avg conflict - dla 3+ modeli wysyłamy None (konflikt kumulatywny, nie pojedyncza wartość)
    avg_conflict = (total_conflict / len(X_test)) if total_conflict > 0 and len(X_test) > 0 else None

    # 5. Przygotowanie odpowiedzi
    fused_result = MLFusionResult(
        kind="fusion",
        model_id=None,
        fusion_method=request.fusionMethod,
        accuracy=accuracy,
        conflict=avg_conflict
    )

    return MLFusionResponse(results=[*per_model_results, fused_result])
