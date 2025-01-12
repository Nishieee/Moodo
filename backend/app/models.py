from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now())
    mood = Column(String(10))
    prompt = Column(String(255))
    entry = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class MoodRating(Base):
    __tablename__ = "mood_ratings"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now())
    mood = Column(String(10))
    created_at = Column(DateTime, default=func.now())

from sqlalchemy.sql.expression import text

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)
