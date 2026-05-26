import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["skillbytes_db"] # Apne DB ka naam cross check kar lena

async def seed():
    print("Seeding database...")
    
    # 1. Clean old data
    await db.exams.drop()
    await db.subjects.drop()
    await db.chapters.drop()
    await db.quiz_sessions.drop()
    
    # 2. Insert Dummy Exam
    exam = {"exam_id": "exam_jee", "name": "JEE Exam 2026", "description": "Engineering Entrance"}
    await db.exams.insert_one(exam)
    
    # 3. Insert Dummy Subject
    subject = {"subject_id": "sub_maths", "exam_id": "exam_jee", "name": "Mathematics"}
    await db.subjects.insert_one(subject)
    
    # 4. Insert Dummy Chapter
    chapter = {"chapter_id": "ch_calculus", "subject_id": "sub_maths", "title": "Calculus Basic"}
    await db.chapters.insert_one(chapter)
    
    # 5. Insert Fake Quiz Sessions for Analytics (Past 7 Days data)
    statuses = ["completed", "abandoned"]
    
    for i in range(100): # 100 fake sessions banate hain
        user_id = f"guest_user_{random.randint(10, 50)}"
        days_ago = random.randint(0, 7)
        hour = random.randint(8, 23) # Peak activity hours track karne ke liye
        
        start_time = datetime.utcnow() - timedelta(days=days_ago)
        start_time = start_time.replace(hour=hour, minute=random.randint(0,59))
        
        responses = []
        # Har session me 3-4 questions serve karwao
        for q in range(random.randint(2, 5)):
            shown = start_time + timedelta(seconds=q*30)
            submitted = shown + timedelta(seconds=random.randint(5, 25)) # Response time 5-25s
            
            responses.append({
                "question_id": f"q_{q}",
                "selected_option": "Option A",
                "is_correct": random.choice([True, False]),
                "shown_at": shown,
                "submitted_at": submitted,
                "duration_seconds": (submitted - shown).total_seconds()
            })
            
        session = {
            "session_id": f"sess_{i}",
            "user_id": user_id,
            "chapter_id": "ch_calculus",
            "status": random.choice(statuses),
            "started_at": start_time,
            "responses": responses
        }
        await db.quiz_sessions.insert_one(session)
        
    print("Database Seeded Successfully! 🚀")

if __name__ == "__main__":
    asyncio.run(seed())