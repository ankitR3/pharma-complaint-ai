from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ComplaintFields(BaseModel):
    complaint_source: Optional[str] = "Pharmacy"
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength_grade: Optional[str] = None
    batch_lot_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    originating_site_block: Optional[str] = "Manufacturing"
    impacted_npm: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    suggested_severity: Optional[str] = "Major"
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None

class ComplaintExtractRequest(BaseModel):
    raw_text: str

class ComplaintUpdateRequest(BaseModel):
    user_prompt: str
    current_fields: ComplaintFields

class ComplaintExtractResponse(BaseModel):
    success: bool = True
    message: str
    extracted_fields: ComplaintFields
    updated_field_keys: List[str] = []

class ComplaintCreate(ComplaintFields):
    pass

class ComplaintResponse(ComplaintFields):
    id: int
    created_at: datetime
    status: str

    class Config:
        from_attributes = True
