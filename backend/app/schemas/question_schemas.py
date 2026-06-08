from pydantic import BaseModel, Field
from typing import List, Any

# =====================================================================
# 1. OPTION SUB-STRUCTURE
# =====================================================================
class OptionStructure(BaseModel):
    text: str = Field(..., example="Transport")
    isCorrect: bool = Field(...,exclude=True, example=True)

# =====================================================================
# 2. SCHEMAS FOR CREATION / INGESTION (INPUT LAYER)
# =====================================================================
class QuestionCreate(BaseModel):
    question_text: str = Field(..., example="Which layer handles end-to-end connection delivery?")
    options: List[OptionStructure] = Field(..., description="List of options with text and isCorrect flag")
    marks: int = Field(default=1, example=2)

class SingleQuestionCreatePayload(BaseModel):
    """Payload format for POST /questions/create"""
    quiz_id: str = Field(..., example="qz_lay_2026_z9y8x7")
    question: QuestionCreate

class BulkQuestionCreatePayload(BaseModel):
    """Payload format for POST /questions/bulk-create"""
    quiz_id: str = Field(..., example="qz_lay_2026_z9y8x7")
    questions: List[QuestionCreate]

# =====================================================================
# 3. SCHEMA FOR RESPONSE (STUDENT TRAP OUTPUT VIEW)
# =====================================================================
class QuestionNestedInsideQuizResponse(BaseModel):
    """Secure response view that converts structured options back to string array for student UI"""
    question_id: str
    question_text: str
    options: List[str] # Frontend receives flat list of strings to avoid leakage
    correct_answer: str = Field(..., description="50% Lucky / Fake answer string honeypot") 
    marks: int

class QuizWithQuestionsResponse(BaseModel):
    quiz_id: str
    quiz_name: str
    questions: List[QuestionNestedInsideQuizResponse] = Field(default=[])

class PaginatedQuizWithQuestionsResponse(BaseModel):
    total_quizzes: int
    total_pages: int
    current_page: int
    quizzes: List[QuizWithQuestionsResponse] = Field(default=[])