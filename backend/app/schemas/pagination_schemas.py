from typing import Generic, TypeVar, List
from pydantic import BaseModel

# Create a Generic Type Variable
T = TypeVar('T')

class PaginationMeta(BaseModel):
    """Strict schema for the pagination controls data."""
    total_items: int
    current_page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[T]):
    """
    A single reusable master utility wrapper for any paginated response.
    All internal schemas share this core structural pipeline.
    """
    data: List[T]  # This dynamically adapts to Exams, Chapters, or Questions
    pagination: PaginationMeta