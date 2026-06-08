import random
from fastapi import HTTPException, status
from app.config.db import get_collection
from app.schemas.quiz_schemas import QuizCreate, BulkQuizCreate
from app.utils.db_helpers import execute_smart_bulk_insert, populate_parent_with_children, generate_semantic_id, validate_relational_integrity_and_duplicates
from app.utils.filter_helpers import populate_children_paginated

# =====================================================================
# 1. CREATE SINGLE QUIZ LOGIC
# =====================================================================
async def create_quiz_logic(payload: QuizCreate) -> dict:
    quiz_collection = get_collection("quizzes")
    name = payload.name.strip() if payload.name else ""
    
    if not payload.chapter_id or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The tracking target configurations chapter_id and name entries are required attributes."
        )

    # MAGIC HAPPENS HERE: Your reusable validator replaces 20 lines of messy code
    await validate_relational_integrity_and_duplicates(
        parent_collection="chapters",
        parent_lookup_key="chapter_id",
        parent_lookup_value=payload.chapter_id,
        child_collection="quizzes",
        child_match_field="name",
        child_match_value=name,
        parent_error_msg=f"The parent chapter identity tracking code '{payload.chapter_id}' does not exist in the database.",
        duplicate_error_msg=f"A quiz mapped with the name '{name}' already exists under this target chapter profile."
    )
        
    # Database document injection configuration map
    insert_data = payload.model_dump()
    insert_data["name"] = name
    insert_data["quiz_id"] = generate_semantic_id(prefix="quiz", content_value=name)
    insert_data["total_questions"] = 0  
    
    await quiz_collection.insert_one(insert_data)
    
    if "_id" in insert_data:
        del insert_data["_id"]
        
    return insert_data


# =====================================================================
# 2. BULK INGESTION LOGIC
# =====================================================================
async def create_quizzes_bulk_logic(payload: BulkQuizCreate):
    data = payload.model_dump()
    chapter_id = data.get("chapter_id")
    names = data.get("names")
    
    if not chapter_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="chapter_id is required!")
        
    result = await execute_smart_bulk_insert(
        collection_name="quizzes",
        parent_id_key="chapter_id",
        parent_id_value=chapter_id,
        child_id_key="quiz_id",
        child_id_prefix="quiz",
        items_list=names,
        match_field_in_db="name"
    )
    return result


# =====================================================================
# 3. GET PAGINATED QUIZZES BY CHAPTER (PERFECTLY SYNCED WITH UTILITY)
# =====================================================================
async def get_all_quizzes_logic(page: int = 1, limit: int = 10):
    # Now perfectly matching structural schema constraints
    aggregated_response = await populate_children_paginated(
        child_collection="quizzes",
        child_lookup_field="chapter_id",
        page=page,
        limit=limit
    )
    return aggregated_response


# =====================================================================
# 4. GET SINGLE QUIZ WITH QUESTIONS WORKFLOW
# =====================================================================
async def get_current_quiz_details_logic(quiz_id: str):
    quiz_collection = get_collection("quizzes")
    
    # Validation step to ensure no wrong IDs process deeper logic
    quiz_exists = await quiz_collection.find_one({"quiz_id": quiz_id})
    if not quiz_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration target quiz identity '{quiz_id}' does not exist."
        )
        
    # Mapping next level down to Questions (quiz -> questions)
    aggregated_data = await populate_parent_with_children(
        parent_id=quiz_id,
        parent_collection="quizzes",
        parent_id_field="quiz_id",
        parent_name_field="name",
        child_collection="questions",  # Target database tracking questions layer
        child_lookup_field="quiz_id",
        child_schema_model=None
    )

    raw_questions = aggregated_data.get("questions", [])
    formatted_questions = []

    for qn in raw_questions:
        db_options = qn.get("options") or []
        flat_options = [opt.get("text") for opt in db_options if isinstance(opt, dict)]

        real_correct_txt = ""

        formatted_questions.append({
            "question_id": qn.get("question_id"),
            "question_text": qn.get("question_text"),
            "options": flat_options,
            "correct_answer": flat_options[random.randint(0, len(flat_options)-1)] if flat_options else "",
            "marks": qn.get("marks", 1)
        })

    return {
        "quiz_id": aggregated_data.get("quiz_id"),
        "quiz_name": quiz_exists.get("name") or aggregated_data.get("quiz_name") or aggregated_data.get("name") or "Unnamed Quiz",
        "questions": formatted_questions
    }