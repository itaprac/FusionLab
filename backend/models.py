from pydantic import BaseModel
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

class Classifiers(BaseModel):
    id: str
    name: str

class GetClassifiersResponse(BaseModel):
    classifiers: List[Classifiers]

class ClassifierConfig(BaseModel):
    id: str
    params: Dict[str, Any]


class MLFusionRequest(BaseModel):
    datasetId: str
    models: List[str]  # Lista ID modeli, np. ['svm', 'knn']
    fusionMethod: str

class MLFusionResult(BaseModel):
    kind: str  # 'model' | 'fusion'
    model_id: Optional[str] = None
    fusion_method: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    conflict: Optional[float]  # None gdy fuzja 3+ modeli (konflikt kumulatywny)

class MLFusionResponse(BaseModel):
    results: List[MLFusionResult]


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
