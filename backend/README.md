# Backend API

This backend is built with [FastAPI](https://fastapi.tiangolo.com/) and provides a small voting API used by the frontend.

## Setup

Install the dependencies and run the development server:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

CORS is enabled so the frontend can connect from a different host.

## Usage

- `POST /login` – obtain an admin token by providing the password.
- `GET /games` – list games with vote counts.
- `POST /vote` – vote for a game.
- `POST/PATCH/DELETE /games` – manage games (requires admin token).
- `GET/PATCH /wheel-settings` – retrieve or update wheel configuration (admin token required for updates).

## Deploying to Render

The backend can be deployed as a web service on [Render](https://render.com). A
preconfigured instance is available at:

https://frontend-site-xatr.onrender.com

Make sure to set any secrets like the admin password via Render's environment
variables.
