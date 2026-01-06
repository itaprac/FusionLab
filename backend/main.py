from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.responses import JSONResponse


from pybelief import dempster
from typing import Union
from pybelief.core.belief_mass import BeliefMass
from pybelief.fusion.dempster import combine_multiple as dempster_fusion
from pybelief.fusion.pcr import combine_multiple as pcr5_fusion

from models import Methods, GetMethodsResponse, FusionRequest, FusionResponse, FusionResult

METHODS = [
    Methods(id="dempster", name="Dempster-Shafer Theory (DST)", description="Classic Dempster's rule with conflict normalization. Best for sources with low conflict."),
    Methods(id="pcr5", name="PCR5 (DSmT)", description="Proportional conflict redistribution. Handles high conflict scenarios and resolves DST paradoxes.")
]

app = FastAPI()

#Pobranie dostępnych metod fuzji
@app.get("/methods", response_model=GetMethodsResponse)
def get_methods() -> GetMethodsResponse:
    """Endpoint to retrieve available fusion methods.

    Returns:
        GetMethodsResponse: A list of supported fusion methods with descriptions.
    """
    return GetMethodsResponse(methods=METHODS)


@app.post("/fusion", response_model=Union[FusionResponse])
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

