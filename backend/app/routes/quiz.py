# from fastapi import APIRouter, status, HTTPException
# from app.schemas.app_schemas import QuizCreate, QuizResponse
# from app.controller.quiz_controller import create_quiz_logic,get_all_quizzes_logic

# router = APIRouter()

# @router.post(
#     "/quizzes", 
#     response_model=QuizResponse, 
#     status_code=status.HTTP_201_CREATED,
#     tags=["Quizzes"]
# )
# async def create_quiz(payload: QuizCreate):
#     try:
#         # Convert Pydantic model to clean dictionary and pass to controller
#         quiz_data = await create_quiz_logic(payload.dict())
#         return quiz_data
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"An error occurred while creating the quiz: {str(e)}"
#         )

# @router.get("/{chapter_id}")
# async def get_all_quizzes(chapter_id: str):
#     return await get_all_quizzes_logic(chapter_id)
