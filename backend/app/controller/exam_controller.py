import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status

async def create_exam_logic(data: dict):
    exam_collection = get_collection("exams")
    exam_id = f"exam_{uuid.uuid4().hex[:6]}"
    data["exam_id"] = exam_id
    
    await exam_collection.insert_one(data)
    if "_id" in data: del data["_id"]
    return data

async def get_all_exams_logic():
    exam_collection = get_collection("exams")
    exams = await exam_collection.find().to_list(length=100).populate("subjects")
    for e in exams:
        if "_id" in e: del e["_id"]
    return exams