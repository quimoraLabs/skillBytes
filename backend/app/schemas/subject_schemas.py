from pydantic import BaseModel, Field
from typing import List, Optional

# base models for subject schemas, including nested references and standalone CRUD operations
class SubjectBase(BaseModel):
    """The master blueprint schema containing the core fields needed everywhere."""
    exam_id: str = Field(..., example="exam_ee51fa", description="The dynamic link reference tracking the master exam target identity")
    name: str = Field(..., example="Physics", description="The master name structural tracking name of the subject domain")

# =====================================================================
# 1. NESTED REFERENCE SCHEMAS (Rightful Ownership Here!)
# =====================================================================
class SubjectNestedResponse(BaseModel):
    """Clean nested model used when listing subjects inside an Exam lookup"""
    subject_id: str = Field(..., example="sub_x1y2z3", description="The identity token tracking key identifier")
    name: str = Field(..., example="Physics", description="The clean name configuration of this unique subject")


class ExamWithSubjectsResponse(BaseModel):
    """The master discovery schema for any request asking for an exam's subjects"""
    exam_id: str = Field(..., example="exam_a1b2c3", description="The master validated parent reference identifier")
    exam_name: str = Field(..., example="JEE Mains 2026", description="Fresh live exam name straight from database to prevent stale state props")
    description: Optional[str] = Field(None, example="Engineering Entrance Exam", description="Optional metadata description context")
    # Using the local nested schema cleanly here!
    subjects: List[SubjectNestedResponse] = Field(default=[], description="Flat fast array list of sanitized subjects without redundant exam_id")


# =====================================================================
# 2. STANDALONE SUBJECT CRUD OPERATION SCHEMAS
# =====================================================================
class SubjectCreate(SubjectBase):
    pass



class SubjectResponse(SubjectCreate):
    subject_id: str = Field(..., example="sub_a1b2c3", description="Unique identifier tracking generated key maps for output processes")

class SubjectListResponse(SubjectBase):
    id: str = Field(..., example="sub_a1b2c3", description="Unique identifier tracking generated key maps for output processes")

class BulkSubjectCreate(BaseModel):
    exam_id: str = Field(..., example="exam_ee51fa", description="The master mapping identity link key token tracking execution bounds")
    names: List[str] = Field(..., example=["Physics", "Chemistry", "Mathematics"], description="Array batch payload strings processing data line insertions safely")