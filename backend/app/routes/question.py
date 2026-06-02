from fastapi import APIRouter, status
from app.schemas.question_schemas import (
    SingleQuestionCreatePayload,
    BulkQuestionCreatePayload,
    PaginatedQuizWithQuestionsResponse,
    QuestionNestedInsideQuizResponse
)
from app.controller.question_controller import (
    create_single_question_logic,
    create_bulk_questions_logic,
    get_all_questions_by_quizzes_logic,
    get_current_question_details_logic
)

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_single_question(payload: SingleQuestionCreatePayload):
    return await create_single_question_logic(payload)

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_questions(payload: BulkQuestionCreatePayload):
    return await create_bulk_questions_logic(payload)

@router.get("/quizzes", response_model=PaginatedQuizWithQuestionsResponse, status_code=status.HTTP_200_OK)
async def get_all_questions_by_quizzes(page: int = 1, limit: int = 10):
    return await get_all_questions_by_quizzes_logic(page, limit)

# Return a single question detail by question_id
@router.get("/{question_id}", response_model=QuestionNestedInsideQuizResponse, status_code=status.HTTP_200_OK)
async def get_current_question_details(question_id: str):
    return await get_current_question_details_logic(question_id)

