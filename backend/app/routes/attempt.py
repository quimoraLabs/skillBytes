from fastapi import APIRouter, status, Depends
from app.schemas.attempt_controller import StartAttemptPayload, SubmitAttemptPayload
from app.controller.attempt_controller import start_test_attempt_logic, submit_test_attempt_logic,get_quiz_leaderboard_logic, get_student_test_report_logic

router = APIRouter(prefix="/attempts", tags=["Test Attempts"])

@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_test_attempt(payload: StartAttemptPayload):
    return await start_test_attempt_logic(payload)

@router.post("/submit", status_code=status.HTTP_200_OK)
async def submit_test_attempt(payload: SubmitAttemptPayload):
    return await submit_test_attempt_logic(payload)

# app/routes/attempt.py

@router.get("/leaderboard/{quiz_id}", status_code=status.HTTP_200_OK)
async def get_quiz_leaderboard(quiz_id: str, limit: int = 10):
    """Get Top performing students for a specific quiz"""
    return await get_quiz_leaderboard_logic(quiz_id, limit)


@router.get("/student-report/{student_id}", status_code=status.HTTP_200_OK)
async def get_student_test_report(student_id: str):
    """Get comprehensive test analytics for a single student"""
    return await get_student_test_report_logic(student_id)