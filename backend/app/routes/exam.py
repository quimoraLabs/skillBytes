from fastapi import APIRouter, status
from typing import List
from app.controller.exam_controller import create_exam_logic, get_all_exams_logic,get_current_exam_logic
from app.schemas.exam_schemas import ExamCreate , ExamResponse,ExamWithSubjectsResponse

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(payload: ExamCreate):
    """
    Create a new exam profile. Returns configuration status along with generated IDs.
    """
    return await create_exam_logic(payload)

@router.get("/all",response_model=List[ExamResponse], status_code=status.HTTP_200_OK)
async def get_all_exams():
    """
    Retrieve all registered exams. This returns high-level objects without nested children for optimal scale performance.
    """
    return await get_all_exams_logic()

@router.get("/{exam_id}",response_model=ExamWithSubjectsResponse,status_code=status.HTTP_200_OK)
async def get_current_exam(exam_id: str):
    """
    Retrieve the details of a specific exam by its unique ID.
    """
    return await get_current_exam_logic(exam_id)