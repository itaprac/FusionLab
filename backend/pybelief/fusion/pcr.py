from collections import defaultdict
from typing import List
import itertools
from ..core.belief_mass import BeliefMass


def average_pairwise_conflict(sources: List[BeliefMass]) -> float | None:
    if len(sources) < 2:
        return None

    total = 0.0
    pairs = 0
    for i, left in enumerate(sources[:-1]):
        for right in sources[i + 1:]:
            pairs += 1
            for h1, m1 in left.items():
                for h2, m2 in right.items():
                    if not (h1 & h2):
                        total += float(m1) * float(m2)

    return total / pairs if pairs else None


def combine(bma1: BeliefMass, bma2: BeliefMass) -> tuple[BeliefMass, float]:
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
            float: Pairwise conflict mass before redistribution.
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

    return BeliefMass(result_map).normalize(), conflict

def combine_multiple(sources: List[BeliefMass]) -> tuple[BeliefMass, float | None]:
    """Combine multiple belief mass functions using the PCR5 rule.

    Sequentially applies the PCR5 combination rule to fuse multiple
    belief mass assignments into a single combined result.

    Args:
        sources: List of BeliefMass objects to combine. Must contain
            at least 2 sources.

    Returns:
        A tuple containing:
            BeliefMass: The combined belief mass from all sources.
            float: Average pairwise conflict before redistribution.

    Raises:
        ValueError: If fewer than 2 sources are provided.
    """
    if len(sources) < 2:
        raise ValueError("At least 2 sources are required for fusion.")

    conflict = average_pairwise_conflict(sources)
    result = sources[0]
    for source in sources[1:]:
        result, _ = combine(result, source)

    return result, conflict



def combine_multiple_pcr6(sources: List[BeliefMass]) -> tuple[BeliefMass, float | None]:
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

    return BeliefMass(result_map), average_pairwise_conflict(sources)
