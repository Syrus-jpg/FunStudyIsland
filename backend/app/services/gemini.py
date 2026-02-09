import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def chat_with_pet(self, message: str, context: str = ""):
        if not self.model:
            return "Gemini API key not configured. Please add it to your .env file."
        
        prompt = f"""
        你现在是'趣学岛'项目的AI宠物助手。
        你的性格：可爱、充满鼓励、博学但用简单的方式交流。
        背景信息：用户正在学习英语。
        学习上下文：{context}
        
        用户的消息：{message}
        
        作为宠物，请用亲切的语气回复用户，并视情况给予学习建议或鼓励。尽量简洁。
        """
        
        response = self.model.generate_content(prompt)
        return response.text

gemini_service = GeminiService()
