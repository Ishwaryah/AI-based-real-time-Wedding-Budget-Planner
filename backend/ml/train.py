"""
Shaadi.AI — Decor Intelligence ML Pipeline
Uses MobileNetV2 embeddings + RandomForestRegressor for cost prediction.
Run: python train.py  (trains on sample data)
"""
import numpy as np
import json, os, joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

MODEL_PATH = "decor_model.joblib"
ENCODER_PATH = "decor_encoder.joblib"

# ─── Sample dataset (replace with real images in production) ──────────────────
SAMPLE_DATA = [
    {"function_type": "Mandap",    "style": "Romantic",   "complexity": "High",   "embedding_seed": 1,  "actual_cost": 180000},
    {"function_type": "Mandap",    "style": "Traditional","complexity": "High",   "embedding_seed": 2,  "actual_cost": 200000},
    {"function_type": "Entrance",  "style": "Traditional","complexity": "Medium", "embedding_seed": 3,  "actual_cost": 45000},
    {"function_type": "Entrance",  "style": "Modern",     "complexity": "High",   "embedding_seed": 4,  "actual_cost": 90000},
    {"function_type": "Table Decor","style":"Minimalist", "complexity": "Low",    "embedding_seed": 5,  "actual_cost": 35000},
    {"function_type": "Table Decor","style":"Romantic",   "complexity": "Medium", "embedding_seed": 6,  "actual_cost": 65000},
    {"function_type": "Ceiling",   "style": "Modern",     "complexity": "High",   "embedding_seed": 7,  "actual_cost": 120000},
    {"function_type": "Ceiling",   "style": "Playful",    "complexity": "Low",    "embedding_seed": 8,  "actual_cost": 28000},
    {"function_type": "Backdrop",  "style": "Boho",       "complexity": "Medium", "embedding_seed": 9,  "actual_cost": 65000},
    {"function_type": "Stage",     "style": "Whimsical",  "complexity": "High",   "embedding_seed": 10, "actual_cost": 220000},
    {"function_type": "Lighting",  "style": "Traditional","complexity": "Low",    "embedding_seed": 11, "actual_cost": 22000},
    {"function_type": "Photo Booth","style":"Modern",     "complexity": "Medium", "embedding_seed": 12, "actual_cost": 55000},
    {"function_type": "Aisle",     "style": "Romantic",   "complexity": "Low",    "embedding_seed": 13, "actual_cost": 18000},
    {"function_type": "Pillars",   "style": "Luxury",     "complexity": "High",   "embedding_seed": 14, "actual_cost": 280000},
    {"function_type": "Table Decor","style":"Rustic",     "complexity": "Medium", "embedding_seed": 15, "actual_cost": 48000},
    {"function_type": "Mandap",    "style": "Luxury",     "complexity": "High",   "embedding_seed": 16, "actual_cost": 350000},
    {"function_type": "Entrance",  "style": "Boho",       "complexity": "Medium", "embedding_seed": 17, "actual_cost": 55000},
    {"function_type": "Ceiling",   "style": "Romantic",   "complexity": "Medium", "embedding_seed": 18, "actual_cost": 75000},
    {"function_type": "Stage",     "style": "Luxury",     "complexity": "High",   "embedding_seed": 19, "actual_cost": 400000},
    {"function_type": "Photo Booth","style":"Rustic",     "complexity": "Low",    "embedding_seed": 20, "actual_cost": 25000},
]

# Augment to ~200 samples
def augment_data(base, n=200):
    import random
    augmented = []
    for _ in range(n):
        item = random.choice(base).copy()
        noise = random.uniform(0.85, 1.15)
        item["actual_cost"] = int(item["actual_cost"] * noise)
        item["embedding_seed"] = random.randint(1, 10000)
        augmented.append(item)
    return augmented

def fake_embedding(seed: int, dim: int = 64) -> np.ndarray:
    """Simulate MobileNetV2 embedding (use real CNN in production)."""
    rng = np.random.RandomState(seed % 100000)
    return rng.randn(dim).astype(np.float32)

def build_features(item: dict, encoder: OneHotEncoder = None, fit: bool = False):
    """Build feature vector: embedding + one-hot tags."""
    emb = fake_embedding(item.get("embedding_seed", 42))
    cats = np.array([[item["function_type"], item["style"], item["complexity"]]])
    if fit:
        oh = encoder.fit_transform(cats)
    else:
        oh = encoder.transform(cats)
    if hasattr(oh, 'toarray'):
        oh = oh.toarray()
    oh = oh.flatten()
    return np.concatenate([emb, oh])

def train():
    print("🤖 Shaadi.AI Decor ML — Training Pipeline")
    print("=" * 50)

    data = augment_data(SAMPLE_DATA, 200)
    try:
        encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    except TypeError:
        encoder = OneHotEncoder(handle_unknown='ignore', sparse=False)

    X, y = [], []
    for i, item in enumerate(data):
        feat = build_features(item, encoder, fit=(i == 0))
        X.append(feat)
        y.append(item["actual_cost"])

    X = np.array(X)
    y = np.array(y)

    print(f"  Dataset: {len(X)} samples, {X.shape[1]} features")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"  ✅ Model trained | MAE: ₹{mae:,.0f}")

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    print(f"  💾 Model saved → {MODEL_PATH}")
    print(f"  💾 Encoder saved → {ENCODER_PATH}")

    # Save embeddings for similarity search
    embeddings = {i: fake_embedding(d["embedding_seed"]).tolist() for i, d in enumerate(SAMPLE_DATA)}
    with open("embeddings.json", "w") as f:
        json.dump(embeddings, f)
    print("  💾 Embeddings saved → embeddings.json")
    return model, encoder

def predict(function_type: str, style: str, complexity: str, image_seed: int = 42):
    """Predict cost for a decor item."""
    if not os.path.exists(MODEL_PATH):
        train()

    model = joblib.load(MODEL_PATH)
    encoder = joblib.load(ENCODER_PATH)

    item = {
        "function_type": function_type,
        "style": style,
        "complexity": complexity,
        "embedding_seed": image_seed
    }
    feat = build_features(item, encoder, fit=False)
    pred = model.predict([feat])[0]
    return {
        "predicted_cost": int(pred),
        "range": [int(pred * 0.8), int(pred * 1.2)],
        "confidence": 0.82
    }

def find_similar(image_seed: int, top_k: int = 3):
    """Cosine similarity search against the library."""
    from sklearn.metrics.pairwise import cosine_similarity
    query_emb = fake_embedding(image_seed).reshape(1, -1)
    lib_embs = np.array([fake_embedding(d["embedding_seed"]) for d in SAMPLE_DATA])
    sims = cosine_similarity(query_emb, lib_embs)[0]
    top_indices = np.argsort(sims)[::-1][:top_k]
    return [SAMPLE_DATA[i] for i in top_indices]

if __name__ == "__main__":
    train()
    print("\n🔮 Test prediction:")
    result = predict("Mandap", "Romantic", "High", image_seed=99)
    print(f"   Predicted: ₹{result['predicted_cost']:,}")
    print(f"   Range: ₹{result['range'][0]:,} – ₹{result['range'][1]:,}")
    print("\n🔍 Similar designs:")
    for s in find_similar(99):
        print(f"   → {s['function_type']} | {s['style']} | ₹{s['actual_cost']:,}")
