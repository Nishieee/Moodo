# Mood Journal Backend

This is the backend API for the Mood Journal application built with FastAPI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- On Windows:
```bash
.\venv\Scripts\activate
```
- On Unix or MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Endpoints

- `GET /`: Welcome message
- `POST /journal/`: Create a new journal entry
- `GET /journal/`: Get list of journal entries
- `POST /mood/`: Record a new mood rating
- `GET /mood/`: Get list of mood ratings

## API Documentation

Once the server is running, you can access:
- Interactive API documentation at http://localhost:8000/docs
- Alternative API documentation at http://localhost:8000/redoc
