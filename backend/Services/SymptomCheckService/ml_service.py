import joblib
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. FORCE LOAD THE .ENV FILE FIRST
load_dotenv()

# 2. Configure Gemini client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY is missing! Check your .env file.")
else:
    genai.configure(api_key=api_key)

class MLService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model = joblib.load(os.path.join(base_dir, 'xgboost_symptom_model.joblib'))
        self.label_encoder = joblib.load(os.path.join(base_dir, 'label_encoder.joblib'))
        self.features = joblib.load(os.path.join(base_dir, 'feature_names.joblib'))
        self.specialty_map = {
            'Fungal infection': 'Dermatologist',
            'Allergy': 'Allergist',
            'GERD': 'Gastroenterologist',
            # Add the rest of your disease mappings here
        }

    async def predict(self, payload):
        # Convert description to list if necessary, assuming CSV format for simple text
        symptoms_list = payload if isinstance(payload, list) else [s.strip() for s in payload.split(',')]

        input_vector = np.zeros(len(self.features))
        for sym in symptoms_list:
            if sym in self.features:
                idx = self.features.index(sym)
                input_vector[idx] = 1

        # Predict condition and confidence
        prob = self.model.predict_proba([input_vector])[0]
        max_idx = np.argmax(prob)
        confidence = float(prob[max_idx])
        
        prediction_encoded = self.model.predict([input_vector])[0]
        disease = self.label_encoder.inverse_transform([prediction_encoded])[0]
        specialty = self.specialty_map.get(disease, 'General Physician')

        # Generate Gemini feedback and gracefully degrade on API failures.
        prompt = f"A patient has symptoms: {', '.join(symptoms_list)}. ML suspects {disease}. Give a brief, empathetic health suggestion and firmly advise consulting a {specialty}. Do not use markdown formatting."

        feedback = f"Based on your symptoms, {disease} is a possible condition. Please consult a {specialty} for a proper diagnosis."
        if api_key:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                if getattr(response, "text", None):
                    feedback = response.text
            except Exception as ex:
                print(f"WARNING: Gemini feedback generation failed: {ex}")

        return disease, confidence, specialty, feedback