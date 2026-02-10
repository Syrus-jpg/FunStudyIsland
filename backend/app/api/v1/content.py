from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Island, Course, ContentPage
from typing import List
from pydantic import BaseModel

router = APIRouter()

class IslandOut(BaseModel):
    id: int
    name: str
    code: str
    description: str
    icon: str
    class Config:
        orm_mode = True

@router.get("/islands", response_model=List[IslandOut])
def get_islands(db: Session = Depends(get_db)):
    return db.query(Island).all()

@router.get("/islands/{code}/courses")
def get_island_courses(code: str, db: Session = Depends(get_db)):
    island = db.query(Island).filter(Island.code == code).first()
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    return island.courses

@router.get("/courses/{course_id}/pages")
def get_course_pages(course_id: int, db: Session = Depends(get_db)):
    return db.query(ContentPage).filter(ContentPage.course_id == course_id).order_by(ContentPage.order).all()

@router.get("/pages/{page_id}")
def get_page_content(page_id: int, db: Session = Depends(get_db)):
    page = db.query(ContentPage).filter(ContentPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

class PageUpdate(BaseModel):
    title: str
    content: str

@router.put("/pages/{page_id}")
def update_page(page_id: int, update: PageUpdate, db: Session = Depends(get_db)):
    db_page = db.query(ContentPage).filter(ContentPage.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    db_page.title = update.title
    db_page.content = update.content
    db.commit()
    db.refresh(db_page)
    return db_page

@router.post("/courses/{course_id}/pages")
def create_page(course_id: int, page: PageUpdate, db: Session = Depends(get_db)):
    # 简单的逻辑：获取当前最大 order
    max_order = db.query(ContentPage).filter(ContentPage.course_id == course_id).count()
    new_page = ContentPage(
        title=page.title,
        content=page.content,
        course_id=course_id,
        order=max_order + 1
    )
    db.add(new_page)
    db.commit()
    db.refresh(new_page)
    return new_page
