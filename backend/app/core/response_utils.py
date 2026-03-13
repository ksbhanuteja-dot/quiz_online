from typing import Any, Optional
from pydantic import BaseModel

class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

def success_response(data: Any = None):
    return APIResponse(success=True, data=data)

def error_response(message: str):
    return APIResponse(success=False, error=message)
