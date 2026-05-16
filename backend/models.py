from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional




#REGUEST BODY{
#
# #Lista źróde np. Ekspert1, Ekspert2
class Source(BaseModel):
    name: str
    masses: Dict[str, float]

#Dane jako będą przychodzić w zapytaniach od frontendu
class FusionRequest(BaseModel):
    fusion_method: str
    sources: List[Source]
#}END REGUEST BODY

#RESPONSE BODY{

#Response 200 - udany
class FusionResult(BaseModel):
    masses: Dict[str, float]
    conflict: Optional[float]

class FusionResponse(BaseModel):
    fusion_method: str
    result: FusionResult



#}END RESPONSE BODY

class Methods(BaseModel):
    id: str
    name:str
    description: str
    category: str = "other"

class GetMethodsResponse(BaseModel):
    methods: List[Methods]

class DataSet(BaseModel):
    id : str
    name: str

class GetDataSetsResponse(BaseModel):
    datasets: List[DataSet]

class DatasetPreviewColumn(BaseModel):
    name: str
    kind: str
    uniqueValues: int

class DatasetPreviewResponse(BaseModel):
    columns: List[DatasetPreviewColumn]
    sampleRows: List[Dict[str, str]]
    totalRows: int
    suggestedTargetColumn: str

class UploadDatasetResponse(BaseModel):
    dataset: DataSet
    rows: int
    features: int
    classes: List[str]

class ParamSpec(BaseModel):
    key: str
    label: str
    kind: str  # "number" | "select"
    default: Any
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    options: Optional[List[str]] = None

class Classifiers(BaseModel):
    id: str
    name: str
    param_schema: List[ParamSpec] = Field(default_factory=list)

class GetClassifiersResponse(BaseModel):
    classifiers: List[Classifiers]

class ClassifierConfig(BaseModel):
    id: str
    params: Dict[str, Any] = Field(default_factory=dict)


class MLFusionRequest(BaseModel):
    datasetId: str
    models: List[ClassifierConfig]
    fusionMethod: str
    useCrossValidation: bool = False
    cvFolds: int = Field(default=5, ge=2, le=15)

class MLFusionResult(BaseModel):
    kind: str  # 'model' | 'fusion'
    model_id: Optional[str] = None
    fusion_method: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    conflict: Optional[float]

class FusionSampleDetail(BaseModel):
    """Single test sample for inspection (labels as human-readable strings)."""
    test_index: int
    original_row_index: int
    y_true: str
    y_fused: str
    predictions: Dict[str, str]


class FusionSampleAnalysis(BaseModel):
    test_set_size: int
    best_model_id: str
    gain_vs_best: int
    loss_vs_best: int
    tie_correct_vs_best: int
    tie_wrong_vs_best: int
    gain_vs_majority: int
    loss_vs_majority: int
    tie_correct_vs_majority: int
    tie_wrong_vs_majority: int
    rescue_all_wrong: int
    gains_vs_best: List[FusionSampleDetail]
    gains_vs_best_total: int
    gains_vs_best_truncated: bool
    losses_vs_best: List[FusionSampleDetail]
    losses_vs_best_total: int
    losses_vs_best_truncated: bool


class MLFusionResponse(BaseModel):
    results: List[MLFusionResult]
    sample_analysis: FusionSampleAnalysis
    evaluationMode: str = "holdout"  # "holdout" | "cv_oof"
    classLabels: List[str] = Field(default_factory=list)
    confusionMatrixFusion: Optional[List[List[int]]] = None


class MLExportCodeResponse(BaseModel):
    code: str
    language: str = "python"
    filename: str
    datasetKind: str


class MLFusionSearchRequest(BaseModel):
    datasetId: str
    models: List[ClassifierConfig]
    useCrossValidation: bool = False
    cvFolds: int = Field(default=5, ge=2, le=15)


class MLFusionSearchEntry(BaseModel):
    model_ids: List[str]
    fusion_method: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    conflict: Optional[float] = None


class MLFusionSearchResponse(BaseModel):
    best: MLFusionSearchEntry
    ranking: List[MLFusionSearchEntry]
    evaluationMode: str = "holdout"
    total_combinations_evaluated: int
    per_model_results: List[MLFusionResult]
    classLabels: List[str] = Field(default_factory=list)


# Calculator Examples
class ExampleSource(BaseModel):
    name: str
    masses: Dict[str, float]


class Example(BaseModel):
    id: str
    name: str
    description: str
    sources: List[ExampleSource]


class GetExamplesResponse(BaseModel):
    examples: List[Example]
