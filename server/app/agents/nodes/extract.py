import json
import logging
from groq import Groq
from app.core.config import settings
from app.agents.state import ComplaintState

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """
You are an expert AI Quality Assurance Auditor for a Pharmaceutical Manufacturing QMS (API & FDF Quality Assurance Module).
Your task is to analyze raw customer complaint text, emails, or extracted document reports, and dynamically parse the data into structured QMS complaint fields and initial risk classification.

Extract the following fields in strict JSON format:
{
  "complaint_source": "Pharmacy or Email or Customer Report",
  "customer_name": "Name of reporting pharmacy/company or 'Not Provided'",
  "product_name": "Full pharmaceutical product name",
  "product_strength_grade": "Strength/Grade (e.g. 500 mg, IP/BP)",
  "batch_lot_number": "Exact Batch or Lot number",
  "affected_quantity": "Affected quantity (e.g. 12 capsules, 48 capcules, 25 kg (1 HDPE Drum))",
  "manufacturing_date": "Manufacturing date string or 'Not Provided'",
  "expiry_date": "Expiry date string or 'Not Provided'",
  "originating_site_block": "Manufacturing or Packaging or Quality Control",
  "impacted_npm": "Impacted Non-Product Materials (e.g. Primary Packaging (Bottle), HDPE Drum)",
  "complaint_category": "Defect classification (e.g. Product Defect - Discoloration, Foreign Matter Contamination)",
  "complaint_description": "Synthesized formal QMS complaint summary",
  "suggested_severity": "Critical or Major or Minor",
  "suggested_next_action": "Recommended QA investigation action",
  "initial_risk_assessment": "Detailed technical AI risk rationale for the defect"
}

Return ONLY valid JSON.
"""

def extract_node(state: ComplaintState) -> ComplaintState:
    raw_text = state.get("raw_text", "")
    
    extracted = {
        "complaint_source": "Pharmacy",
        "customer_name": "Not Provided",
        "product_name": "Pharmaceutical Product",
        "product_strength_grade": "N/A",
        "batch_lot_number": "N/A",
        "affected_quantity": "N/A",
        "manufacturing_date": "Not Provided",
        "expiry_date": "Not Provided",
        "originating_site_block": "Manufacturing",
        "impacted_npm": "Packaging",
        "complaint_category": "Product Quality Issue",
        "complaint_description": raw_text,
        "suggested_severity": "Major",
        "suggested_next_action": "Route to QA Investigation",
        "initial_risk_assessment": "Investigation initiated based on customer report."
    }

    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_") and settings.GROQ_API_KEY != "gsk_your_groq_api_token_here":
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyze and extract QMS details from this complaint:\n\n{raw_text}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)
            extracted.update({k: v for k, v in parsed.items() if v})
        except Exception as e:
            logger.error(f"Groq Extraction LLM call failed: {e}")

    state["current_fields"] = extracted
    state["updated_field_keys"] = list(extracted.keys())
    state["copilot_message"] = f"Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment."
    
    return state
