from app.core.database import SessionLocal, engine, Base
from app.models.models import Island, Course, ContentPage

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(Island).first():
        print("Data already exists. Skipping seed.")
        return

    islands_data = [
        {"name": "言岛", "code": "speech", "icon": "💬", "description": "名人学习, 雅思, 场景英语"},
        {"name": "财岛", "code": "wealth", "icon": "💰", "description": "创业, 副业, 赚钱"},
        {"name": "智岛", "code": "iq", "icon": "🎓", "description": "工作求职, AI工具"},
        {"name": "情岛", "code": "eq", "icon": "❤️", "description": "美育艺术, 疗愈"},
        {"name": "玩岛", "code": "play", "icon": "🎮", "description": "趣味互动"},
        {"name": "逆岛", "code": "resilience", "icon": "🌊", "description": "抗风险抗焦虑"},
    ]

    for island_info in islands_data:
        island = Island(**island_info)
        db.add(island)
        db.commit()
        db.refresh(island)
        
        # Add a dummy course and page for each island
        course = Course(title=f"走进{island.name}", island_id=island.id)
        db.add(course)
        db.commit()
        db.refresh(course)
        
        page = ContentPage(
            title="欢迎来到趣学岛",
            content=f"# 欢迎来到{island.name}\n\n这里是为您准备的精选内容。\n\n学习英语，从今天开始！",
            order=1,
            course_id=course.id
        )
        db.add(page)
        db.commit()

    print("Seeding completed!")
    db.close()

if __name__ == "__main__":
    seed_data()
