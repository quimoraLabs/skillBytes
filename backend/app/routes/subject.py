from fastapi import APIRouter, status
from typing import List
from app.controller.subject_controller import (
    create_subject_logic, 
    create_bulk_subjects_logic, 
    get_all_subjects_by_exam_logic,
    get_current_subject_with_chapters_logic
)
from app.schemas.subject_schemas import SubjectCreate, SubjectResponse, BulkSubjectCreate ,ExamWithSubjectsResponse
from app.schemas.chapter_schemas import SubjectWithChaptersResponse  # Validates the detail view structure

router = APIRouter(prefix="/subjects", tags=["Subjects"])

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectCreate):
    """
    Create a single standalone subject config instance tracked against a specific parent exam profile trace.
    """
    return await create_subject_logic(payload)


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_subjects(payload: BulkSubjectCreate):
    """
    Batch process and ingest sequential array items mapping unique tracking data models concurrently.
    """
    return await create_bulk_subjects_logic(payload)


@router.get("/exam/{exam_id}", response_model=ExamWithSubjectsResponse,response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_all_subjects_by_exam(exam_id: str):
    """
    Fetch clean high-level subject list items filtered specifically by parent identity parameters.
    Returns live synchronized top-level descriptive elements to secure client UI state pipelines.
    """
    return await get_all_subjects_by_exam_logic(exam_id)


@router.get("/{subject_id}", response_model=SubjectWithChaptersResponse,response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_current_subject(subject_id: str):
    """
    Retrieve the granular configuration details of a single subject including all its dynamic nested chapter sub-items.
    """
    return await get_current_subject_with_chapters_logic(subject_id)