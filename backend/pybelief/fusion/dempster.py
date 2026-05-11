from collections import defaultdict
from typing import List, Optional
from ..core.belief_mass import BeliefMass


def average_pairwise_conflict(sources: List[BeliefMass]) -> Optional[float]:
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
    """Combine two belief mass functions using Dempster's rule of combination.

    Computes the conjunctive combination of two belief mass assignments
    with normalization factor (1 / 1-K), where K is the conflict mass.

    Args:
        bma1: First belief mass assignment to combine.
        bma2: Second belief mass assignment to combine.

    Returns:
        A tuple containing:
            - BeliefMass: The combined belief mass after normalization.
            - float: The conflict mass (K) between the two sources.

    Raises:
        ValueError: If total conflict is 1.0 (complete contradiction),
            making DST fusion impossible.
    """
    result_map = defaultdict(float)
    conflict = 0.0

    for h1, m1 in bma1.items():
        for h2, m2 in bma2.items():
            intersection = h1 & h2
            prod = m1 * m2

            if intersection:
                result_map[intersection] += prod
            else:
                conflict += prod

    if conflict >= 1.0 - 1e-10:
        raise ValueError("Total conflict - DST fusion impossible.")

    # Normalization
    normalization_factor = 1.0 / (1.0 - conflict)
    normalized_map = {k: v * normalization_factor for k, v in result_map.items()}

    return BeliefMass(normalized_map), conflict


def combine_multiple(sources: List[BeliefMass]) -> tuple[BeliefMass, Optional[float]]:
    """Combine multiple belief mass functions using Dempster's rule.

    Sequentially applies Dempster's combination rule to fuse multiple
    belief mass assignments into a single combined result.

    Args:
        sources: List of BeliefMass objects to combine. Must contain
            at least 2 sources.

    Returns:
        A tuple with the fused BeliefMass and average pairwise conflict.

    Raises:
        ValueError: If fewer than 2 sources are provided.
        ValueError: If total conflict reaches 1.0 during any
            intermediate combination step.
    """
    if len(sources) < 2:
        raise ValueError("At least 2 sources are required for fusion.")

    if len(sources) == 2:
        result, conflict = combine(sources[0], sources[1])
        return result, conflict

    conflict = average_pairwise_conflict(sources)
    result = sources[0]
    for source in sources[1:]:
        result, _ = combine(result, source)

    return result, conflict
