from fastapi import FastAPI

app = FastAPI(title="MaidX API", description="Backend API for MaidX Platform", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to MaidX API"}
