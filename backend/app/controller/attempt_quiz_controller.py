import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.config.config import get_collection

async def start_quiz_session_logic(payload: dict):
    session_collection = get_collection("quiz_sessions")
    quiz_collection = get_collection("quizzes")
    
    user_id = payload.get("user_id")
    chapter_id = payload.get("chapter_id")
    
    if not user_id or not chapter_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id and chapter_id are required to start a session"
        )
        
    # Verify if a quiz actually exists for this chapter
    quiz = await quiz_collection.find_one({"chapter_id": chapter_id})
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No quiz found for chapter_id: {chapter_id}"
        )
        
    # Create a unique session document
    session_id = f"sess_{uuid.uuid4().hex[:8]}"
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "chapter_id": chapter_id,
        "quiz_id": quiz.get("quiz_id"),
        "status": "ongoing",
        "started_at": datetime.now(timezone.utc),
        "responses": [],
        "total_score": 0
    }
    
    await session_collection.insert_one(session_data)
    session_data.pop("_id", None)  # Remove BSON ObjectId
    
    return session_data