import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status
from app.utils.db_helpers import populate_parent_with_children

async def create_subject_logic(payload: SubjectCreate): 
    subject_collection = get_collection("subjects")
    
    # 
    exam_id = payload.exam_id
    name = payload.name
    # Validation: exam_id and name are required fields for creating a subject. If either is missing, we will return a 400 Bad Request with a clear message.
    if not exam_id or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="exam_id aur name dono bhejna zaroori hai bhai!"
        )
    
    # First convert the playload to a dict, then add a unique subject_id using uuid, and then insert into DB.
    insert_data = payload.dict()
    insert_data["subject_id"] = f"subject_{uuid.uuid4().hex[:8]}"
    
    await subject_collection.insert_one(insert_data)
    insert_data.pop("_id", None)
    return insert_data

async def get_all_subjects_logic(exam_id: str):
    if not exam_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="exam_id is required"
        )
    
    # It will make just 1 call to DB, and return parent details + nested children array without repetition in one go
    aggregated_data = await populate_parent_with_children(
        parent_id=exam_id,
        parent_collection="exams",
        parent_id_field="exam_id",
        parent_name_field="name",
        child_collection="subjects",
        child_lookup_field="exam_id",
        child_schema_model=None # It is kept None for now, but in future if we want to parse/validate each child document with a Pydantic model before sending response, we can easily do that here by passing the model and applying it to each child in the loop above in db_helpers function.
    )
    
    return aggregated_data