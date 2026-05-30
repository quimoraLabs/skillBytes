from pydantic import BaseModel, Field
from typing import List, Optional

# =====================================================================
# 1. STANDALONE EXAM CORE SCHEMAS
# =====================================================================
class ExamCreate(BaseModel):
    name: str = Field(..., example="JEE Mains 2026")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam")

class ExamResponse(ExamCreate):
    exam_id: str = Field(..., example="exam_a1b2c3")

