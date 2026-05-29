import uuid
from app.config.db import get_collection
from fastapi import HTTPException, status

async def create_exam_logic(payload: ExamCreate):
    data = payload.dict()
    exam_collection = get_collection("exams")
    
    # Simple formatting
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name to likho bhai!")
        
    # create unique exam_id using uuid and prefix
    exam_id = f"exam_{uuid.uuid4().hex[:6]}"
    data["exam_id"] = exam_id
    data["name"] = name
    
    await exam_collection.insert_one(data)
    
    # Remove MongoDB's default _id field from response to avoid FastAPI JSON serialization issues
    if "_id" in data: 
        del data["_id"]
        
    return data



async def get_all_exams_logic():
    exam_collection = get_collection("exams")
    subject_collection = get_collection("subjects")
    
    # 1. Database se saare exams aur saare subjects ek hi baar me nikal liye
    exams = await exam_collection.find({}).to_list(length=100)
    all_subjects = await subject_collection.find({}).to_list(length=500)
    
    # 2. Python memory me hi data ko fit karenge (No pipeline, no complexity)
    for exam in exams:
        # Mongo ki default _id saaf ki
        if "_id" in exam: 
            del exam["_id"]
            
        exam_id = exam.get("exam_id")
        exam_subjects = []
        
        # Is specific exam_id ke subjects dhoodho
        for sub in all_subjects:
            if sub.get("exam_id") == exam_id:
                # Subject ka ek clean copy banao taaki bar-bar _id ka error na aaye
                clean_sub = {
                    "subject_id": sub.get("subject_id"),
                    "name": sub.get("name")
                    # exam_id ko yahan repeat nahi kiya, kyuki wo top par hai!
                }
                exam_subjects.append(clean_sub)
                
        # Exam object ke andar subjects ki list daal di
        exam["subjects"] = exam_subjects
        
    return exams

