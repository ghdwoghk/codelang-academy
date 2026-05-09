from pydantic import BaseModel
from typing import Optional


class CodeSubmit(BaseModel):
    lesson_id: str
    code: str
    language: str


class ExecuteRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""


class ExecuteResponse(BaseModel):
    output: str
    error: str
    exit_code: int
    execution_time_ms: float
    memory_used_kb: float


class SubmissionResponse(BaseModel):
    id: str
    lesson_id: str
    code: str
    language: str
    status: str
    passed: Optional[bool] = None
    execution_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
