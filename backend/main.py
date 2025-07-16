from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


def get_wheel_settings():
    """Return wheel settings with a status code."""
    return {"message": "wheel settings", "status": status.HTTP_200_OK}


@app.get("/wheel/settings")
def read_wheel_settings():
    return get_wheel_settings()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
