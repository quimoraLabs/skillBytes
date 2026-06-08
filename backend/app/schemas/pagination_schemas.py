from typing import Generic, TypeVar, List
from pydantic import BaseModel,Field

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
    All internal child schemas share this core structural pipeline.
    """
    # Master generic array envelope that adapts to subjects, chapters, or quizzes
    data: List[T]
    pagination: PaginationMeta = Field(..., description="Calculated slice navigation control block keys")