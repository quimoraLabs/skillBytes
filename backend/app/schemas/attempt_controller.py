from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Student's response to a single question within an attempt
class QuestionResponsePayload(BaseModel):
    question_id: str
    selected_option: Optional[str] = None  
    is_skipped: bool = False 

# student's attempt on a quiz
class StartAttemptPayload(BaseModel):
    quiz_id: str
    student_id: str

# Student's submission of an attempt, with responses to questions
class SubmitAttemptPayload(BaseModel):
    attempt_id: str 
    responses: List[QuestionResponsePayload]

# Response model for returning attempt details
class TestAttemptDocument(BaseModel):
    attempt_id: str
    quiz_id: str
    student_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    total_duration_minutes: int = 30  
    
    # Evaluation Results
    responses: List[QuestionResponsePayload] = []
    total_marks_possible: int = 0
    total_marks_obtained: int = 0
    status: str = "In-Progress"  # In-Progress, Completed, Timeout