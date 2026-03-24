import sys
import os
import json

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.core.database import SessionLocal
from app.models.models import Island, Course, ContentPage

def seed_ai_content():
    db = SessionLocal()
    
    # 1. 找到“言岛” (Speech Island)
    speech_island = db.query(Island).filter(Island.code == "speech").first()
    if not speech_island:
        print("Speech Island not found")
        return

    # 2. 找到或者创建一个 Course (比如 "AI Demo")
    course = db.query(Course).filter(Course.title == "AI 精讲视频", Course.island_id == speech_island.id).first()
    if not course:
        course = Course(title="AI 精讲视频", island_id=speech_island.id)
        db.add(course)
        db.commit()
        db.refresh(course)

    # 3. 创建第一个 AI 增强的文章
    # 我们用 Ivanka 的那个例子作为参考
    title = "伊万卡谈职场女性同工同酬"
    video_url = "https://www.youtube.com/watch?v=JmdfOnP8g20" # 这是一个示例 YouTube URL
    
    metadata = {
        "difficulty": "中级",
        "duration": "1:54",
        "vocab": [
            {
                "word": "motherhood",
                "phonetic": "/ˈmʌðəhʊd/",
                "meaning": "n. 母亲身份",
                "example": "Motherhood is a life-changing experience.",
                "example_cn": "为人母是人生中一次重大的转变。"
            },
            {
                "word": "factor",
                "phonetic": "/ˈfæktə/",
                "meaning": "n. 因素；要素",
                "example": "Gender is no longer the factor creating the greatest wage discrepancy in this country.",
                "example_cn": "性别不再是造成这个国家最大工资差距的因素。"
            }
        ],
        "segments": [
            {
                "time": "0:50",
                "text": "it is motherhood",
                "translation": "而是母亲身份",
                "highlight": "motherhood"
            },
            {
                "time": "1:01",
                "text": "and he will focusing on making quality childcare affordable for all",
                "translation": "他将致力于让所有人都能获得负担得起的高质量育儿服务",
                "highlight": "childcare"
            }
        ]
    }

    content = """
    <p>伊万卡给老爸川普拉票的演讲，主要聊职场女性薪酬不平等和育儿政策。学完能 get：如何用英语讨论社会议题 + 演讲中的高级对比技巧，说不定还能学几招“政客话术”。</p>
    """

    new_page = ContentPage(
        title=title,
        content=content,
        description="伊万卡演讲：职场女性与公平竞争",
        thumbnail_image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000",
        icon="🎤",
        video_url=video_url,
        metadata_json=json.dumps(metadata),
        course_id=course.id,
        order=1
    )

    db.add(new_page)
    db.commit()
    print(f"Successfully added AI-Enhanced article: {title}")
    db.close()

if __name__ == "__main__":
    seed_ai_content()
