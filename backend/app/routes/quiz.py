from fastapi import APIRouter, status, Query
from app.schemas.quiz_schemas import (
    QuizCreate,
    QuizResponse,
    BulkQuizCreate,
    PaginatedQuizResponse,
    ChapterWithQuizzesResponse
)
from app.controller.quiz_controller import (
    create_quiz_logic,
    create_quizzes_bulk_logic,
    get_all_quizzes_by_chapters_logic,
    get_current_quiz_details_logic
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(payload: QuizCreate):
    """
    Create a single standalone quiz instance tracked against a parent chapter.
    """
    return await create_quiz_logic(payload)


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_quizzes(payload: BulkQuizCreate):
    """
    Batch process and ingest multiple quiz profiles concurrently under a chapter.
    """
    return await create_quizzes_bulk_logic(payload)


@router.get("/chapters", response_model=PaginatedQuizResponse, response_model_exclude_none=True, status_code=status.HTTP_200_OK)
async def get_all_quizzes_by_chapters(
    page: int = Query(default=1, ge=1, description="The active page index split boundary"),
    limit: int = Query(default=10, ge=1, le=100, description="The row limit count")
):
    """
    Fetch all high-level chapters with their associated quizzes driven by pagination utility execution.
    """
    return await get_all_quizzes_by_chapters_logic(page=page, limit=limit)


@router.get("/{quiz_id}", status_code=status.HTTP_200_OK)
async def get_current_quiz_details(quiz_id: str):
    """
    Retrieve the granular details of a single quiz including all its nested questions.
    """
    return await get_current_quiz_details_logic(quiz_id)