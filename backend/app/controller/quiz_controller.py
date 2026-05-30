import uuid
from fastapi import HTTPException, status
from app.config.db import get_collection
from app.utils.db_helpers import populate_parent_with_children,

async def create_quiz_logic(payload: dict): # 👈 Argument ka naam 'payload' rakho
    subject_collection = get_collection("quizzes")
    
    chapter_id = payload.get("chapter_id")
    title = payload.get("title")
    questions = payload.get("questions", [])

    if not chapter_id or not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="chapter_id and title are required"
        )
        
    quiz_id = f"quiz_{uuid.uuid4().hex[:8]}"
    processed_questions = []
    calculated_total_score = 0

    for q in questions:
        q_id = q.get("question_id") or f"q_{uuid.uuid4().hex[:6]}"
        q_score = q.get("score", 1)
        calculated_total_score += q_score
        
        processed_questions.append({
            "question_id": q_id,
            "text": q.get("text"),
            "options": q.get("options"),
            "correct_answer": q.get("correct_answer"),
            "score": q_score
        })

    insert_data = {
        "quiz_id": quiz_id,
        "chapter_id": chapter_id,
        "title": title,
        "description": payload.get("description", ""), # 👈 Ab yeh bind ho jayega safely
        "questions": processed_questions,
        "score": calculated_total_score
    }

    await subject_collection.insert_one(insert_data)
    insert_data.pop("_id", None)
    return insert_data

async def get_all_quizzes_logic(chapter_id: str):
    aggregated_data = await populate_parent_with_children(
        parent_id=chapter_id,
        parent_collection="chapters",
        parent_id_field="chapter_id",
        parent_name_field="title",       
        child_collection="quizzes",      
        child_lookup_field="chapter_id",  
        child_schema_model=None
    )
    
    # Agar chapter mila par usme koi quiz nahi hai, aur tum 404 chahte ho:
    if not aggregated_data.get("quizzes"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No quizzes found for chapter_id: {chapter_id}"
        )
        
    return aggregated_data