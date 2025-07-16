# Frontend Site

This repository contains a small React frontend and a FastAPI backend.
Both parts can be deployed together on **Vercel** using the provided configuration.

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

If you deploy the FastAPI backend separately, ensure the CORS configuration
includes this GitHub Pages domain. Otherwise the frontend won't be able to
fetch data from the API.

## Backend on Render

The backend can be deployed to [Render](https://render.com) using the
`backend/` directory. When deployed, it is reachable at:

https://frontend-site-xatr.onrender.com

During local development you can override the API endpoint by setting the
`REACT_APP_API_URL` environment variable before running or building the
frontend. The production build defaults to the Render URL shown above.

## Deploying to Vercel

This repository is preconfigured for Vercel. The React frontend will be built
using `npm run build` and served as static files. The FastAPI backend is exposed
through the `api/` directory as a serverless function.

To deploy, simply import the repository in Vercel. No additional build settings
are required. Once deployed, the frontend will make requests to the backend via
the relative `/api` path.
