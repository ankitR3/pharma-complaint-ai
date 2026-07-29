import json
import logging
from groq import Groq
from app.core.config import settings
from app.agents.state import ComplaintState

logger = logging.getLogger(__name__)

RISK_SYSTEM_PROMPT = """
You are a Senior Pharmaceutical Quality Assurance & Risk Assessment Officer.
Analyze the provided complaint details (Product, Batch, Defect Category, and Description) and determine the risk rating according to GMP/FDA QMS standards.

Return a JSON object with:
{
  "suggested_severity": "Critical or Major or Minor",
  "suggested_next_action": "Concise recommended QA action (e.g. Route to QA Investigation & Issue Replacement, Laboratory investigation & manufacturing record audit)",
  "initial_risk_assessment": "Technical AI risk rationale explaining potential root cause and patient/product impact"
}

Output ONLY valid JSON.
"""

def risk_classifier_node(state: ComplaintState) -> ComplaintState:
    fields = state.get("current_fields", {})
    
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_") and settings.GROQ_API_KEY != "gsk_your_groq_api_token_here":
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": RISK_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Assess risk for this complaint:\n{json.dumps(fields)}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)
            fields["suggested_severity"] = parsed.get("suggested_severity", fields.get("suggested_severity", "Major"))
            fields["suggested_next_action"] = parsed.get("suggested_next_action", fields.get("suggested_next_action", "Route to QA Investigation"))
            fields["initial_risk_assessment"] = parsed.get("initial_risk_assessment", fields.get("initial_risk_assessment", "Investigation initiated."))
        except Exception as e:
            logger.error(f"Groq Risk Classifier LLM call failed: {e}")

    state["current_fields"] = fields
    return state
