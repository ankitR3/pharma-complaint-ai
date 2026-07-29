from typing import TypedDict, Optional, List, Dict, Any

class ComplaintState(TypedDict):
    raw_text: str
    user_prompt: Optional[str]
    current_fields: Dict[str, Any]
    updated_field_keys: List[str]
    copilot_message: str
