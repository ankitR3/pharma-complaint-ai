from langgraph.graph import StateGraph, END
from app.agents.state import ComplaintState
from app.agents.nodes.extract import extract_node
from app.agents.nodes.risk_classifier import risk_classifier_node
from app.agents.nodes.update_state import update_state_node
from app.agents.nodes.duplicate_check import duplicate_check_node

# Workflow 1: Initial Extraction
extract_builder = StateGraph(ComplaintState)
extract_builder.add_node("extract", extract_node)
extract_builder.add_node("risk_classifier", risk_classifier_node)
extract_builder.add_node("duplicate_check", duplicate_check_node)

extract_builder.set_entry_point("extract")
extract_builder.add_edge("extract", "risk_classifier")
extract_builder.add_edge("risk_classifier", "duplicate_check")
extract_builder.add_edge("duplicate_check", END)

extraction_graph = extract_builder.compile()

# Workflow 2: Natural Language Field Update
update_builder = StateGraph(ComplaintState)
update_builder.add_node("update_state", update_state_node)
update_builder.add_node("risk_classifier", risk_classifier_node)

update_builder.set_entry_point("update_state")
update_builder.add_edge("update_state", "risk_classifier")
update_builder.add_edge("risk_classifier", END)

update_graph = update_builder.compile()

def run_extraction_agent(raw_text: str) -> dict:
    initial_state: ComplaintState = {
        "raw_text": raw_text,
        "user_prompt": None,
        "current_fields": {},
        "updated_field_keys": [],
        "copilot_message": ""
    }
    result = extraction_graph.invoke(initial_state)
    return {
        "extracted_fields": result["current_fields"],
        "updated_field_keys": result["updated_field_keys"],
        "copilot_message": result["copilot_message"]
    }

def run_update_agent(user_prompt: str, current_fields: dict) -> dict:
    initial_state: ComplaintState = {
        "raw_text": "",
        "user_prompt": user_prompt,
        "current_fields": current_fields,
        "updated_field_keys": [],
        "copilot_message": ""
    }
    result = update_graph.invoke(initial_state)
    return {
        "extracted_fields": result["current_fields"],
        "updated_field_keys": result["updated_field_keys"],
        "copilot_message": result["copilot_message"]
    }
