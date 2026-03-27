import joblib
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. FORCE LOAD THE .ENV FILE FIRST
load_dotenv()

# 2. Configure Gemini using the loaded key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY is missing! Check your .env file.")

genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

class MLService:
    def __init__(self):
        self.model = joblib.load('xgboost_symptom_model.joblib')
        self.label_encoder = joblib.load('label_encoder.joblib')
        self.features = joblib.load('feature_names.joblib')
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

        # Generate Gemini Feedback
        prompt = f"A patient has symptoms: {', '.join(symptoms_list)}. ML suspects {disease}. Give a brief, empathetic health suggestion and firmly advise consulting a {specialty}. Do not use markdown formatting."
        response = gemini_model.generate_content(prompt)

        return disease, confidence, specialty, response.text