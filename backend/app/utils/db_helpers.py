from fastapi import HTTPException, status
from typing import List, Dict, Any
from app.config.config import get_collection

async def populate_parent_with_children(
    parent_id: str,
    parent_collection: str,
    parent_id_field: str,
    parent_name_field: str,
    child_collection: str,
    child_lookup_field: str,
    child_schema_model
) -> Dict[str, Any]:
    """
   everything in one function - parent details + nested children array without repetition
   - parent_id: The ID of the parent document (e.g., exam_id)
    """
    
    p_coll = get_collection(parent_collection)
    c_coll = get_collection(child_collection)
    
    # 1. Fetch the parent document (e.g., Exam details)
    parent_doc = await p_coll.find_one({parent_id_field: parent_id})
    if not parent_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Parent document with id {parent_id} not found in {parent_collection}"
        )
    
    # 2. Find all children documents (e.g., Subjects for that Exam) using the lookup field (e.g., exam_id)
    children_cursor = c_coll.find({child_lookup_field: parent_id})
    children = await children_cursor.to_list(length=100)
    
    cleaned_children = []
    for child in children:
        # BSON ObjectId safe cleanup string conversion
        if "_id" in child: 
            del child["_id"]
        
        # Remove the child lookup field from each child document to avoid repetition in the final payload
        if child_lookup_field in child:
            del child[child_lookup_field]
            
        cleaned_children.append(child)
        
    # 3. Final response payload construction
    response_payload = {
        f"{parent_id_field}": parent_id,
        f"{parent_collection.rstrip('s')}_name": parent_doc.get(parent_name_field, parent_doc.get("name")),
        "description": parent_doc.get("description", None),
        f"{child_collection}": cleaned_children # Pure nested array format without repetition
    }
    
    return response_payload