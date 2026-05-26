from fastapi import APIRouter, status
from app.controller.subject_controller import create_subject_logic, get_all_subjects_logic
from app.schemas.app_schemas import SubjectCreate

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectCreate):
    return await create_subject_logic(payload)

@router.get("/")
async def get_all_subjects(exam_id: str):
    return await get_all_subjects_logic(exam_id)