from pathlib import Path
import pickle
from typing import List, Tuple, Union


class MLService:
    def __init__(self, model_path: str = "model.pkl"):
        p = Path(model_path)
        self.model = None
        if p.exists():
            try:
                with p.open("rb") as fh:
                    self.model = pickle.load(fh)
            except Exception:
                self.model = None

    async def predict(self, symptoms: Union[List[str], str]) -> Tuple[str, float]:
        if isinstance(symptoms, list):
            text = " ".join(symptoms)
        else:
            text = symptoms or ""

        if self.model:
            try:
                pred = self.model.predict([text])[0]
                if hasattr(self.model, "predict_proba"):
                    proba = max(self.model.predict_proba([text])[0])
                else:
                    proba = 1.0
                return str(pred), float(proba)
            except Exception:
                pass

        return "unknown", 0.0
