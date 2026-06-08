from typing import Dict, Any, Tuple ,List
from app.config.db import get_collection

def remove_key_recursively(data: any, key_to_remove: str = "isCorrect") -> any:
    """
    Recursively scans and removes a specific key from any complex nested dictionary or list.
    Ensures student API responses are sanitized to prevent cheat leaks.
    """
    if isinstance(data, dict):
        # Create a new dictionary excluding the target key
        return {
            k: remove_key_recursively(v, key_to_remove) 
            for k, v in data.items() if k != key_to_remove
        }
    elif isinstance(data, list):
        # Process every item in the list recursively
        return [remove_key_recursively(item, key_to_remove) for item in data]
    
    # Return primitive data types as-is
    return data



def get_page_meta(total_items: int, page: int, limit: int) -> Tuple[Dict[str, Any], int]:
    """
    Simple mathematical engine to return standard page controls and calculate query slice offset.
    """
    current_page = max(1, page)
    row_limit = max(1, limit)
    
    skip_offset = (current_page - 1) * row_limit
    total_pages = (total_items + row_limit - 1) // row_limit
    
    meta = {
        "total_items": total_items,
        "current_page": current_page,
        "limit": row_limit,
        "total_pages": total_pages,
        "has_next": current_page < total_pages,
        "has_prev": current_page > 1
    }
    
    return meta, skip_offset


async def populate_children_paginated(
    child_collection: str,        # e.g., "subjects", "chapters", "quizzes"
    child_lookup_field: str,      # e.g., "exam_id", "subject_id"
    query_filter: dict = None,
    page: int = 1,
    limit: int = 10
) -> dict:
    """
    Super-Lean Universal Pagination Engine:
    Direct count, pagination slicing, and clean flat mapping. No extra lookups.
    """
    c_coll = get_collection(child_collection)
    
    if query_filter is None:
        query_filter = {}
        
    total_items = await c_coll.count_documents(query_filter)
    meta, skip_offset = get_page_meta(total_items=total_items, page=page, limit=limit)
    
    child_cursor = c_coll.find(query_filter).skip(skip_offset).limit(limit)
    raw_children = await child_cursor.to_list(length=limit)
    
    collection_prefixes = {
        "exams": "exam", "subjects": "subject", "chapters": "chapter", 
        "quizzes": "quiz", "questions": "question"
    }
    child_prefix = collection_prefixes.get(child_collection, child_collection.rstrip('s'))
    
    flat_output_list = []
    
    for child in raw_children:
        custom_child_id = str(child.get(f"{child_prefix}_id") or child.get("_id"))
        # Ekdum clean aur compact response element
        node = {
            "id": custom_child_id,
             f"{child_prefix}_id": custom_child_id,  # Specific business logic ke liye (e.g., 'subject_id' ya 'chapter_id') [ts]
            "name": child.get("name") or "Unnamed Node",
            "description": child.get("description", ""),
            child_lookup_field: child.get(child_lookup_field) # Sirf relational ID pass hoga, no names complexity!
        }
        
        if not node.get("description"):
            del node["description"]
            
        flat_output_list.append(node)
        
    return {
        "data": flat_output_list,
        "pagination": meta
    }
