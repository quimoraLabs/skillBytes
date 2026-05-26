from fastapi import APIRouter, status
from app.controller.exam_controller import create_exam_logic, get_all_exams_logic
from app.schemas.app_schemas import ExamCreate , ExamResponse

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_exam(payload: ExamCreate) -> ExamResponse:
    return await create_exam_logic(payload)

@router.get("/")
async def get_all_exams() -> list[ExamResponse]:
    return await get_all_exams_logic()