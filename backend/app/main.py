from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.content import router as content_router
from app.services.gemini import gemini_service
from pydantic import BaseModel

app = FastAPI(
    title="趣学岛 (Fun Study Island) API",
    description="Gamified English learning platform backend",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(content_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to 趣学岛 (Fun Study Island) API"}

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@app.post("/api/v1/chat")
async def chat_with_pet(request: ChatRequest):
    response = await gemini_service.chat_with_pet(request.message, request.context)
    return {"response": response}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
