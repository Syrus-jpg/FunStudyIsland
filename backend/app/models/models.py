from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="student") # student, editor, admin
    
    # Pet related
    pet_name = Column(String, default="🥚")
    pet_level = Column(Integer, default=1)
    pet_favorability = Column(Integer, default=0)

class Island(Base):
    __tablename__ = "islands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True) # e.g., 'speech', 'wealth'
    description = Column(Text)
    subtitle = Column(String) # For Notion-style page subtitle
    icon = Column(String)
    cover_image = Column(String) # Notion-style cover image URL
    
    courses = relationship("Course", back_populates="island")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    cover_image = Column(String) # For gallery view section covers
    island_id = Column(Integer, ForeignKey("islands.id"))
    
    island = relationship("Island", back_populates="courses")
    contents = relationship("ContentPage", back_populates="course")

class ContentPage(Base):
    __tablename__ = "content_pages"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text) # Markdown or Rich Text
    description = Column(Text) # Short summary for cards
    thumbnail_image = Column(String) # For gallery view cards
    icon = Column(String) # Notion-style page icon
    
    # AI Learning Data
    video_url = Column(String, nullable=True)
    # metadata_json stores structured vocab/segments: { "vocab": [...], "segments": [...] }
    metadata_json = Column(Text, nullable=True) 
    
    order = Column(Integer)
    course_id = Column(Integer, ForeignKey("courses.id"))
    
    course = relationship("Course", back_populates="contents")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, index=True) # Can be page_id or a unique identifier for a snippet
    item_type = Column(String) # 'article', 'snippet'
    content = Column(Text, nullable=True) # Full text of the snippet or title of article
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
