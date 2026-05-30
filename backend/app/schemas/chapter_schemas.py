from pydantic import BaseModel, Field
from typing import List, Optional

# =====================================================================
# 1. STANDALONE CHAPTER CREATION SCHEMA (Payload from Frontend/Admin)
# =====================================================================
class ChapterCreate(BaseModel):
    subject_id: str = Field(..., example="sub_com_2026_fc85c4", description="The parent relational subject reference tracking index identifier")
    title: str = Field(..., example="Introduction to Layers", description="The primary functional text string tracking the name of this chapter")


# =====================================================================
# 2. STANDALONE CHAPTER RESPONSE SCHEMA (Output after single creation)
# =====================================================================
class ChapterResponse(ChapterCreate):
    chapter_id: str = Field(..., example="ch_int_2026_x1y2z3", description="The system-wide custom semantic structural identifier key token")


# =====================================================================
# 3. BATCH INGESTION / BULK INSERT SCHEMA
# =====================================================================
class BulkChapterCreate(BaseModel):
    subject_id: str = Field(..., example="sub_com_2026_fc85c4", description="The common target operational subject parent identifier reference")
    titles: List[str] = Field(..., example=["Application Layer", "Transport Layer", "Network Layer"], description="Array payload strings executing concurrent chapter data line insertions safely")


# =====================================================================
# 4. NESTED REFERENCE SCHEMA (Rightful ownership inside chapters!)
# =====================================================================
class ChapterNestedResponse(BaseModel):
    """Unified nested data model used when listing chapters inside any parent lookup"""
    chapter_id: str = Field(..., example="ch_int_2026_x1y2z3", description="The generated custom unique semantic system identity token")
    title: str = Field(..., example="Introduction to Layers", description="The master structural string name configuration value of this chapter")


# =====================================================================
# 5. SUBJECT WITH CHAPTERS RESPONSE SCHEMA (Kept here for direct visibility)
# =====================================================================
class SubjectWithChaptersResponse(BaseModel):
    """The absolute master query response model used for discovering a subject's chapters"""
    subject_id: str = Field(..., example="sub_com_2026_fc85c4", description="The structural parent identity mapping reference")
    subject_name: str = Field(..., example="Computer Networks", description="The identity name string value mapped from the target subject")
    description: Optional[str] = Field(None, example="Core engineering domain context tracking", description="Optional operational metadata contextual details")
    chapters: List[ChapterNestedResponse] = Field(default=[], description="Consistent nested active data instances handled cleanly")