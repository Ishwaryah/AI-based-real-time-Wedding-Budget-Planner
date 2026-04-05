"""Auto-label all images in decor_dataset using folder name + image features.

Run on startup (via main.py) when fewer than 50 labelled images exist.
Can also be run standalone: python ml/auto_label.py
"""
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "decor_dataset", "data", "images")
LABELS_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), "decor_dataset", "data", "labels.csv")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Base costs (INR) per folder/function_type
FOLDER_BASE_COSTS = {
    "entrance":  75_000,
    "mandap":   750_000,
    "stage":    400_000,
    "backdrop":  85_000,
    "ceiling":  180_000,
    "table":     45_000,
    "lighting":  35_000,
    "floral":    95_000,
}
DEFAULT_BASE_COST = 60_000

# Complexity multipliers by tier
COMPLEXITY_MULTIPLIERS = {1: 0.5, 2: 0.75, 3: 1.0, 4: 1.75, 5: 2.5}

# Style inference fieldnames for CSV
FIELDNAMES = ["filename", "function_type", "style", "complexity", "seed_cost"]


def _infer_style(feats) -> str:
    """Infer style from color features."""
    warm_ratio  = float(feats[12])
    dark_ratio  = float(feats[13])

    # Compute saturation proxy from color_variance
    color_variance = float(feats[11])

    if color_variance > 0.04:        # high saturation
        return "Luxury"
    if warm_ratio > 0.45:
        return "Traditional"
    if dark_ratio > 0.35:
        return "Boho"
    return "Modern"


def _infer_complexity(feats) -> int:
    """Map image features to a 1-5 complexity score."""
    texture_score    = float(feats[15])
    color_richness   = float(feats[16])
    brightness_zones = float(feats[17])
    symmetry_score   = float(feats[18])

    score = (
        texture_score * 3.0 +
        color_richness * 2.0 +
        brightness_zones * 100.0 +
        symmetry_score * 1.0
    )
    # Map to 1-5
    thresholds = [0.4, 0.8, 1.4, 2.2]
    for level, threshold in enumerate(thresholds, start=1):
        if score < threshold:
            return level
    return 5


def _read_labels() -> dict:
    labels = {}
    if not os.path.exists(LABELS_CSV):
        return labels
    with open(LABELS_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            labels[row["filename"]] = row
    return labels


def _write_labels(labels: dict):
    os.makedirs(os.path.dirname(LABELS_CSV), exist_ok=True)
    with open(LABELS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in labels.values():
            writer.writerow({k: row.get(k, "") for k in FIELDNAMES})


def run_auto_label(force: bool = False) -> int:
    """Auto-label images. Skips already-labelled entries unless force=True.

    Returns number of images newly labelled.
    """
    from ml.decor_features import extract_features

    if not os.path.isdir(IMAGES_DIR):
        return 0

    labels = _read_labels()
    if not force and len(labels) >= 50:
        return 0

    labelled = 0
    for subfolder in os.listdir(IMAGES_DIR):
        subfolder_path = os.path.join(IMAGES_DIR, subfolder)
        if not os.path.isdir(subfolder_path):
            continue
        function_type = subfolder.lower()
        base_cost = FOLDER_BASE_COSTS.get(function_type, DEFAULT_BASE_COST)

        for fname in os.listdir(subfolder_path):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                continue

            unique_filename = f"{subfolder}/{fname}"
            if not force and unique_filename in labels:
                continue

            img_path = os.path.join(subfolder_path, fname)
            try:
                feats = extract_features(img_path)
            except Exception:
                continue

            complexity  = _infer_complexity(feats)
            style       = _infer_style(feats)
            multiplier  = COMPLEXITY_MULTIPLIERS[complexity]
            seed_cost   = round(base_cost * multiplier)

            labels[unique_filename] = {
                "filename":      unique_filename,
                "function_type": function_type,
                "style":         style,
                "complexity":    str(complexity),
                "seed_cost":     str(seed_cost),
            }
            labelled += 1

    if labelled > 0:
        _write_labels(labels)

    return labelled


async def maybe_auto_label():
    """Called on startup: auto-label if fewer than 50 labelled images exist."""
    import logging
    labels = _read_labels()
    if len(labels) < 50:
        count = run_auto_label()
        if count > 0:
            logging.getLogger(__name__).info(
                "auto_label: labelled %d images (total now %d)", count, len(labels) + count
            )


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    n = run_auto_label(force=force)
    print(f"Auto-labelled {n} images. Total: {len(_read_labels())}")
