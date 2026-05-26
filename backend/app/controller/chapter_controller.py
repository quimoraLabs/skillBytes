import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status

async def create_chapter_logic(data: dict):
    chapter_collection = get_collection("chapters")
    subject_id = data.get("subject_id")
    if not subject_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="subject_id is required")
    chapter_id = f"chapter_{uuid.uuid4().hex[:6]}"
    data["chapter_id"] = chapter_id

    await chapter_collection.insert_one(data)
    if "_id" in data: del data["_id"]
    return data

async def get_all_chapters_logic(subject_id: str):
    if not subject_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="subject_id is required")
    chapter_collection = get_collection("chapters")
    chapters = await chapter_collection.find({"subject_id": subject_id}).to_list(length=100)
    for c in chapters:
        if "_id" in c: del c["_id"]
    return chapters