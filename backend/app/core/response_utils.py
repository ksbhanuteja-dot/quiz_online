from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

def success_response(data: T = None):
    return {"success": True, "data": data, "error": None}

def error_response(message: str):
    return {"success": False, "data": None, "error": message}
