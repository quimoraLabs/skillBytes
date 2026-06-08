import random
from fastapi import HTTPException, status
from app.config.db import get_collection
from app.utils.db_helpers import populate_parent_with_children ,execute_smart_bulk_insert,generate_semantic_id # For the get-details logic
from app.schemas.question_schemas import SingleQuestionCreatePayload, BulkQuestionCreatePayload
from app.utils.filter_helpers import populate_children_paginated, remove_key_recursively

# =====================================================================
# 1. CREATE SINGLE QUESTION LOGIC
# =====================================================================
async def create_single_question_logic(payload: SingleQuestionCreatePayload) -> dict:
    quiz_collection = get_collection("quizzes")
    question_collection = get_collection("questions")
    # print("Received payload for single question creation:", payload)
    # Check parent quiz presence
    quiz_exists = await quiz_collection.find_one({"quiz_id": payload.quiz_id})
    if not quiz_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz ID '{payload.quiz_id}' not found."
        )
    
    # Extract structural items
    qn_data = payload.question
    clean_text = qn_data.question_text.strip()
    
    # 4. Use your custom utility 'generate_semantic_id'
    generated_id = generate_semantic_id(prefix="question", content_value=clean_text[:20])
    
    # Prepare MongoDB document layout
    new_doc = {
        "question_id": generated_id,
        "quiz_id": payload.quiz_id,
        "question_text": clean_text,
        "options": [opt.model_dump() for opt in qn_data.options], # Saves array of dicts with isCorrect
        "marks": qn_data.marks
    }
    
    await question_collection.insert_one(new_doc)
    
    # Increment metrics total_questions in parent quiz
    await quiz_collection.update_one({"quiz_id": payload.quiz_id}, {"$inc": {"total_questions": 1}})
    
    return {"status": "success", "question_id": generated_id}

# =====================================================================
# 2. CREATE BULK QUESTIONS LOGIC (USING SMART BULK UTILITY)
# =====================================================================

async def create_bulk_questions_logic(payload: BulkQuestionCreatePayload) -> dict:
    quiz_collection = get_collection("quizzes")
    
    # Verify parent domain
    quiz_exists = await quiz_collection.find_one({"quiz_id": payload.quiz_id})
    if not quiz_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz ID '{payload.quiz_id}' not found for bulk ingestion."
        )

    # Convert Pydantic object list into plain dict array
    raw_items_list = []
    for q in payload.questions:
        raw_items_list.append({
            "question_text": q.question_text.strip(),
            "options": [
                {
                    "text": opt.text,
                    "isCorrect": opt.isCorrect  # Direct dot notation forces this field into DB
                }
                for opt in q.options
            ],
            "marks": q.marks
        })

    # Execute using custom bulk insert utility
    bulk_result = await execute_smart_bulk_insert(
        collection_name="questions",
        parent_id_key="quiz_id",
        parent_id_value=payload.quiz_id,
        child_id_key="question_id",
        child_id_prefix="question",
        items_list=raw_items_list,
        match_field_in_db="question_text"
    )
    
    # Safely extract the final integer count from the raw utility response
    if isinstance(bulk_result, dict):
        final_count = (
            bulk_result.get("saved_count") 
            or bulk_result.get("inserted_count") 
            or len(bulk_result.get("saved_items", [])) 
            or len(bulk_result.get("inserted_ids", [])) 
            or 0
        )
    else:
        final_count = int(bulk_result or 0)
    
    # Update parent analytics counters if new questions were added
    if final_count > 0:
        await quiz_collection.update_one(
            {"quiz_id": payload.quiz_id}, 
            {"$inc": {"total_questions": final_count}}
        )

    # Determine top-level API status
    utility_status = "success"
    if isinstance(bulk_result, dict):
        utility_status = bulk_result.get("status", "success")

    # Generate the top-level API message
    if final_count > 0:
        message = f"Successfully processed items. Injected {final_count} new question documents."
    elif utility_status == "failed" or (isinstance(bulk_result, dict) and bulk_result.get("errors")):
        message = "Bulk ingestion completed with skipped items or errors."
    else:
        message = "No new questions were injected. All items were skipped or duplicates."

    # Build a lightweight, scalable summary object to prevent memory bloat/crashes
    summary_details = {
        "saved_count": final_count,
        "failed_count": 0,
        "error_summary": {}
    }

    if isinstance(bulk_result, dict):
        errors_list = bulk_result.get("errors", [])
        summary_details["failed_count"] = len(errors_list)
        
        # Group and count error reasons dynamically without passing raw index lists
        for err in errors_list:
            reason = err.get("reason", "unknown_error")
            summary_details["error_summary"][reason] = summary_details["error_summary"].get(reason, 0) + 1

    # Final unified and clean response
    return {
        "status": utility_status,
        "message": message,
        "details": summary_details
    }

async def get_all_questions_by_quizzes_logic(page: int = 1, limit: int = 10):
    # 1. Fetch paginated quiz documents with nested question children
    aggregated_response = await populate_children_paginated(
        parent_collection="quizzes",
        child_collection="questions",
        child_lookup_field="quiz_id",
        page=page,
        limit=limit
    )

    raw_quizzes = aggregated_response.get("quizzes", [])
    formatted_quizzes = []  # Saare formatted quizzes isme store honge

    # 2. Loop through each quiz inside the paginated result
    for quiz in raw_quizzes:
        raw_questions = quiz.get("questions", [])
        formatted_questions = []

        # 3. Loop through each question inside the quiz
        for qn in raw_questions:
            db_options = qn.get("options") or []
            # Extract flat string array of options for security
            flat_options = [opt.get("text") for opt in db_options if isinstance(opt, dict)]

            # Secure Honeypot: Random wrong/fake answer injection
            honeypot_answer = flat_options[random.randint(0, len(flat_options)-1)] if flat_options else ""

            formatted_questions.append({
                "question_id": qn.get("question_id"),
                "question_text": qn.get("question_text"),
                "options": flat_options,
                "correct_answer": honeypot_answer,
                "marks": qn.get("marks", 1)
            })

        # 4. Corrected mapping using 'quiz' properties instead of undefined variables
        formatted_quizzes.append({
            "quiz_id": quiz.get("quiz_id"),
            "quiz_name": quiz.get("name") or quiz.get("quiz_name") or "Unnamed Quiz",
            "questions": formatted_questions
        })

    # 5. FINAL RETURN: Must match PaginatedQuizWithQuestionsResponse schema
    return {
        "total_quizzes": aggregated_response.get("total_quizzes", len(formatted_quizzes)),
        "total_pages": aggregated_response.get("total_pages", 1),
        "current_page": aggregated_response.get("current_page", page),
        "quizzes": formatted_quizzes  # Ab list puri formatted jaayegi!
    }


async def get_current_question_details_logic(question_id: str):
    question_collection = get_collection("questions")

    question_doc = await question_collection.find_one({"question_id": question_id})
    if not question_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question ID '{question_id}' does not exist."
        )

    if "_id" in question_doc:
        del question_doc["_id"]

    db_options = question_doc.get("options") or []
    flat_options = [opt.get("text") for opt in db_options if isinstance(opt, dict)]

    return {
        "question_id": question_doc.get("question_id"),
        "question_text": question_doc.get("question_text"),
        "options": flat_options,
        "correct_answer": flat_options[random.randint(0, len(flat_options)-1)] if flat_options else "",
        "marks": question_doc.get("marks", 1)
    }
