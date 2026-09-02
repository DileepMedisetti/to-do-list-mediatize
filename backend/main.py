from fastapi import FastAPI
from database import Base, engine
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.tasks import router as tasks_router
from routes.comments import router as comments_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="To Do List Crud Project",
              description="to-do list crud project task by mediatize.")


# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://to-do-list-mediatize.vercel.app",
]


app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

@app.get("/",tags=["Home"])
def home():
    return {"message":"welcome to the home page."}

# Creates database tables from SQLAlchemy models
Base.metadata.create_all(bind=engine)


# Add all the routes defined inside auth_router to my main FastAPI application.
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(comments_router)