import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status

async def create_subject_logic(data: dict):
    subject_collection = get_collection("subjects")
    exam_id = data.get("exam_id")
    if not exam_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="exam_id is required")
    subject_id = f"subject_{uuid.uuid4().hex[:6]}"
    data["subject_id"] = subject_id

    await subject_collection.insert_one(data)
    if "_id" in data: del data["_id"]
    return data

async def get_all_subjects_logic(exam_id: str):
    if not exam_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="exam_id is required")
    subject_collection = get_collection("subjects")
    subjects = await subject_collection.find({"exam_id": exam_id}).to_list(length=100)
    for s in subjects:
        if "_id" in s: del s["_id"]
    return subjects