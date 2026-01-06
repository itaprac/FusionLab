from dataclasses import dataclass, field
from typing import Dict, FrozenSet, Union, List

# Type alias
Hypothesis = FrozenSet[str]

@dataclass
class BeliefMass:
    """A lightweight container for belief masses.

    Stores basic belief assignment (BBA) as a dictionary mapping
    hypotheses to masses. Automatically cleans very small values
    (< 1e-10) from numerical errors.

    Attributes:
        masses: Dictionary mapping frozenset hypotheses to masses [0, 1].

    Examples:
        >>> m = BeliefMass({frozenset("A"): 0.6, frozenset("B"): 0.4})
        >>> m.get_mass("A")
        0.6
        >>> normalized = m.normalize()
    """
    masses: Dict[Hypothesis, float] = field(default_factory=dict)
    
    def __post_init__(self):
        """Automatically clean zero masses on creation."""
        # Filter out very small values (numerical errors)
        self.masses = {k: v for k, v in self.masses.items() if v > 1e-10}

    def normalize(self) -> 'BeliefMass':
        """Return a new normalized instance.

        Normalizes masses so they sum to 1.0. If the sum of masses is 0,
        returns an empty instance.

        Returns:
            BeliefMass: New instance with normalized masses.

        Examples:
            >>> m = BeliefMass({frozenset("A"): 0.4, frozenset("B"): 0.1})
            >>> normalized = m.normalize()
            >>> sum(normalized.masses.values())
            1.0
        """
        total = sum(self.masses.values())
        if total == 0: return BeliefMass()
        return BeliefMass({k: v / total for k, v in self.masses.items()})

    def get_mass(self, hypothesis: Union[Hypothesis, list, set, str]) -> float:
        """Safely access the mass for a hypothesis.

        Automatically converts various hypothesis formats (str, list, set,
        frozenset) to frozenset and returns the mass. Returns 0.0 if the
        hypothesis does not exist.

        Args:
            hypothesis: Hypothesis as string ("A"), list ["A", "B"],
                set, frozenset, or Hypothesis type.

        Returns:
            float: Mass for the hypothesis in range [0, 1]. 0.0 if
                hypothesis does not exist.

        Examples:
            >>> m = BeliefMass({frozenset("A"): 0.8})
            >>> m.get_mass("A")
            0.8
            >>> m.get_mass(["A"])
            0.8
            >>> m.get_mass("C")
            0.0
        """
        if isinstance(hypothesis, str):
            hypothesis = frozenset([hypothesis])
        elif not isinstance(hypothesis, frozenset):
            hypothesis = frozenset(hypothesis)
        return self.masses.get(hypothesis, 0.0)

    def items(self):
        """Return a view of (hypothesis, mass) pairs from internal dictionary.

        Returns:
            dict_items: Items view of masses mapping (Hypothesis -> float).
        """
        return self.masses.items()

    def __repr__(self):
        return f"BeliefMass({dict(self.masses)})"