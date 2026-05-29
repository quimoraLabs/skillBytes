import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status
from app.utils.db_helpers import populate_parent_with_children
from app.utils.smart_bulk_insert import execute_smart_bulk_insert

async def create_chapters_bulk_logic(payload: BulkChapterCreate):
    data = payload.dict()
    subject_id = data.get("subject_id")
    titles = data.get("titles")
    
    if not subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="subject_id bhejna zaroori hai bhai!"
        )
        
    # Calling our super smart, super efficient, super DRY bulk insert function! one function, multiple use cases (subjects, chapters, quizzes) for reusable! It will handle clean and duplicate checks, unique ID generation, and insertion in one go!
    result = await execute_smart_bulk_insert(
        collection_name="chapters",
        parent_id_key="subject_id",
        parent_id_value=subject_id,
        child_id_key="chapter_id",
        child_id_prefix="chapter",
        items_list=titles,
        match_field_in_db="title" # check for duplicates based on chapter title in DB (case-insensitive)
    )
    
    return result

async def get_all_chapters_logic(subject_id: str):
    if not subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="subject_id is required"
        )
    
    # Call the helper function to populate the exam with its subjects and their chapters. This will give us a nested structure in one go, without multiple DB calls in the controller. The helper function is designed to be flexible for future use cases (like populating subjects with chapters and quizzes) by just changing the parameters.
    aggregated_data = await populate_parent_with_children(
        parent_id=subject_id,
        parent_collection="subjects",
        parent_id_field="subject_id",
        parent_name_field="name",
        child_collection="chapters",
        child_lookup_field="subject_id",
        child_schema_model=None # we can pass a Pydantic model here for validation and shaping the child data if needed in the future, but for now we will return all fields as is from DB for simplicity
    )
    
    return aggregated_data