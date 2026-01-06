from pydantic import BaseModel
from typing import List, Dict, Optional


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

