from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()


# ============================================
# DATABASE ENGINE
# ============================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)


# ============================================
# DATABASE SESSION
# ============================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================
# BASE MODEL
# ============================================

Base = declarative_base()


# ============================================
# DATABASE DEPENDENCY
# ============================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()