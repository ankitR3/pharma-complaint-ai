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
    return db.query(Complaint).order_by(Complaint.id.desc()).all()

def delete_complaint(db: Session, complaint_id: int) -> bool:
    record = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if record:
        db.delete(record)
        db.commit()
        return True
    return False

def clear_all_complaints(db: Session) -> int:
    num_deleted = db.query(Complaint).delete()
    db.commit()
    return num_deleted
