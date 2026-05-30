from pydantic import BaseModel, Field
from typing import List, Optional

# ==========================================
# EXAM SCHEMAS
# ==========================================

class ExamCreate(BaseModel):
    name: str = Field(..., example="JEE Mains 2026")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam")


class ExamResponse(ExamCreate):
    exam_id: str = Field(..., example="exam_a1b2c3")


# Reference schema for nested structure inside ExamWithSubjectsResponse
class SubjectNestedResponse(BaseModel):
    subject_id: str = Field(..., example="sub_x1y2z3")
    name: str = Field(..., example="Physics")


class ExamWithSubjectsResponse(BaseModel):
    exam_id: str = Field(..., example="exam_a1b2c3")
    exam_name: str = Field(..., example="JEE Mains 2026")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam")
    subjects: List[SubjectNestedResponse] = Field(
        default=[], 
        description="List of subjects associated with this specific exam"
    )