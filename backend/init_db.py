from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import Island, Course, ContentPage, User
import bcrypt

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Island).filter(Island.code == "speech").first():
        print("Database already seeded.")
        return

    # 1. Create Users
    admin_pass = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    users = [
        User(email="admin@163.com", hashed_password=admin_pass, role="editor"),
        User(email="partner@163.com", hashed_password=admin_pass, role="editor"),
        User(email="666@163.com", hashed_password=admin_pass, role="student")
    ]
    for u in users:
        db.add(u)

    # 2. Create Islands
    islands = [
        Island(
            name="言岛", 
            code="speech", 
            description="Speech Island", 
            subtitle="名人学习 · 雅思 · 场景英语",
            icon="📸", 
            cover_image="https://images.unsplash.com/photo-1493238792040-d710475a6d38?auto=format&fit=crop&q=80&w=2000"
        ),
        Island(
            name="财岛", 
            code="wealth", 
            description="Wealth Island",
            subtitle="财商培养 · 副业探索 · 创业思维",
            icon="💰"
        ),
        Island(
            name="灵岛", 
            code="spirit", 
            description="Spirit Island",
            subtitle="AI 互动 · 宠物陪练 · 情感成长",
            icon="🥚"
        )
    ]
    for i in islands:
        db.add(i)
    db.commit()

    # 3. Create Courses for Speech Island
    speech = db.query(Island).filter(Island.code == "speech").first()
    
    travel_course = Course(title="Travel", island_id=speech.id)
    world_course = Course(title="World is beautiful", island_id=speech.id)
    
    db.add(travel_course)
    db.add(world_course)
    db.commit()

    # 4. Create Pages for Travel (Speech Island)
    travel_pages = [
        ContentPage(
            title="Serbia 塞尔维亚", 
            description="Explore the hidden gems of the Balkans",
            icon="🇷🇸",
            thumbnail_image="https://images.unsplash.com/photo-1555990548-0ca1a94cb73f?auto=format&fit=crop&q=60&w=800",
            content="# Serbia\nWelcome to Serbia!",
            course_id=travel_course.id,
            order=1
        ),
        ContentPage(
            title="Cambodia 柬埔寨", 
            description="Ancient temples and rich history",
            icon="🇰🇭",
            thumbnail_image="https://images.unsplash.com/photo-1500049222909-2484a285514f?auto=format&fit=crop&q=60&w=800",
            content="# Cambodia\nExploring Angkor Wat.",
            course_id=travel_course.id,
            order=2
        ),
        ContentPage(
            title="Guangzhou 广州", 
            description="The heart of Cantonese culture",
            icon="🏙️",
            thumbnail_image="https://images.unsplash.com/photo-1540324155974-7523202daa3f?auto=format&fit=crop&q=60&w=800",
            content="# Guangzhou\nDim sum and skyscrapers.",
            course_id=travel_course.id,
            order=3
        )
    ]
    
    world_pages = [
        ContentPage(
            title="Animals 动物", 
            description="Our furry friends around the globe",
            icon="🐱",
            thumbnail_image="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=60&w=800",
            content="# Animals",
            course_id=world_course.id,
            order=1
        ),
        ContentPage(
            title="Architecture 建筑", 
            description="Designing the future",
            icon="🏛️",
            thumbnail_image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=60&w=800",
            content="# Architecture",
            course_id=world_course.id,
            order=2
        )
    ]

    for p in travel_pages + world_pages:
        db.add(p)
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed()
