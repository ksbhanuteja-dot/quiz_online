from pydantic import BaseModel
from typing import List, Any

class InstructorStats(BaseModel):
    totalQuizzes: int
    totalAttempts: int
    averageScore: float
    activeStudents: int

class StudentStats(BaseModel):
    totalAttempted: int
    averageScore: float
    highestScore: int
    recentScores: List[Any]

class LeaderboardEntry(BaseModel):
    id: int
    name: str
    score: int
    attempts: int
    rank: int
    isCurrentUser: bool = False
