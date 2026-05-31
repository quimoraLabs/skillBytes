from fastapi import APIRouter, status, Query
from app.schemas.chapter_schemas import (
    ChapterCreate, 
    ChapterResponse, 
    BulkChapterCreate, 
    SubjectWithChaptersResponse,

)

from app.schemas.quiz_schemas import  ChapterWithQuizzesResponse
from app.controller.chapter_controller import (
    create_chapter_logic,
    create_chapters_bulk_logic,
    get_all_chapters_logic,
    get_current_chapter_with_quizzes_logic
)
from pydantic import BaseModel

router = APIRouter(prefix="/chapters", tags=["Chapters"])

# =====================================================================
# WRAPPER SCHEMA FOR PAGINATED SUBJECT OUTPUT
# =====================================================================
class PaginatedSubjectResponse(BaseModel):
    """Wrapper schema to validate the top-level paginated dictionary structure for subjects."""
    subjects: list[SubjectWithChaptersResponse]
    pagination: dict


# =====================================================================
# THE SINGLE CHAPTER PATHWAY (CLEANED AND CONNECTED)
# =====================================================================
@router.post("/", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
async def create_chapter(payload: ChapterCreate):
    """
    Create a single standalone chapter config instance tracked against a parent subject.
    """
    return await create_chapter_logic(payload)


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_chapters(payload: BulkChapterCreate):
    """
    Batch process and ingest sequential chapter name entries mapping custom tokens concurrently.
    """
    return await create_chapters_bulk_logic(payload)


@router.get("/subjects", response_model=PaginatedSubjectResponse, response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_all_chapters_by_subject(
    page: int = Query(default=1, ge=1, description="The active page index split boundary"),
    limit: int = Query(default=10, ge=1, le=100, description="The continuous layout items row limit count")
):
    """
    Fetch all high-level subjects with their associated chapters driven by loop-based pagination utility execution.
    """
    return await get_all_chapters_logic(page=page, limit=limit)


@router.get("/chapter/{chapter_id}", response_model=ChapterWithQuizzesResponse, response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_current_chapter_details(chapter_id: str):
    """
    Retrieve the granular configuration details of a single chapter including all its dynamic nested quiz sub-items.
    """
    return await get_current_chapter_with_quizzes_logic(chapter_id)