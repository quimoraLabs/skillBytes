import uuid
from fastapi import status
from typing import List, Dict, Any
from app.config.db import get_collection

async def execute_smart_bulk_insert(
    collection_name: str,       # which collection to insert into (e.g., "subjects", "chapters", "quizzes")
    parent_id_key: str,        # Parent mapping key (e.g., "exam_id", "subject_id", "chapter_id")
    parent_id_value: str,      # Actual parent id (e.g., "exam_ee51fa")
    child_id_key: str,         # New child ID field name (e.g., "subject_id", "chapter_id", "quiz_id")
    child_id_prefix: str,      # ID's prefix (e.g., "subject", "chapter", "quiz")
    items_list: List[Any],     # List of items to insert (can be list of strings or list of dicts depending on use case)
    match_field_in_db: str     # check for duplicates based on this field in DB (e.g., "name" for subjects/chapters, "question_text" for quizzes)
) -> Dict[str, Any]:
    
    collection = get_collection(collection_name)
    
    # 1. Check for duplicates in DB and also clean the incoming items list (trim spaces, remove empty items)
    # It will help us to reduce the number of records we have to fetch from DB for duplicate check, and also avoid false duplicates due to leading/trailing spaces in strings. For dict items, we will look into the specific field (like "name" or "question_text") for cleaning and duplicate checks.
    cleaned_items = [str(item).strip() if not isinstance(item, dict) else item.get(match_field_in_db, "").strip() for item in items_list if item]
    
    existing_records = await collection.find({
        parent_id_key: parent_id_value,
        match_field_in_db: {"$in": cleaned_items}
    }).to_list(length=200)
    
    existing_values = {r[match_field_in_db].lower() for r in existing_records}
    
    docs_to_insert = []
    failed_items = []
    seen_in_batch = set()
    
    # 2. Main loop to prepare documents for insertion, while checking for duplicates in DB and within the incoming batch itself
    for idx, item in enumerate(items_list):
        # Handle both flat lists (strings) and complex lists (dicts like full QuestionSchema)
        is_dict = isinstance(item, dict)
        item_value = item.get(match_field_in_db, "").strip() if is_dict else str(item).strip()
        
        # Check 1:empty value check (after trimming spaces)
        if not item_value:
            failed_items.append({"index": idx, "reason": "empty"})
            continue
            
        # Check 2: Duplicate in DB check (case-insensitive)
        if item_value.lower() in existing_values:
            failed_items.append({"index": idx, "reason": "duplicate_in_db"})
            continue
            
        # Check 3: Current batch duplicate check (case-insensitive)
        if item_value.lower() in seen_in_batch:
            failed_items.append({"index": idx, "reason": "duplicate_in_batch"})
            continue
            
        seen_in_batch.add(item_value.lower())
        
        # New Unique ID generation
        generated_id = f"{child_id_prefix}_{uuid.uuid4().hex[:6]}"
        
        # Document document blueprint dynamic creation
        if is_dict:
            doc = item.copy()
            doc[parent_id_key] = parent_id_value
            doc[child_id_key] = generated_id
        else:
            doc = {
                parent_id_key: parent_id_value,
                child_id_key: generated_id,
                match_field_in_db: item_value
            }
            
        docs_to_insert.append(doc)
        
    # 3. Save only valid items to database
    if docs_to_insert:
        await collection.insert_many(docs_to_insert)
        for d in docs_to_insert:
            if "_id" in d: del d["_id"]
            
    return {
        "status": "partial_success" if failed_items and docs_to_insert else ("success" if not failed_items else "failed"),
        "saved_count": len(docs_to_insert),
        "saved_items": docs_to_insert,
        "errors": failed_items # Indexes for frontend red light
    }