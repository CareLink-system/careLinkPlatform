import json
import os
from datetime import datetime
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv

# Always load the service-local .env no matter where uvicorn is started from.
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)


class ChatbotService:
    def __init__(self):
        configured_model = (os.getenv("GEMINI_MODEL") or "").strip()
        self.model_candidates = [
            configured_model,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
        ]
        # Keep order and remove blanks/duplicates.
        seen = set()
        self.model_candidates = [m for m in self.model_candidates if m and not (m in seen or seen.add(m))]
        self.model_name = self.model_candidates[0]
        self.api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            print("WARNING: GEMINI_API_KEY not set; chatbot will use fallback responses.")

    def _log_debug(self, message: str) -> None:
        try:
            log_path = Path(__file__).resolve().parent / "chatbot_gemini_debug.log"
            with open(log_path, "a", encoding="utf-8") as file:
                file.write(f"[{datetime.utcnow().isoformat()}Z] {message}\n")
        except Exception:
            pass

    def _format_context(self, diagnosis_context):
        if not diagnosis_context:
            return "No recent diagnosis context provided."
        if isinstance(diagnosis_context, str):
            return diagnosis_context
        try:
            return json.dumps(diagnosis_context, ensure_ascii=False, indent=2, default=str)
        except Exception:
            return str(diagnosis_context)

    def _build_prompt(self, user_message: str, diagnosis_context, history: list[dict]) -> str:
        history_lines = []
        for item in history[-10:]:
            sender = item.get("sender", "user")
            content = item.get("content", "")
            history_lines.append(f"{sender.title()}: {content}")

        history_text = "\n".join(history_lines) if history_lines else "No prior messages."

        return (
            "You are CareLink Chatbot, a supportive healthcare assistant inside a patient portal.\n"
            "Use the recent diagnosis context and conversation history to provide useful insights, follow-up questions, and safe next steps.\n"
            "Do not claim to diagnose, prescribe, or replace a clinician.\n"
            "If symptoms sound urgent, clearly say to seek immediate medical care.\n"
            "Be empathetic, practical, and concise. Keep the answer around 120-180 words.\n\n"
            f"Recent diagnosis context:\n{self._format_context(diagnosis_context)}\n\n"
            f"Conversation history:\n{history_text}\n\n"
            f"User message:\n{user_message}\n\n"
            "Reply with a natural chat response. Include one follow-up question when helpful."
        )

    def _fallback_reply(self, user_message: str, diagnosis_context) -> str:
        condition = None
        specialty = None
        if isinstance(diagnosis_context, dict):
            condition = diagnosis_context.get("predicted_condition")
            specialty = diagnosis_context.get("recommended_specialty")

        context_line = (
            f" Based on your latest result, {condition} was predicted."
            if condition
            else ""
        )
        specialty_line = (
            f" It may help to follow up with a {specialty}."
            if specialty
            else ""
        )

        return (
            f"I can help you think through this safely.{context_line}{specialty_line} "
            "Keep track of how the symptoms change, stay hydrated, and avoid any known triggers. "
            "If you notice chest pain, trouble breathing, fainting, confusion, or suddenly worsening symptoms, seek urgent care. "
            "If you'd like, tell me how long the symptoms have been happening and whether anything makes them better or worse."
        )

    def _extract_text(self, response) -> str:
        try:
            if hasattr(response, "text") and isinstance(getattr(response, "text"), str):
                return response.text
            if hasattr(response, "output_text") and isinstance(getattr(response, "output_text"), str):
                return response.output_text
            if hasattr(response, "candidates"):
                candidates = getattr(response, "candidates")
                if isinstance(candidates, (list, tuple)) and candidates:
                    first = candidates[0]
                    if isinstance(first, dict) and "content" in first:
                        return str(first["content"])
                    if hasattr(first, "content"):
                        content = first.content
                        parts = getattr(content, "parts", None)
                        if isinstance(parts, (list, tuple)):
                            texts = []
                            for part in parts:
                                text = getattr(part, "text", None)
                                if isinstance(text, str) and text.strip():
                                    texts.append(text.strip())
                            if texts:
                                return "\n".join(texts)
                        text = getattr(content, "text", None)
                        if isinstance(text, str) and text.strip():
                            return text
                        return str(content)
            return str(response)
        except Exception:
            return ""

    async def generate_reply(self, user_message: str, diagnosis_context, history: list[dict]) -> str:
        reply = self._fallback_reply(user_message, diagnosis_context)
        last_error = ""
        generated_by_model = False

        if self.api_key:
            try:
                prompt = self._build_prompt(user_message, diagnosis_context, history)
                for model_name in self.model_candidates:
                    try:
                        model = genai.GenerativeModel(model_name)
                        response = model.generate_content(prompt)
                        text = self._extract_text(response).strip()
                        if text:
                            reply = text
                            generated_by_model = True
                            self.model_name = model_name
                            break

                        self._log_debug(
                            f"Model '{model_name}' returned empty extracted text. Raw response: "
                            + str(getattr(response, "__dict__", response))
                        )
                    except Exception as model_ex:
                        last_error = str(model_ex)
                        self._log_debug(f"Model '{model_name}' failed: {model_ex}")
            except Exception as ex:
                print(f"WARNING: Gemini chatbot reply generation failed: {ex}")
                self._log_debug(f"Gemini generation failed: {ex}")
                last_error = str(ex)
        else:
            print("WARNING: Gemini not configured; returning fallback reply.")
            self._log_debug("Gemini not configured; using fallback response.")

        if not generated_by_model and last_error:
            error_lower = last_error.lower()
            if "quota" in error_lower or "429" in error_lower or "billing" in error_lower:
                reply = (
                    "I can still guide you with safe next steps, but live AI generation is temporarily unavailable "
                    "because the Gemini API quota/billing is not active for this key. "
                    + reply
                )

        return reply
