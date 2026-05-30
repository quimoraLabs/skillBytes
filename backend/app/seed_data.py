import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def seed_database():
    # Connect to local MongoDB instance
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["skillbytes_db"] # Apne DB ka naam yahan likho

    print("Cleaning old data...")
    await db.exams.delete_many({})
    await db.subjects.delete_many({})
    await db.chapters.delete_many({})
    await db.quizzes.delete_many({})

    print("Seeding Exams...")
    exam_doc = {
        "exam_id": "exam_jee",
        "name": "JEE Mains",
        "description": "Joint Entrance Examination"
    }
    await db.exams.insert_one(exam_doc)

    print("Seeding Subjects...")
    subject_doc = {
        "exam_id": "exam_jee",
        "subject_id": "sub_phy",
        "name": "Physics"
    }
    await db.subjects.insert_one(subject_doc)

    print("Seeding Chapters...")
    chapter_doc = {
        "subject_id": "sub_phy",
        "chapter_id": "ch_kine12",
        "title": "Kinematics"
    }
    await db.chapters.insert_one(chapter_doc)

    print("Seeding Quiz with Questions...")
    quiz_doc = {
        "quiz_id": "quiz_kine_01",
        "chapter_id": "ch_kine12",
        "title": "Kinematics Basic Test",
        "description": "Test your fundamentals of motion",
        "score": 2, # Total quiz score
        "questions": [
            {
                "question_id": "q_1",
                "text": "What is the SI unit of acceleration?",
                "options": ["m/s", "m/s^2", "km/h", "m*s"],
                "correct_answer": "m/s^2",
                "score": 1
            },
            {
                "question_id": "q_2",
                "text": "Displacement is a ________ quantity.",
                "options": ["Scalar", "Vector", "Tensor", "Dimensionless"],
                "correct_answer": "Vector",
                "score": 1
            }
        ]
    }
    await db.quizzes.insert_one(quiz_doc)

    print("🎉 Database Seeded Successfully with hierarchical data!")

if __name__ == "__main__":
    asyncio.run(seed_database())