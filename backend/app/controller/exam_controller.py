import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status
from app.utils.db_helpers import generate_semantic_id

async def create_exam_logic(payload: ExamCreate)->dict:
    """
    Validates the exam creation payload, generates a unique exam_id,
    saves the data into MongoDB, and returns the serialized exam record.
    """
    data = payload.model_dump()
    exam_collection = get_collection("exams")
    
    # Simple formatting and empty check
    name = data.get("name", "").strip()
    if not name:
       raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Exam name cannot be empty."
        )
        
    # Generate unique exam_id using short uuid format
    data["exam_id"] = generate_semantic_id(prefix="exam", content_value=name)
    data["name"] = name
    
    await exam_collection.insert_one(data)
    
   # Remove MongoDB's default _id field from response to avoid JSON serialization issues
    if "_id" in data: 
        del data["_id"]
        
    return data



async def get_all_exams_logic() -> list:
    """
    Retrieves all exams from the database directly without nesting subjects.
    Optimized to handle scale (20+ items) efficiently by dropping nested sub-queries.
    """
    exam_collection = get_collection("exams")
    
    # Fetch all exams up to a safe threshold
    exams = await exam_collection.find({}).to_list(length=100)
    
    # Clean up MongoDB system keys before returning
    for exam in exams:
        if "_id" in exam:
            del exam["_id"]
            
    return exams


async def get_current_exam_logic(exam_id: str) -> dict:
    """
    Retrieves the details of a single specific exam and dynamically binds 
    its mapped subjects for the secondary drill-down screen.
    """
    exam_collection = get_collection("exams")
    subject_collection = get_collection("subjects")
    
    # Fetch the specific exam profile
    exam = await exam_collection.find_one({"exam_id": exam_id})
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Exam with ID '{exam_id}' not found."
        )
        
    # Fetch all subjects matching this exam_id dynamically
    subjects_cursor = subject_collection.find({"exam_id": exam_id})
    all_subjects = await subjects_cursor.to_list(length=100)
    
    exam_subjects = []
    # Map and clean the nested child structure
    for sub in all_subjects:
        exam_subjects.append({
            "subject_id": sub.get("subject_id"),
            "name": sub.get("name")
        })
        
    # Construct the final nested response payload
    response_data = {
        "exam_id": exam.get("exam_id"),
        "exam_name": exam.get("name"),
        "description": exam.get("description", None),
        "subjects": exam_subjects
    }
    
    return response_data
