from __future__ import annotations

from typing import Iterable, Mapping

from evidencelib import Frame, MassFunction
from evidencelib.exceptions import EvidenceLibError, TotalConflictError


FUSION_RULE_DESCRIPTIONS = {
    "conjunctive": {
        "name": "Conjunctive rule",
        "description": "Unnormalized conjunctive rule. Contradictory DST intersections remain on empty mass.",
        "category": "open_conflict",
    },
    "dsmc": {
        "name": "DSmC (classic DSm rule)",
        "description": "Classic DSm conjunctive rule exposed by evidencelib. On the current DST calculator frame it behaves as the unnormalized conjunctive rule.",
        "category": "open_conflict",
    },
    "smets": {
        "name": "Smets / TBM",
        "description": "Transferable belief model rule. Keeps conflict on the empty proposition.",
        "category": "open_conflict",
    },
    "dempster": {
        "name": "Dempster-Shafer Theory (DST)",
        "description": "Normalized Dempster rule. Removes empty-set conflict and normalizes the remaining masses.",
        "category": "normalized",
    },
    "yager": {
        "name": "Yager",
        "description": "Transfers total conflict to total ignorance instead of normalizing it away.",
        "category": "ignorance_transfer",
    },
    "dsmh": {
        "name": "DSmH",
        "description": "Hybrid DSm rule. Empty intersections are transferred to the union of propositions involved in the conflict.",
        "category": "union_transfer",
    },
    "dubois_prade": {
        "name": "Dubois-Prade",
        "description": "Dubois-Prade-style transfer exposed by evidencelib as an alias of the DSmH transfer pattern.",
        "category": "union_transfer",
    },
    "pcr5": {
        "name": "PCR5",
        "description": "Proportional conflict redistribution for exactly two sources.",
        "category": "redistribution",
    },
    "pcr6": {
        "name": "PCR6",
        "description": "Proportional conflict redistribution for two or more sources.",
        "category": "redistribution",
    },
}

FUSION_RULE_ORDER = (
    "dempster",
    "yager",
    "conjunctive",
    "smets",
    "dsmc",
    "dsmh",
    "dubois_prade",
    "pcr5",
    "pcr6",
)

MASS_CLEAN_TOLERANCE = 1e-9
MASS_NEAR_ONE_TOLERANCE = 1e-6


def _set_label_maps(frame: Frame, labels: list[str]) -> Frame:
    label_map = {atom: label for atom, label in zip(frame.atoms, labels, strict=True)}
    reverse_map = {label: atom for atom, label in label_map.items()}
    frame._fusionlab_label_map = label_map
    frame._fusionlab_reverse_map = reverse_map
    return frame


def build_dst_frame(sources: Iterable[Mapping[str, float]]) -> Frame:
    labels: list[str] = []
    seen: set[str] = set()
    for masses in sources:
        for key in masses:
            label = str(key).strip()
            if not label:
                raise ValueError("Hypothesis names cannot be empty.")
            if label not in seen:
                seen.add(label)
                labels.append(label)
    if not labels:
        raise ValueError("At least one hypothesis is required.")

    atoms = [f"h{i}" for i in range(len(labels))]
    return _set_label_maps(Frame.dst(atoms), labels)


def build_dst_frame_from_labels(labels: Iterable[str]) -> Frame:
    return build_dst_frame([{str(label): 0.0 for label in labels}])


def build_mass(frame: Frame, masses: Mapping[str, float]) -> MassFunction:
    raw_values = {str(key).strip(): float(value) for key, value in masses.items()}
    total = sum(raw_values.values())
    if total > 1.0 + MASS_NEAR_ONE_TOLERANCE:
        raise ValueError(f"Mass values must sum to at most 1.0, got {total}.")

    reverse_map = getattr(frame, "_fusionlab_reverse_map", {})
    values: dict[object, float] = {}
    for label, value in raw_values.items():
        if abs(value) <= MASS_CLEAN_TOLERANCE:
            continue
        atom = reverse_map.get(label, label)
        values[frame.atom(atom)] = value

    stored_total = sum(values.values())
    if abs(total - 1.0) <= MASS_NEAR_ONE_TOLERANCE:
        if stored_total <= MASS_CLEAN_TOLERANCE:
            raise ValueError("Mass values must contain at least one positive value.")
        values = {key: value / stored_total for key, value in values.items()}
    else:
        missing = 1.0 - stored_total
        if missing > MASS_CLEAN_TOLERANCE:
            values[frame.total] = values.get(frame.total, 0.0) + missing

    missing = 1.0 - sum(values.values())
    if missing > MASS_CLEAN_TOLERANCE:
        values[frame.total] = values.get(frame.total, 0.0) + missing
    return frame.mass(values)


def build_masses_from_singletons(masses_by_source: list[Mapping[str, float]]) -> list[MassFunction]:
    frame = build_dst_frame(masses_by_source)
    return [build_mass(frame, masses) for masses in masses_by_source]


def combine_masses(sources: list[MassFunction], method: str) -> tuple[MassFunction, float | None]:
    if len(sources) < 2:
        raise ValueError("At least two sources are required for fusion.")

    first, *rest = sources
    try:
        if method == "conjunctive":
            fused = first.conjunctive(*rest)
            return fused, fused.conflict
        if method == "dsmc":
            fused = first.dsmc(*rest)
            return fused, fused.conflict
        if method == "smets":
            fused = first.smets(*rest)
            return fused, fused.conflict
        if method == "dempster":
            fused = first.dempster(*rest)
            return fused, fused.conflict
        if method == "yager":
            fused = first.yager(*rest)
            return fused, fused.conflict
        if method == "dsmh":
            fused = first.dsmh(*rest)
            return fused, fused.conflict
        if method == "dubois_prade":
            fused = first.dubois_prade(*rest)
            return fused, fused.conflict
        if method == "pcr5":
            if len(sources) != 2:
                raise ValueError("PCR5 accepts exactly two sources in evidencelib. Use PCR6 for three or more sources.")
            fused = first.pcr5(rest[0])
            return fused, fused.conflict
        if method == "pcr6":
            fused = first.pcr6(*rest)
            return fused, fused.conflict
    except TotalConflictError as exc:
        raise ValueError("Total conflict - DST fusion impossible.") from exc
    except EvidenceLibError as exc:
        raise ValueError(str(exc)) from exc

    raise ValueError(f"Fusion method '{method}' is not supported.")


def mass_to_response(mass: MassFunction) -> dict[str, float]:
    label_map = getattr(mass.frame, "_fusionlab_label_map", {})
    result: dict[str, float] = {}
    for prop, value in mass.items():
        if not prop:
            key = "empty"
        else:
            labels = [
                label_map.get(atom, atom)
                for atom in mass.frame.atoms
                if prop.intersects(mass.frame.atom(atom))
            ]
            key = "|".join(labels) if labels else str(prop)
        result[key] = float(value)
    return result


def get_singleton_mass(mass: MassFunction, label: str) -> float:
    reverse_map = getattr(mass.frame, "_fusionlab_reverse_map", {})
    atom = reverse_map.get(label, label)
    try:
        return float(mass.mass(mass.frame.atom(atom)))
    except KeyError:
        return float(mass.mass(label))


def pignistic_scores(mass: MassFunction, labels: list[str]) -> dict[str, float]:
    label_map = getattr(mass.frame, "_fusionlab_label_map", {})
    raw_scores = mass.pignistic()
    scores = {label: 0.0 for label in labels}
    for atom, value in raw_scores.items():
        label = label_map.get(atom, atom)
        if label in scores:
            scores[label] = float(value)
    return scores
