"""Standalone training script: python ml/train_decor.py

Loads DB, trains DecorCostPredictor, prints accuracy and sample count.
Called by admin "Retrain Model" button via /api/admin/decor/retrain.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


async def main():
    from database import create_all, AsyncSessionLocal
    from ml.decor_model import DecorCostPredictor

    await create_all()

    async with AsyncSessionLocal() as db:
        predictor = DecorCostPredictor()
        result = await predictor.train(db)

    if result["method"] == "rule-based":
        print(
            f"Not enough labelled images ({result['samples']}). "
            "Using rule-based fallback. Label at least 5 images via the admin panel."
        )
    else:
        print(
            f"Training complete! "
            f"Samples: {result['samples']}  "
            f"R² accuracy: {result['accuracy']}"
        )


if __name__ == "__main__":
    asyncio.run(main())
