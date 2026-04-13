import json
import os
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


class ChatbotService:
    def __init__(self):
        self.model_name = "gemini-1.5-flash"

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
                        return str(first.content)
            return str(response)
        except Exception:
            return ""

    async def generate_reply(self, user_message: str, diagnosis_context, history: list[dict]) -> str:
        reply = self._fallback_reply(user_message, diagnosis_context)

        if api_key:
            try:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(self._build_prompt(user_message, diagnosis_context, history))
                text = self._extract_text(response).strip()
                if text:
                    reply = text
            except Exception as ex:
                print(f"WARNING: Gemini chatbot reply generation failed: {ex}")

        return reply
