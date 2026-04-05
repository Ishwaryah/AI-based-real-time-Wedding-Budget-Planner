"""Image feature extraction for decor cost prediction using Pillow."""
import numpy as np
from PIL import Image


def extract_features(image_path: str) -> np.ndarray:
    """Extract a 15-value feature vector from a decor image.

    Features:
        0-8  : dominant_colors — mean RGB of 3 image quadrants (9 values, normalised 0-1)
        9    : brightness      — mean pixel brightness (0-1)
        10   : complexity_score— std deviation of pixel values (0-1)
        11   : color_variance  — mean channel variance (0-1)
        12   : warm_ratio      — fraction of warm pixels (R>G and R>B)
        13   : dark_ratio      — fraction of dark pixels (mean brightness < 80)
        14   : aspect_ratio    — width / height
    """
    try:
        img = Image.open(image_path).convert("RGB")
        img_small = img.resize((64, 64))
        arr = np.array(img_small, dtype=np.float32)

        # dominant_colors: mean RGB of top-left, top-right, bottom-left quadrants
        h, w = arr.shape[:2]
        regions = [
            arr[: h // 2, : w // 2],
            arr[: h // 2, w // 2 :],
            arr[h // 2 :, : w // 2],
        ]
        dominant_colors = np.concatenate([r.mean(axis=(0, 1)) for r in regions]) / 255.0  # 9

        brightness = float(arr.mean() / 255.0)                                             # 1
        complexity_score = float(arr.std() / 255.0)                                        # 1
        color_variance = float(arr.reshape(-1, 3).var(axis=0).mean() / (255.0 ** 2))      # 1

        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        warm_ratio = float(((r > g) & (r > b)).mean())                                    # 1
        dark_ratio = float((arr.mean(axis=2) < 80).mean())                                # 1

        orig_w, orig_h = img.size
        aspect_ratio = float(orig_w / orig_h) if orig_h > 0 else 1.0                     # 1

        features = np.concatenate([
            dominant_colors,
            [brightness, complexity_score, color_variance, warm_ratio, dark_ratio, aspect_ratio],
        ])
        return features.astype(np.float32)

    except Exception:
        return np.zeros(15, dtype=np.float32)
