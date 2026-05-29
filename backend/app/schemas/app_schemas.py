from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# 1. EXAM SCHEMAS
# ==========================================
class ExamWithSubjectsResponse(BaseModel):
    exam_id: str
    exam_name: str
    description: Optional[str] = None
    # this will be populated with subjects when fetching exam details
    subjects: List[SubjectResponse]


class ExamCreate(BaseModel):
    name: str = Field(..., example="JEE Mains 2026")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam")

class ExamResponse(ExamCreate):
    exam_id: str

# ==========================================
# 2. SUBJECT SCHEMAS
# ==========================================
class SubjectCreate(BaseModel):
    exam_id: str = Field(..., example="exam_a1b2c3")
    name: str = Field(..., example="Physics")

class SubjectResponse(SubjectCreate):
    subject_id: str

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
    question_id: str = Field(..., example="q_1")
    text: str = Field(..., example="What is the SI unit of force?")
    options: List[str] = Field(..., min_items=4, max_items=4, example=["Newton", "Joule", "Watt", "Pascal"])
    correct_answer: str = Field(..., example="Newton")

class QuizCreate(BaseModel):
    chapter_id: str = Field(..., example="ch_kine12")
    questions: List[QuestionSchema]

class QuizResponse(QuizCreate):
    quiz_id: str

# ==========================================
# 5. QUIZ SESSION & ANALYTICS SCHEMAS (Sabse Imp)
# ==========================================
# Jab user "Next" click karega, toh frontend ye data bhejega
class QuestionResponseInput(BaseModel):
    question_id: str
    selected_option: str
    is_correct: bool
    shown_at: datetime = Field(..., description="Jab screen par question aaya")
    submitted_at: datetime = Field(..., description="Jab user ne Next click kiya")

class QuizSessionStart(BaseModel):
    user_id: str = Field(..., example="guest_998877")
    chapter_id: str = Field(..., example="ch_kine12")

class QuizSessionResponse(BaseModel):
    session_id: str
    user_id: str
    chapter_id: str
    status: str = Field("ongoing", description="ongoing, completed, or abandoned")
    started_at: datetime
    responses: List[dict] = []