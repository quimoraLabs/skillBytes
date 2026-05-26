from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.db import client
from app.routes.auth import router as auth_router
from app.routes.exam import router as exam_router
from app.routes.subject import router as subject_router


# FastAPI ka instance banaya
app = FastAPI(
    title="SkillBytes API",
    description="SkillBytes assignment backend",
    version="1.0.0"
)

# CORS Middleware (Taaki jab frontend se connect karein toh error na aaye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Abhi ke liye sab allowed hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection check
@app.on_event("startup")
async def startup_db_client():
    try:
        # MongoDB connection check
        await client.admin.command('ping')
        print("MongoDB connection successful!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

# Routes
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(subject_router)
# Base Route
@app.get("/")
def read_root():
    return {"status": "Success", "message": "Server is running!"}