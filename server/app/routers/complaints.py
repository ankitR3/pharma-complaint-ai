from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintExtractRequest,
    ComplaintUpdateRequest,
    ComplaintExtractResponse,
    ComplaintFields,
)
from app.services.complaint_service import create_complaint, get_all_complaints, delete_complaint, clear_all_complaints
from app.services.document_service import extract_text_from_file
from app.agents.graph import run_extraction_agent, run_update_agent

router = APIRouter()

@router.post("/commit", response_model=ComplaintResponse)
@router.post("/", response_model=ComplaintResponse)
def submit_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    return create_complaint(db, payload)

@router.get("/", response_model=list[ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)):
    return get_all_complaints(db)

@router.delete("/all")
@router.delete("/")
def clear_all_history(db: Session = Depends(get_db)):
    count = clear_all_complaints(db)
    return {"success": True, "message": f"Cleared {count} complaint history records"}

@router.delete("/{complaint_id}")
def delete_single_complaint(complaint_id: int, db: Session = Depends(get_db)):
    success = delete_complaint(db, complaint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    return {"success": True, "message": f"Complaint QMS-2026-00{complaint_id} deleted successfully"}

@router.post("/extract", response_model=ComplaintExtractResponse)
def extract_complaint(payload: ComplaintExtractRequest):
    result = run_extraction_agent(payload.raw_text)
    return ComplaintExtractResponse(
        success=True,
        message=result["copilot_message"],
        extracted_fields=ComplaintFields(**result["extracted_fields"]),
        updated_field_keys=result["updated_field_keys"],
        duplicate_flag=result.get("duplicate_flag", False),
        duplicate_notes=result.get("duplicate_notes", "")
    )

@router.post("/update", response_model=ComplaintExtractResponse)
def update_complaint(payload: ComplaintUpdateRequest):
    result = run_update_agent(payload.user_prompt, payload.current_fields.model_dump())
    return ComplaintExtractResponse(
        success=True,
        message=result["copilot_message"],
        extracted_fields=ComplaintFields(**result["extracted_fields"]),
        updated_field_keys=result["updated_field_keys"],
        duplicate_flag=result.get("duplicate_flag", False),
        duplicate_notes=result.get("duplicate_notes", "")
    )

@router.post("/upload", response_model=ComplaintExtractResponse)
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    raw_text = extract_text_from_file(contents, file.filename)
    result = run_extraction_agent(raw_text)
    
    filename_clean = file.filename
    custom_msg = f"PDF analysis complete. I've successfully extracted the {filename_clean} complaint report. Form populated on the left."
    
    return ComplaintExtractResponse(
        success=True,
        message=custom_msg,
        extracted_fields=ComplaintFields(**result["extracted_fields"]),
        updated_field_keys=result["updated_field_keys"],
        duplicate_flag=result.get("duplicate_flag", False),
        duplicate_notes=result.get("duplicate_notes", "")
    )
