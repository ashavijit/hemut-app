from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Question, User
from schemas import QuestionCreate, QuestionResponse, QuestionAnswer, QuestionStatusUpdate
from auth import get_current_user, get_admin_user
from routers.websocket import manager

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("", response_model=List[QuestionResponse])
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).order_by(Question.created_at.desc()).all()
    escalated = [q for q in questions if q.status == "escalated"]
    others = [q for q in questions if q.status != "escalated"]
    return escalated + others

@router.post("", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not question_data.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty"
        )
    question = Question(
        message=question_data.message,
        user_id=current_user.id if current_user else None
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    await manager.broadcast({
        "type": "new_question",
        "data": {
            "id": question.id,
            "message": question.message,
            "status": question.status,
            "created_at": question.created_at.isoformat()
        }
    })
    return question

@router.post("/{question_id}/answer", response_model=QuestionResponse)
async def answer_question(
    question_id: int,
    answer_data: QuestionAnswer,
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.answer = answer_data.answer
    db.commit()
    db.refresh(question)
    await manager.broadcast({
        "type": "question_answered",
        "data": {"id": question.id, "answer": question.answer}
    })
    return question

@router.patch("/{question_id}/status", response_model=QuestionResponse)
async def update_status(
    question_id: int,
    status_data: QuestionStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    if status_data.status not in ["pending", "escalated", "answered"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.status = status_data.status
    db.commit()
    db.refresh(question)
    await manager.broadcast({
        "type": "status_updated",
        "data": {"id": question.id, "status": question.status}
    })
    return question

@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"message": "Question deleted"}
