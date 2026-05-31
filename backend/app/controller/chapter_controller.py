import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status
from app.utils.db_helpers import execute_smart_bulk_insert, populate_parent_with_children,generate_semantic_id
from app.utils.filter_helpers import populate_all_parents_with_children_paginated
from app.schemas.chapter_schemas import ChapterCreate, BulkChapterCreate
from app.schemas.quiz_schemas import QuizNestedInsideChapterResponse

# =====================================================================
# 1. CREATE SINGLE CHAPTER LOGIC (TARGET WORKFLOW)
# =====================================================================
async def create_chapter_logic(payload: ChapterCreate) -> dict: 
    """
    Validates standalone data elements to map individual chapter paths in database engines.
    Verifies parent constraints before executing database document insertions.
    """
    chapter_collection = get_collection("chapters")
    subject_collection = get_collection("subjects")
    
    subject_id = payload.subject_id
    title = payload.title.strip() if payload.title else ""

    if not subject_id or not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The tracking target configurations subject_id and validation title entries are required attributes."
        )
        
    # Relational Integrity Check: Verify that the parent subject exists to prevent orphaned records
    parent_subject_exists = await subject_collection.find_one({"subject_id": subject_id})
    if not parent_subject_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The parent subject identity tracking code '{subject_id}' does not exist in the database."
        )
        
    # Duplication Check: Ensure case-insensitive uniqueness inside the same subject track boundary
    duplicate_chapter = await chapter_collection.find_one({
        "subject_id": subject_id,
        "title": {"$regex": f"^{title}$", "$options": "i"}
    })
    if duplicate_chapter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A chapter mapped with the title '{title}' already exists under this target subject profile."
        )
    
    # Structure database configuration entity block map securely
    insert_data = payload.model_dump()
    insert_data["title"] = title
    insert_data["chapter_id"] = generate_semantic_id(prefix="chapter", content_value=title)
    
    await chapter_collection.insert_one(insert_data)
    
    # Purge internal system identity mapping nodes before pipeline response serialization
    if "_id" in insert_data:
        del insert_data["_id"]
        
    return insert_data


# =====================================================================
# KEEPING TEMPORARY PLACEHOLDERS TO PREVENT SYSTEM COMPILE CRASHES
# =====================================================================
async def create_chapters_bulk_logic(payload: BulkChapterCreate):
    # Left intact as per user requests for subsequent modular revisions
    data = payload.dict()
    subject_id = data.get("subject_id")
    titles = data.get("titles")
    
    if not subject_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="subject_id is required!")
        
    result = await execute_smart_bulk_insert(
        collection_name="chapters",
        parent_id_key="subject_id",
        parent_id_value=subject_id,
        child_id_key="chapter_id",
        child_id_prefix="chapter",
        items_list=titles,
        match_field_in_db="title"
    )
    return result

async def get_all_chapters_logic(page: int = 1, limit: int = 10):
    # Adjusted parameter metrics layout signatures to align with structural router expectations 
    from app.utils.filter_helpers import populate_all_parents_with_children_paginated
    aggregated_response = await populate_all_parents_with_children_paginated(
        parent_collection="subjects",
        child_collection="chapters",
        child_lookup_field="subject_id",
        page=page,
        limit=limit
    )
    return aggregated_response

async def get_current_chapter_with_quizzes_logic(chapter_id: str):
    chapter_collection = get_collection("chapters")
    
    # DEBUG: Fetch first 5 chapters from DB to see actual existing IDs
    all_existing_chapters = await chapter_collection.find({}).to_list(length=5)
    # print("--- ALL EXISTING CHAPTERS IN DB ---")
    # for doc in all_existing_chapters:
    #     print(f"Chapter ID: {doc.get('chapter_id')} | Subject ID: {doc.get('subject_id')} | Title: {doc.get('title')}")
    # print("-----------------------------------")

    # 1. Fetch the raw chapter document first to verify existence
    chapter_exists = await chapter_collection.find_one({"chapter_id": chapter_id})
    # print("Searched ID:", chapter_id)
    # print("Fetched Chapter Document Result:", chapter_exists)
    
    if not chapter_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration target identity '{chapter_id}' does not exist in chapters dataset."
        )
    
    # 3. Process mapping pipeline since parent verification succeeded safely
    aggregated_data = await populate_parent_with_children(
        parent_id=chapter_id,
        parent_collection="chapters",
        parent_id_field="chapter_id",
        parent_name_field="title",
        child_collection="quizzes",
        child_lookup_field="chapter_id",
        child_schema_model=None
    )
    
    # Debug print to see structured dataset mapping output
    # print("Aggregated Children Layout Data:", aggregated_data)

    # 4. Return clean dictionary structured according to response schema
    return {
        "chapter_id": aggregated_data.get("chapter_id"),
        "chapter_title": aggregated_data.get("chapter_name"),
        "quizzes": aggregated_data.get("quizzes", [])
    }