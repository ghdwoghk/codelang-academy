# CodeLang Academy

An interactive coding education platform that teaches C, C++, HTML, CSS, JavaScript, and Python.

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS) → Deployed on Vercel
- **Backend**: Python FastAPI → Deployed on Render
- **Database**: PostgreSQL (Render Managed)
- **Auth**: JWT-based authentication
- **Code Execution**: Docker sandbox (local) / Local subprocess (dev)
- **Editor**: Monaco Editor (VS Code-based)

## Project Structure

```
codelang-academy/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── core/          # Security, dependencies
│   │   ├── services/      # Business logic
│   │   ├── main.py        # FastAPI app with CORS
│   │   ├── config.py      # Environment config
│   │   └── database.py    # DB connection
│   ├── docker-sandbox/    # Docker code execution
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (Next.js App Router)
│   │   ├── components/    # React components
│   │   ├── lib/           # API client, utilities
│   │   └── types/         # TypeScript types
│   ├── vercel.json
│   └── package.json
└── README.md
```

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker for DB)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (see .env.example)
# Make sure PostgreSQL is running

uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Seed Data

Once both servers are running, visit:
- `POST http://localhost:8000/api/seed` to populate sample courses, lessons, quizzes, and badges.

Or use the API docs at http://localhost:8000/docs

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set environment variable:
- `NEXT_PUBLIC_API_URL`: Your Render backend URL

### Backend → Render

1. Push the `backend/` folder to a GitHub repo
2. In Render, create a **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard:
   - `DATABASE_URL`: From Render PostgreSQL (or external)
   - `JWT_SECRET`: Generate a secure random string
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `DOCKER_ENABLED`: `false`
6. Create a **PostgreSQL database** in Render (free tier) and link it

### CORS Configuration

CORS is configured in `backend/app/main.py` using the `CORS_ORIGINS` environment variable. The backend accepts requests from:

- `http://localhost:3000` (development)
- `https://codelang-academy.vercel.app` (production)
- Any additional origins in the comma-separated `CORS_ORIGINS` env var

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Current user info |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{id}` | Course detail |
| GET | `/api/lessons` | List lessons |
| GET | `/api/lessons/{id}` | Lesson detail |
| POST | `/api/submissions` | Submit code |
| POST | `/api/execute` | Run code in sandbox |
| GET | `/api/quizzes/{lesson_id}` | Get quizzes |
| POST | `/api/quizzes/{lesson_id}/submit` | Submit quiz answers |
| GET | `/api/progress/stats` | User statistics |
| GET | `/api/progress/leaderboard` | Leaderboard |
| GET | `/api/comments/{lesson_id}` | Comments for a lesson |
| POST | `/api/comments/{lesson_id}` | Post a comment |

## Key Features

- **Interactive Code Editor** with Monaco Editor
- **Real-time Code Execution** via Docker sandbox or local subprocess
- **Memory Visualization** for C/C++ pointers and arrays
- **Multi-Language Comparison** (run same code in C, C++, Python, JS)
- **Gamification** (XP, levels, streaks, badges, leaderboard)
- **Quiz System** with auto-grading
- **Community Comments** with threaded replies
- **JWT Authentication**
- **Responsive Dark-mode UI**
- **Course Progress Tracking**

## License

MIT
