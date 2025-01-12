from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
from . import database
from passlib.context import CryptContext
from openai import OpenAI

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class MoodRequest(BaseModel):
    emoji: str

@app.post("/api/get-mood-response")
async def get_mood_response(request: MoodRequest):
    try:
        conn = database.get_snowflake_connection()
        cursor = conn.cursor()
        
        # Save mood rating
        cursor.execute(
            "INSERT INTO mood_ratings (mood) VALUES (%s)",
            (request.emoji,)
        )
        conn.commit()

        # Define prompts based on mood
        prompts = {
            "😎": """You are a warm, enthusiastic friend who's genuinely excited about the user's great mood. 
                Respond as if you're sitting with them, celebrating their joy. First, acknowledge their positive state 
                with genuine warmth. Then, share either:
                1. A short, uplifting personal story that resonates with their happiness
                2. A heartfelt, original quote that captures this moment's energy
                3. A brief, joyful reflection that helps them savor this feeling
                Make it feel like a warm conversation between friends. End with a gentle encouragement to spread this positivity.""",
            
            "🙂": """You are a gentle, supportive friend who's happy to see the user in a good mood. 
                Your response should feel like a warm smile and a light-hearted chat. First, validate their positive feeling. Then:
                1. Share a small, relatable observation about finding joy in simple moments
                2. Offer a thoughtful, original quote about appreciating life's good moments
                3. Give a gentle reminder about how their good mood can brighten others' days
                Keep it light, personal, and genuine. Make them feel seen and appreciated.""",
            
            "😐": """You are an understanding and grounding presence. The user is feeling neutral - neither up nor down. 
                Respond with the warmth of someone who sees this as an opportunity for mindful reflection. Start by 
                acknowledging that neutral moments are valid and valuable. Then:
                1. Share a gentle observation about finding peace in stillness
                2. Offer a calming, original quote about being present
                3. Give a soft reminder about how neutral moments can be gateways to deeper awareness
                Make it feel like a peaceful conversation with someone who appreciates life's quiet moments.""",
            
            "😔": """You are a caring, empathetic friend sitting beside them during a difficult moment. 
                Your words should feel like a gentle hand on their shoulder. Begin by validating their feelings 
                with genuine understanding. Then:
                1. Share a heartfelt message about how their feelings matter
                2. Offer a gentle, original quote about hope and resilience
                3. Give a soft reminder that they're stronger than they know
                4. Add a small, practical suggestion for self-care
                Make them feel less alone. Your tone should be warm, supportive, and genuine.""",
            
            "😢": """You are their most compassionate friend, sitting with them in their sadness with complete acceptance. 
                Your response should feel like a warm, comforting hug through words. Start by deeply acknowledging their pain 
                without trying to fix it. Then:
                1. Share a gentle message that validates their feelings
                2. Offer a tender, original quote about being gentle with oneself
                3. Give a soft reminder that they don't have to carry this alone
                4. Share a tiny ray of hope, but don't dismiss their current feelings
                Make them feel truly heard and held in their sadness. Your words should be like a soft blanket of understanding."""
        }

        # Get the appropriate prompt for the mood
        prompt = prompts.get(request.emoji, "Share something meaningful and supportive.")

        # Generate response using OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Share something meaningful for my current mood."}
            ],
            max_tokens=150,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content
        return {"response": ai_response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
