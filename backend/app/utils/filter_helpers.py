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


async def populate_all_parents_with_children_paginated(
    parent_collection: str,
    child_collection: str,
    child_lookup_field: str,
    page: int = 1,
    limit: int = 10
) -> dict:
    """
    Fetches all records from a parent collection, applies pagination slicing,
    and loops through the slice to attach matching relational child datasets.
    Strictly tracks the custom unique string identifier instead of database system object keys.
    """
    # 1. Fetch the collection handlers dynamically using the database engine
    p_coll = get_collection(parent_collection)
    c_coll = get_collection(child_collection)
    
    # 2. Extract the complete parent dataset cursor to calculate totals
    parent_cursor = p_coll.find({})
    raw_parents = await parent_cursor.to_list(length=1000)
    total_items = len(raw_parents)
    
    # 3. Trigger the local mathematical pagination engine
    meta, skip_offset = get_page_meta(total_items=total_items, page=page, limit=limit)
    
    # 4. Slice the master parent dataset based on layout boundary offsets
    paginated_parents = raw_parents[skip_offset : skip_offset + limit]
    
    paginated_output_list = []
    collection_prefixes = {
        "exams": "exam",
        "subjects": "subject",
        "chapters": "chapter",
        "quizzes": "quiz",        
        "questions": "question"
    }
    parent_type_prefix = collection_prefixes.get(parent_collection, parent_collection.rstrip('s')) # Converts "exams" to "exam"
    
    # 5. Continuous loop execution across the sliced dataset array
    for parent in paginated_parents:
        # Extract the user-defined human-readable unique string identity (e.g., "exam_gate_2026_cs")
        # Target field string is constructed dynamically to maintain component neutrality
        target_id_field_key = f"{parent_type_prefix}_id"
        custom_parent_id_str = str(parent.get(target_id_field_key) or parent.get("exam_id"))
        
        # Query children documents using strict string matching against the custom reference identity
        children_cursor = c_coll.find({child_lookup_field: custom_parent_id_str})
        raw_children = await children_cursor.to_list(length=100)
        
        cleaned_children = []
        for child in raw_children:
            # Safe BSON mutation to prevent system object reference serialization leaks
            child_id_str = str(child.get("subject_id") or child.get("_id"))
            if "_id" in child:
                del child["_id"]
                
            # Inject flat formatted tracking identities for child elements
            child["subject_id"] = child_id_str
            
            # Strip redundant relational parameters to minimize payload inflation
            if child_lookup_field in child:
                del child[child_lookup_field]
                
            cleaned_children.append(child)

        # FIX 2: Dynamic fallback check for string name fields (resolves both 'name' and 'title')
        resolved_parent_name = parent.get("name") or parent.get("title") or "Untitled Node"
            
        # Construct the unified structural layout node for this iteration
        node = {
            f"{parent_type_prefix}_id": custom_parent_id_str,
            f"{parent_type_prefix}_name": resolved_parent_name,
            "description": parent.get("description", ""),
            f"{child_collection}": cleaned_children
        }
        
        # Dynamically cleanup optional attributes if they evaluate to empty or None
        if not node.get("description"):
            del node["description"]
            
        paginated_output_list.append(node)
        
    # 6. Return the finalized structural layout along with pagination control keys
    return {
        f"{parent_collection}": paginated_output_list,
        "pagination": meta
    }