from pydantic import BaseModel, Field
from typing import Optional

# ==========================================
# CHAPTER NESTED REFERENCE SCHEMA
# ==========================================
class ChapterNestedResponse(BaseModel):
    chapter_id: str = Field(..., example="ch_kine12", description="The unique generated database key identifier for the chapter")
    title: str = Field(..., example="Kinematics", description="The unique name configuration value of this specific chapter")


# ==========================================
# SUBJECT WITH CHAPTERS RESPONSE SCHEMA
# ==========================================
class SubjectWithChaptersResponse(BaseModel):
    subject_id: str = Field(..., example="sub_x1y2z3", description="The structural parent identity mapping reference")
    subject_name: str = Field(..., example="Physics", description="The identity name string value mapped from the target subject")
    description: Optional[str] = Field(None, example="Mechanics data collection context", description="Optional operational metadata contextual details")
    chapters: list[ChapterNestedResponse] = Field(default=[], description="Dynamic relational child collection mapping lists handled in-memory")