from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    # 1. Origin & Customer Details
    complaint_source = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)

    # 2. Product & Batch Identification
    product_name = Column(String, nullable=True)
    product_strength_grade = Column(String, nullable=True)
    batch_lot_number = Column(String, nullable=True)
    affected_quantity = Column(String, nullable=True)
    manufacturing_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)

    # 3. Facility & Material Impact
    originating_site_block = Column(String, nullable=True)
    impacted_npm = Column(String, nullable=True)

    # 4. Defect Analysis
    complaint_category = Column(String, nullable=True)
    complaint_description = Column(Text, nullable=True)

    # 5. AI Copilot Risk Assessment
    suggested_severity = Column(String, nullable=True)
    suggested_next_action = Column(String, nullable=True)
    initial_risk_assessment = Column(Text, nullable=True)

    status = Column(String, default="Committed")
    created_at = Column(DateTime, server_default=func.now())
