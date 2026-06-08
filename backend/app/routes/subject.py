from fastapi import APIRouter, status, Query
# from typing import List
from app.controller.subject_controller import (
    create_subject_logic, 
    create_bulk_subjects_logic, 
    get_paginated_subjects_logic,
    get_current_subject_with_chapters_logic
)
from app.schemas.subject_schemas import (
    SubjectCreate, 
    SubjectListResponse,
    SubjectResponse, 
    BulkSubjectCreate 
)
from app.schemas.chapter_schemas import SubjectWithChaptersResponse 
from app.schemas.pagination_schemas import PaginatedResponse


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


# FIXED: Removed {exam_id} path parameter and added pagination query strings
@router.get("/", response_model=PaginatedResponse[SubjectListResponse], response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_all_subjects_by_exam(
    page: int = Query(default=1, ge=1, description="The active page index split boundary"),
    limit: int = Query(default=10, ge=1, le=100, description="The continuous layout items row limit count")
):
    """
    Fetch all high-level exams with their associated subjects driven by loop-based pagination utility execution.
    """
    # Passing query bounds down to the controller logic layer safely
    return await get_paginated_subjects_logic(page=page, limit=limit)


@router.get("/{subject_id}", response_model=SubjectWithChaptersResponse, response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_current_subject(subject_id: str):
    """
    Retrieve the granular configuration details of a single subject including all its dynamic nested chapter sub-items.
    """
    return await get_current_subject_with_chapters_logic(subject_id)