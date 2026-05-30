from pydantic import BaseModel, Field
from typing import List

# ==========================================
# 1. STANDALONE SUBJECT CREATION SCHEMA
# ==========================================
class SubjectCreate(BaseModel):
    exam_id: str = Field(..., example="exam_ee51fa", description="The dynamic link reference tracking the master exam target identity")
    name: str = Field(..., example="Physics", description="The master title structural tracking name of the subject domain")


# ==========================================
# 2. STANDALONE SUBJECT RESPONSE SCHEMA
# ==========================================
class SubjectResponse(SubjectCreate):
    subject_id: str = Field(..., example="sub_a1b2c3", description="Unique identifier tracking generated key maps for output processes")


# ==========================================
# 3. BATCH INGESTION / BULK INSERT SCHEMA
# ==========================================
class BulkSubjectCreate(BaseModel):
    exam_id: str = Field(..., example="exam_ee51fa", description="The master mapping identity link key token tracking execution bounds")
    names: List[str] = Field(..., example=["Physics", "Chemistry", "Mathematics"], description="Array batch payload strings processing data line insertions safely")