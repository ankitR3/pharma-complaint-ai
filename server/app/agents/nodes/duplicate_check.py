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
    batch_num = fields.get("batch_lot_number")
    
    is_duplicate = False
    notes = "No duplicate batch records detected."

    if batch_num and batch_num.strip() not in ["N/A", "Not Provided", ""]:
        try:
            from app.core.database import SessionLocal
            from app.models.complaint import Complaint
            db = SessionLocal()
            existing_count = db.query(Complaint).filter(Complaint.batch_lot_number == batch_num.strip()).count()
            db.close()
            if existing_count > 0:
                is_duplicate = True
                notes = f"Duplicate Batch Flag: Batch #{batch_num.strip()} already has {existing_count} prior complaint(s) logged in the QMS Ledger."
        except Exception as e:
            logger.error(f"DB Duplicate query failed: {e}")

    state["duplicate_flag"] = is_duplicate
    state["duplicate_notes"] = notes
    return state
