# from fastapi import APIRouter, status
# from app.controller.chapter_controller import create_chapters_bulk_logic, get_all_chapters_logic
# from app.schemas.app_schemas import BulkChapterCreate

# router = APIRouter(prefix="/chapters", tags=["Chapters"])

# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_chapters_bulk(payload: BulkChapterCreate):
#     return await create_chapters_bulk_logic(payload)

# @router.get("/{subject_id}", status_code=status.HTTP_200_OK)
# async def get_all_chapters(subject_id: str):
#     return await get_all_chapters_logic(subject_id)