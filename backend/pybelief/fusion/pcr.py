from collections import defaultdict
from typing import List, Optional
from ..core.belief_mass import BeliefMass

def combine(bma1: BeliefMass, bma2: BeliefMass) -> tuple[BeliefMass, None]:
    """Combine two belief mass functions using the PCR5 rule.

    Implements the Proportional Conflict Redistribution rule (PCR5) from
    Dezert-Smarandache Theory (DSmT). Unlike Dempster's rule, PCR5
    redistributes conflicting mass proportionally back to the sources
    that generated the conflict.

    Args:
        bma1: First belief mass assignment to combine.
        bma2: Second belief mass assignment to combine.

    Returns:
        A tuple containing:
            BeliefMass: The combined and normalized belief mass after proportional conflict redistribution.
            None: Conflict is not returned for PCR5.
    """
    result_map = defaultdict(float)
    conflict = 0.0

    for h1, m1 in bma1.items():
        for h2, m2 in bma2.items():
            intersection = h1 & h2
            prod = m1 * m2

            if intersection:
                # 1. Classical intersection
                result_map[intersection] += prod
            elif prod > 0:
                # 2. Conflict - no common elements
                conflict += prod
                # PCR5 conflict redistribution
                sum_m = m1 + m2
                if sum_m > 0:
                    result_map[h1] += (m1 * prod) / sum_m
                    result_map[h2] += (m2 * prod) / sum_m

    return BeliefMass(result_map).normalize(), None

def combine_multiple(sources: List[BeliefMass]) -> tuple[BeliefMass, None]:
    """Combine multiple belief mass functions using the PCR5 rule.

    Sequentially applies the PCR5 combination rule to fuse multiple
    belief mass assignments into a single combined result.

    Args:
        sources: List of BeliefMass objects to combine. Must contain
            at least 2 sources.

    Returns:
        A tuple containing:
            BeliefMass: The combined belief mass from all sources.
            None: Conflict is not returned for PCR5.

    Raises:
        ValueError: If fewer than 2 sources are provided.
    """
    if len(sources) < 2:
        raise ValueError("At least 2 sources are required for fusion.")

    result = sources[0]
    for source in sources[1:]:
        result, _ = combine(result, source)

    return result, None
