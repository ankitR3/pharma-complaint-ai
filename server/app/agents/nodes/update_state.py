import json
import logging
from groq import Groq
from app.core.config import settings
from app.agents.state import ComplaintState

logger = logging.getLogger(__name__)

UPDATE_SYSTEM_PROMPT = """
You are an expert AI Assistant updating an existing pharmaceutical complaint form based on a natural language follow-up prompt.
Analyze the user's prompt alongside the current form state. Identify ONLY the fields that the user wants to update or correct.

Return a JSON object:
{
  "updated_fields": {
     "batch_lot_number": "new value if mentioned, else omit",
     "affected_quantity": "new value if mentioned, else omit",
     "customer_name": "new value if mentioned, else omit",
     "product_name": "new value if mentioned, else omit",
     "manufacturing_date": "new value if mentioned, else omit",
     "expiry_date": "new value if mentioned, else omit",
     "originating_site_block": "new value if mentioned, else omit",
     "impacted_npm": "new value if mentioned, else omit",
     "complaint_category": "new value if mentioned, else omit",
     "complaint_description": "new value if mentioned, else omit"
  },
  "confirmation_message": "Friendly confirmation stating exact updates (e.g., 'Got it. I have updated the Batch / Lot Number to \"BMX240602\" and the Affected Quantity to \"48 capcules\" in the form.')"
}

Output ONLY valid JSON.
"""

def update_state_node(state: ComplaintState) -> ComplaintState:
    user_prompt = state.get("user_prompt", "")
    current_fields = state.get("current_fields", {})
    
    updated_fields = {}
    confirmation_msg = "Form fields updated as requested."

    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_") and settings.GROQ_API_KEY != "gsk_your_groq_api_token_here":
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": UPDATE_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Current complaint fields:\n{json.dumps(current_fields)}\n\nUser follow-up prompt:\n{user_prompt}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)
            updated_fields = {k: v for k, v in parsed.get("updated_fields", {}).items() if v}
            confirmation_msg = parsed.get("confirmation_message", confirmation_msg)
        except Exception as e:
            logger.error(f"Groq Update LLM call failed: {e}")

    # Merge updates into current fields without modifying non-target fields
    merged_fields = dict(current_fields)
    merged_fields.update(updated_fields)

    state["current_fields"] = merged_fields
    state["updated_field_keys"] = list(updated_fields.keys())
    state["copilot_message"] = confirmation_msg

    return state
