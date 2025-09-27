from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import json

import mysql.connector as connector
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import base64

import mysql.connector as connector

import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

dbconfig = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT", "3306"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

def get_db():
    cnx = connector.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    try:
        yield cnx
    finally:
        cnx.close()



# Initialize FastAPI app
app = FastAPI(
    title="ChronoCare API",
    description="A healthcare management system API",
    version="1.0.0"
)
security = HTTPBearer()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

body_parts = {
    "B001": "Brain",
    "B002": "Heart",
    "B003": "Lungs",
    "B004": "Stomach",
    "B005": "Kidneys",
    "B006": "Left Arm",
    "B007": "Right Arm",
    "B008": "Left Knee",
    "B009": "Right Knee",
    "B010": "Left Ankle",
    "B011": "Right Ankle",
    "B012": "Left Shoulder",
    "B013": "Right Shoulder",
    "B014": "Spine",
    "B015": "Left Eye",
    "B016": "Right Eye"
}

def verify_token(auth_creds: HTTPAuthorizationCredentials = Depends(security)):
    token = auth_creds.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def save_ledger_data_to_db(json_data, uid, db=Depends(get_db)):
    data = json.loads(json_data)
    cursor = db.cursor(dictionary=True)
    for key, value in data.items():
        for i in value:
            cursor.execute(
                "INSERT INTO BodyParts (user_id, body_part_name, date, doc_type, details, document_link) VALUES (%s, %s, %s, %s, %s, %s)",
                (uid, key, i.get('date'), i.get('doc_type'), i.get('details'), i.get('document_link'))
            )
    db.commit()




# Pydantic models for request/response
class HealthCheck(BaseModel):
    status: str
    message: str



# Routes
@app.get("/", response_model=HealthCheck)
async def root():
    """Root endpoint for health check"""
    return HealthCheck(status="healthy", message="ChronoCare API is running")

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(status="healthy", message="Service is operational")


@app.post('/api/upload-ledger')
def upload_ledger(file: UploadFile= File(...)):
    username_from_firebase = "testuser"
    UPLOAD_DIR = f"uploads/{username_from_firebase}"
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    contents = file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    #Updated file path
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    #call process_upload with parameter as file_path

    #DO be done after complete ledger functionality form pradyun side


 


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)