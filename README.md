# Fusion Lab

A web application for Dempster-Shafer and PCR5 evidence fusion.

## Setup

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. Start the backend server
2. Start the frontend dev server
3. Open `http://localhost:5173` in your browser
4. Select a fusion method, add sources with hypotheses, and calculate
