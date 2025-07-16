# Frontend Site

This repository contains a small React frontend and a FastAPI backend. The frontend can be deployed to **GitHub Pages** under the user `terenkur`.

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm start
```

The backend can be run from the `backend/` directory using:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

## Deploying to GitHub Pages

Run the following command from the project root:

```bash
npm run deploy
```

This builds the application and publishes the `build/` directory to the `gh-pages` branch. After enabling GitHub Pages in the repository settings, your site will be available at:

<https://terenkur.github.io/frontend-site/>
