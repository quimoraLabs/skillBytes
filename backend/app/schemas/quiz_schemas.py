from pydantic import BaseModel, Field
# from typing import List

# =====================================================================
# 1. NESTED QUIZ STRUCTURE FOR LOOKUPS
# =====================================================================
class QuizNestedInsideChapterResponse(BaseModel):
    """Clean isolated data template used when listing child quizzes under a specific chapter view"""
    quiz_id: str = Field(..., example="qz_lay_2026_z9y8x7", description="The secure system identity tracking key for the quiz")
    name: str = Field(..., example="Layering Architecture Quiz", description="The custom operational display name of this quiz")
    total_questions: int = Field(default=0, example=10, description="Total active question metrics for UI metadata visualization")


# =====================================================================
# 2. THE TARGET VIEW INTERMEDIARY (Moved here to save domain visibility!)
# =====================================================================
class ChapterWithQuizzesResponse(BaseModel):
    """The master discovery schema returned when fetching details of a single chapter along with its child quizzes"""
    chapter_id: str = Field(..., example="ch_app_2026_k8j9l0", description="The system identity token tracking key identifier")
    chapter_name: str = Field(..., example="Application Layer", description="Live chapter name tracking node mapped dynamically from database")
    # Clean local array binding! ZERO CROSS MODULE COUPLING!
    quizzes: list[QuizNestedInsideChapterResponse] = Field(default=[], description="Flat list configuration tracking active child quiz nodes available")


# =====================================================================
# 3. STANDALONE QUIZ OPERATION SCHEMAS (Placeholders for Quiz Module)
# =====================================================================
class QuizBase(BaseModel):
    chapter_id: str = Field(..., example="ch_app_2026_k8j9l0")
    name: str = Field(..., example="Layering Architecture Quiz")

class QuizCreate(QuizBase):
    pass

class QuizResponse(QuizCreate):
    quiz_id: str = Field(..., example="qz_lay_2026_z9y8x7")

class QuizListResponse(QuizBase):
    id: str = Field(..., example="qz_lay_2026_z9y8x7", description="The system identity tracking key for the quiz")

class BulkQuizCreate(BaseModel):
    """Missing Schema for batch ingesting quizzes"""
    chapter_id: str = Field(..., example="chapter_app_2026_k8j9l0", description="The target parent chapter identifier")
    names: list[str] = Field(..., example=["Quiz 1: Basics", "Quiz 2: Advanced"], description="Array of names for bulk insert")

