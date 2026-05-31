import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status
from app.utils.db_helpers import execute_smart_bulk_insert, populate_parent_with_children,generate_semantic_id
from app.utils.filter_helpers import populate_all_parents_with_children_paginated
from app.schemas.subject_schemas import SubjectCreate, BulkSubjectCreate
from app.schemas.chapter_schemas import ChapterNestedResponse  # Injected dynamic mapping reference



async def create_subject_logic(payload: SubjectCreate)->dict: 
    """
    Validates standalone data elements to map individual subject paths in database engines.
    """
    subject_collection = get_collection("subjects")
    
    exam_id = payload.exam_id
    name = payload.name.strip() if payload.name else ""

    if not exam_id or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The tracking target configurations exam_id and validation name entries are required attributes."
        )
    
    insert_data = payload.model_dump()
    insert_data["name"] = name
    insert_data["subject_id"] = generate_semantic_id(prefix="sub", content_value=name)
    
    await subject_collection.insert_one(insert_data)
    
    if "_id" in insert_data:
        del insert_data["_id"]
        
    return insert_data

async def create_bulk_subjects_logic(payload: BulkSubjectCreate) -> dict:
    """
    Ingests multiple subject tracking items simultaneously under an authenticated operational master parent context.
    """
    exam_id = payload.exam_id
    names_list = payload.names

    if not exam_id or not names_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid parent target mapping attributes and array context name tracking tokens must be specified."
        )

    result = await execute_smart_bulk_insert(
        collection_name="subjects",
        parent_id_key="exam_id",
        parent_id_value=exam_id,
        child_id_key="subject_id",
        child_id_prefix="sub",
        items_list=names_list,
        match_field_in_db="name"
    )

    return result

async def get_all_subjects_by_exam_logic(page: int = 1, limit: int = 10) -> dict:
    """
    Retrieves the complete list of exams with their subjects using the new bulk paginated utility.
    No local looping required here; offloads structural grouping tasks to the specialized wrapper.
    """
    # Simply forwarding the configuration layout directly to our new dedicated helper
    aggregated_response = await populate_all_parents_with_children_paginated(
        parent_collection="exams",
        child_collection="subjects",
        child_lookup_field="exam_id",
        page=page,
        limit=limit
    )
    
    return aggregated_response


async def get_current_subject_with_chapters_logic(subject_id: str) -> dict:
    """
    Aggregates targeted subject metadata tracking information directly tied 
    to a dynamic child chapter mapping array using clean injection design patterns.
    """
    if not subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The operational path tracking key entity configuration identifier context must be provided."
        )
    
    # Executes the generic dynamic relationship aggregation pipeline without circular dependencies
    aggregated_data = await populate_parent_with_children(
        parent_id=subject_id,
        parent_collection="subjects",
        parent_id_field="subject_id",
        parent_name_field="name",
        child_collection="chapters",
        child_lookup_field="subject_id",
        child_schema_model=ChapterNestedResponse
    )
    
    return aggregated_data