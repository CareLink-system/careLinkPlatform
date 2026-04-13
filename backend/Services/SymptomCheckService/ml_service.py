import joblib
import numpy as np
import os
import json
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

    def _build_guidance_prompt(self, disease: str, specialty: str, symptoms_list: list[str]) -> str:
        symptoms_text = ', '.join(symptoms_list) if symptoms_list else 'not provided'
        # Request strict JSON output so we can render a consistent, rich guidance card in the UI.
        return (
            "You are a clinical triage assistant for a telehealth app.\n"
            "Write practical, evidence-informed patient guidance after the symptom classifier prediction.\n"
            f"Predicted condition: {disease}.\n"
            f"Symptoms: {symptoms_text}.\n"
            f"Recommended specialist: {specialty}.\n"
            "DO NOT claim a confirmed diagnosis. Be calm and supportive.\n"
            "Respond ONLY in valid JSON with the following keys: \n"
            "- possible_meaning: short single-sentence explanation,\n"
            "- what_to_do: array of 2-4 concrete actions the patient can take today (short sentences),\n"
            "- red_flags: array of urgent signs that require immediate care (short phrases),\n"
            "- who_to_consult: one-line recommendation on which specialist or provider to see next,\n"
            "- concise_summary: one-sentence takeaway for the patient.\n"
            "Do not include any additional keys. Keep values concise (each string < 120 characters)."
        )

    def _fallback_guidance(self, disease: str, specialty: str) -> str:
        # Provide a multi-line guidance string when Gemini is not available or returns invalid output.
        return (
            f"Possible meaning: Your symptoms may be related to {disease}, but this is not a confirmed diagnosis.\n"
            "What to do today: 1) Rest and stay hydrated. 2) Avoid known triggers and monitor symptoms. 3) Take over-the-counter symptomatic relief if appropriate.\n"
            "Red flags for urgent care: Severe chest pain, sudden difficulty breathing, fainting, severe or worsening neurologic symptoms, uncontrollable bleeding, or high persistent fever.\n"
            f"Who to consult next: Schedule an appointment with a {specialty} or your primary care provider for evaluation and testing.\n"
            "Summary: If symptoms worsen or any red flags occur, seek emergency care immediately."
        )

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

        # Generate Gemini guidance and gracefully degrade on API failures.
        prompt = self._build_guidance_prompt(disease, specialty, symptoms_list)
        feedback = self._fallback_guidance(disease, specialty)
        if api_key:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)

                # Robustly extract text from the SDK response using multiple fallbacks
                def _extract_text(resp):
                    try:
                        # Common attribute used in some SDK versions
                        if hasattr(resp, 'text') and isinstance(getattr(resp, 'text'), str):
                            return resp.text
                        if hasattr(resp, 'output_text') and isinstance(getattr(resp, 'output_text'), str):
                            return resp.output_text
                        # Some SDKs return candidates or output with nested content
                        if hasattr(resp, 'candidates'):
                            c = getattr(resp, 'candidates')
                            if isinstance(c, (list, tuple)) and len(c) > 0:
                                first = c[0]
                                if isinstance(first, dict) and 'content' in first:
                                    return first['content']
                                if hasattr(first, 'content'):
                                    return first.content
                        # Generic attempt to stringify and search for JSON substring
                        try:
                            s = json.dumps(resp.__dict__, default=str)
                        except Exception:
                            s = str(resp)
                        return s
                    except Exception:
                        return ''

                raw_text = (_extract_text(response) or '').strip()

                # Persist raw Gemini response for debugging (temporary log)
                try:
                    log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gemini_debug.log')
                    with open(log_path, 'a', encoding='utf-8') as f:
                        f.write(f"\n--- GEMINI RAW RESPONSE ({datetime.utcnow().isoformat()}Z) ---\n")
                        try:
                            f.write(json.dumps(response.__dict__, default=str, ensure_ascii=False))
                        except Exception:
                            f.write(str(response))
                        f.write("\nEXTRACTED_TEXT:\n")
                        f.write(raw_text + "\n")
                except Exception:
                    pass

                if raw_text:
                    # Attempt to parse strict JSON response from Gemini
                    try:
                        parsed = json.loads(raw_text)
                        # Validate keys exist
                        keys = ["possible_meaning", "what_to_do", "red_flags", "who_to_consult", "concise_summary"]
                        if all(k in parsed for k in keys):
                            parts = []
                            parts.append(f"Possible meaning: {parsed.get('possible_meaning')}")
                            what = parsed.get('what_to_do') or []
                            if isinstance(what, list):
                                parts.append("What to do today:")
                                for i, a in enumerate(what[:4], 1):
                                    parts.append(f"  {i}) {a}")
                            red = parsed.get('red_flags') or []
                            if isinstance(red, list) and red:
                                parts.append("Red flags for urgent care:")
                                parts.append("  " + ", ".join(red))
                            parts.append(f"Who to consult next: {parsed.get('who_to_consult')}")
                            parts.append(f"Summary: {parsed.get('concise_summary')}")
                            feedback = "\n".join(parts)
                        else:
                            # If JSON doesn't have required keys, use the raw text
                            feedback = raw_text
                    except Exception:
                        # Not JSON — use raw text output if it's descriptive enough
                        if len(raw_text) > 20:
                            feedback = raw_text
            except Exception as ex:
                print(f"WARNING: Gemini feedback generation failed: {ex}")

        return disease, confidence, specialty, feedback