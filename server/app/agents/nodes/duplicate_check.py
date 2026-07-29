import json
import logging
from groq import Groq
from app.core.config import settings
from app.agents.state import ComplaintState

logger = logging.getLogger(__name__)

DUPLICATE_CHECK_SYSTEM_PROMPT = """
You are a Quality Control Database Auditor.
Analyze the current complaint record to determine if there are any batch/lot flags or duplicate pattern markers that QA should be aware of.

Return JSON:
{
  "duplicate_flag": false,
  "notes": "Short audit summary"
}

Output ONLY valid JSON.
"""

def duplicate_check_node(state: ComplaintState) -> ComplaintState:
    fields = state.get("current_fields", {})
    
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_") and settings.GROQ_API_KEY != "gsk_your_groq_api_token_here":
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": DUPLICATE_CHECK_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Audit complaint record:\n{json.dumps(fields)}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            logger.error(f"Duplicate Check LLM call failed: {e}")

    state["current_fields"] = fields
    return state
