from collections import defaultdict
from typing import List
import itertools
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



def combine_multiple_pcr6(sources: List[BeliefMass]) -> tuple[BeliefMass, None]:
    """
    PCR6 combination rule for multiple belief mass functions.
    Based on Smarandache & Dezert DSmT definition.
    """

    if len(sources) < 2:
        raise ValueError("At least 2 sources are required.")

    items_per_source = [list(src.items()) for src in sources]
    result_map = defaultdict(float)

    for combo in itertools.product(*items_per_source):

        hypotheses = [h for h, _ in combo]
        masses = [m for _, m in combo]

        # product of masses
        prod = 1.0
        for m in masses:
            prod *= m

        if prod == 0:
            continue

        # intersection
        inter = hypotheses[0]
        for h in hypotheses[1:]:
            inter = inter & h
            if not inter:
                break

        # non-conflict → conjunctive rule
        if inter:
            result_map[inter] += prod
            continue

        # conflict redistribution (PCR6)
        sum_m = sum(masses)

        if sum_m == 0:
            continue

        for i, (h_i, m_i) in enumerate(zip(hypotheses, masses)):

            if m_i == 0:
                continue

            # product of other masses
            prod_other = 1.0
            for j, m_j in enumerate(masses):
                if j != i:
                    prod_other *= m_j

            redistributed = (m_i * m_i * prod_other) / sum_m

            result_map[h_i] += redistributed

    return BeliefMass(result_map), None
