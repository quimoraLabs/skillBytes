from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# 1. SUBJECT SCHEMAS (Moved up so Exam schemas can reference it)
# ==========================================
class SubjectCreate(BaseModel):
    exam_id: str = Field(..., example="exam_a1b2c3")
    name: str = Field(..., example="Physics")

class SubjectResponse(SubjectCreate):
    subject_id: str

# ==========================================
# 2. EXAM SCHEMAS
# ==========================================
class ExamCreate(BaseModel):
    name: str = Field(..., example="JEE Mains 2026")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam")

class ExamResponse(ExamCreate):
    exam_id: str

# Modified for nested usage to avoid repetition
class SubjectNestedResponse(BaseModel):
    subject_id: str
    name: str

class ExamWithSubjectsResponse(BaseModel):
    exam_id: str
    exam_name: str
    description: Optional[str] = None
    subjects: List[SubjectNestedResponse] # Validates the clean list perfectly

# ==========================================
# 3. CHAPTER SCHEMAS
# ==========================================
class BulkChapterCreate(BaseModel):
    subject_id: str = Field(..., example="subject_e7d3c4")
    titles: List[str] = Field(..., example=["Kinematics", "Thermodynamics", "Optics"])
    
class ChapterCreate(BaseModel):
    subject_id: str = Field(..., example="sub_x1y2z3")
    title: str = Field(..., example="Kinematics")

class ChapterResponse(ChapterCreate):
    chapter_id: str

# ==========================================
# 4. QUIZ / QUESTION SCHEMAS
# ==========================================
class QuestionSchema(BaseModel):
    # Bug Fixed: Made optional during creation since backend will auto-generate it
    question_id: Optional[str] = Field(None, example="q_1")
    text: str = Field(..., example="What is the SI unit of force?")
    options: List[str] = Field(..., min_items=4, max_items=4, example=["Newton", "Joule", "Watt", "Pascal"])
    correct_answer: str = Field(..., example="Newton")
    score: int = Field(..., example=1)

class QuizCreate(BaseModel):
    chapter_id: str = Field(..., example="ch_kine12")
    title: str 
    description: str
    questions: List[QuestionSchema]
    score: int # Total score for the entire quiz

class QuizResponse(QuizCreate):
    quiz_id: str

# ==========================================
# 5. QUIZ SESSION & ANALYTICS SCHEMAS
# ==========================================
# Sent by frontend whenever a user answers a question and clicks "Next"
class QuestionResponseInput(BaseModel):
    question_id: str
    selected_option: str
    # Security Fix: Removed 'is_correct' from input to prevent client-side answer tampering.
    shown_at: datetime = Field(..., description="Timestamp when the question appeared on screen")
    submitted_at: datetime = Field(..., description="Timestamp when the user submitted the answer")

# Used internally by the backend to structure data for MongoDB storage
class QuestionResponseDB(QuestionResponseInput):
    is_correct: bool # Evaluated by backend by comparing selected_option with correct_answer

class QuizSessionStart(BaseModel):
    user_id: str = Field(..., example="guest_998877")
    chapter_id: str = Field(..., example="ch_kine12")

class QuizSessionResponse(BaseModel):
    session_id: str
    user_id: str
    chapter_id: str
    status: str = Field("ongoing", description="Status can be: ongoing, completed, or abandoned")
    started_at: datetime
    # Fix: Replaced generic List[dict] with strict schema validation
    responses: List[QuestionResponseDB] = []