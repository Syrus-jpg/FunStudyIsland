from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Island, Course, ContentPage
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class IslandOut(BaseModel):
    id: int
    name: str
    code: str
    description: str
    subtitle: Optional[str] = None
    icon: Optional[str] = None
    cover_image: Optional[str] = None
    class Config:
        from_attributes = True

class ContentPageOut(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    icon: Optional[str] = None
    video_url: Optional[str] = None
    metadata_json: Optional[str] = None
    order: int
    course_id: int
    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: int
    title: str
    cover_image: Optional[str] = None
    contents: List[ContentPageOut] = []
    class Config:
        from_attributes = True

@router.get("/islands", response_model=List[IslandOut])
def get_islands(db: Session = Depends(get_db)):
    return db.query(Island).all()

@router.get("/islands/{code}")
def get_island_detail(code: str, db: Session = Depends(get_db)):
    island = db.query(Island).filter(Island.code == code).first()
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    return island

@router.get("/islands/{code}/courses", response_model=List[CourseOut])
def get_island_courses(code: str, db: Session = Depends(get_db)):
    from app.models.models import Island, Course
    island = db.query(Island).filter(Island.code == code).first()
    if not island:
        raise HTTPException(status_code=404, detail="Island not found")
    return db.query(Course).filter(Course.island_id == island.id).all()

@router.get("/courses/{course_id}/pages", response_model=List[ContentPageOut])
def get_course_pages(course_id: int, db: Session = Depends(get_db)):
    return db.query(ContentPage).filter(ContentPage.course_id == course_id).order_by(ContentPage.order).all()

@router.get("/pages/{page_id}", response_model=ContentPageOut)
def get_page_content(page_id: int, db: Session = Depends(get_db)):
    page = db.query(ContentPage).filter(ContentPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

class PageUpdate(BaseModel):
    title: str
    content: Optional[str] = None
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    icon: Optional[str] = None
    video_url: Optional[str] = None
    metadata_json: Optional[str] = None

class FavoriteIn(BaseModel):
    user_id: int
    item_id: int
    item_type: str # 'article', 'snippet'
    content: Optional[str] = None

class CourseIn(BaseModel):
    title: str
    island_id: int
    cover_image: Optional[str] = None

class IslandUpdate(BaseModel):
    name: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    cover_image: Optional[str] = None

@router.post("/courses")
def create_course(course: CourseIn, db: Session = Depends(get_db)):
    from app.models.models import Course
    new_course = Course(
        title=course.title,
        island_id=course.island_id,
        cover_image=course.cover_image
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    from app.models.models import Course
    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        db.delete(course)
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Course not found")

@router.put("/islands/{code}")
def update_island(code: str, update: IslandUpdate, db: Session = Depends(get_db)):
    from app.models.models import Island
    db_island = db.query(Island).filter(Island.code == code).first()
    if not db_island:
        raise HTTPException(status_code=404, detail="Island not found")
    
    for key, value in update.dict(exclude_unset=True).items():
        setattr(db_island, key, value)
    
    db.commit()
    db.refresh(db_island)
    return db_island

@router.get("/favorites/{user_id}")
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    from app.models.models import Favorite
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()

@router.post("/favorites")
def add_favorite(fav: FavoriteIn, db: Session = Depends(get_db)):
    from app.models.models import Favorite
    new_fav = Favorite(
        user_id=fav.user_id,
        item_id=fav.item_id,
        item_type=fav.item_type,
        content=fav.content
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@router.delete("/favorites/{fav_id}")
def remove_favorite(fav_id: int, db: Session = Depends(get_db)):
    from app.models.models import Favorite
    fav = db.query(Favorite).filter(Favorite.id == fav_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Favorite not found")

@router.put("/pages/{page_id}")
def update_page(page_id: int, update: PageUpdate, db: Session = Depends(get_db)):
    db_page = db.query(ContentPage).filter(ContentPage.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    db_page.title = update.title
    db_page.content = update.content
    db_page.description = update.description
    db_page.thumbnail_image = update.thumbnail_image
    db_page.icon = update.icon
    db_page.video_url = update.video_url
    db_page.metadata_json = update.metadata_json
    db.commit()
    db.refresh(db_page)
    return db_page

@router.post("/courses/{course_id}/pages")
def create_page(course_id: int, page: PageUpdate, db: Session = Depends(get_db)):
    max_order = db.query(ContentPage).filter(ContentPage.course_id == course_id).count()
    new_page = ContentPage(
        title=page.title,
        content=page.content,
        description=page.description,
        thumbnail_image=page.thumbnail_image,
        icon=page.icon,
        video_url=page.video_url,
        metadata_json=page.metadata_json,
        course_id=course_id,
        order=max_order + 1
    )
    db.add(new_page)
    db.commit()
    db.refresh(new_page)
    return new_page

@router.delete("/pages/{page_id}")
def delete_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(ContentPage).filter(ContentPage.id == page_id).first()
    if page:
        db.delete(page)
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Page not found")
