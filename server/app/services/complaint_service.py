from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate

def create_complaint(db: Session, payload: ComplaintCreate) -> Complaint:
    db_complaint = Complaint(**payload.model_dump())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

def get_all_complaints(db: Session) -> list[Complaint]:
    return db.query(Complaint).all()
