from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import complaints

# Auto-create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIVOA QMS Customer Complaint Assistant API",
    description="Backend AI service for customer complaint extraction and risk classification",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])
app.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])

@app.get("/")
def root():
    return {"status": "online", "message": "AIVOA QMS Complaint Management API Service Running"}
