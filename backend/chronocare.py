from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, JSONResponse, ORJSONResponse

from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import json
import mysql.connector as connector
from firebase_admin import auth, credentials
import firebase_admin
import uuid
from datetime import datetime
from datetime import date, datetime

from send import get_response,get_doc_info

# from send import *  # File doesn't exist, functions defined locally
from utils import get_db_connection, save_documents_info, save_ledger_data_to_db, save_chatbot_messages

# Initialize Firebase Admin
try:
    cred = credentials.Certificate("service-account-key.json")
    firebase_admin.initialize_app(cred)
    print("Firebase Admin initialized successfully")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    raise Exception("Could not initialize Firebase Admin SDK")
# Load environment variables
load_dotenv()



def get_db():
    """Dependency function for FastAPI to get database connection"""
    cnx = get_db_connection()
    try:
        yield cnx
    finally:
        if cnx.is_connected():
            cnx.close()

def serialize_dates(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()  # YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
    raise TypeError(f"Type {type(obj)} not serializable")

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
    """Verify Firebase ID token and return user information"""
    token = auth_creds.credentials
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        
        # Add additional user information
        user_info = {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture"),
            "email_verified": decoded_token.get("email_verified", False),
            "auth_time": decoded_token.get("auth_time"),
            "exp": decoded_token.get("exp")
        }
        
        return user_info
        
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")








def fetch_documents_by_user(user_id, db=None):
    """
    Fetch all document info for a given user from the 'documents' table.
    
    Args:
        user_id (str): ID of the user whose documents are to be fetched
        db: MySQL connection object (optional). If None, a new connection will be created.
    
    Returns:
        list[dict]: List of document records
    """
    close_db = False
    if db is None:
        db = get_db_connection()
        close_db = True

    cursor = db.cursor(dictionary=True)  # dictionary=True gives results as dicts
    try:
        cursor.execute(
            "SELECT id, event_date, description, parts_mentioned, link "
            "FROM documents WHERE user_id = %s ORDER BY event_date DESC",
            (user_id,)
        )
        rows = cursor.fetchall()

        # Convert parts_mentioned (stored as JSON) back into Python object
        for row in rows:
            if row.get("parts_mentioned"):
                try:
                    row["parts_mentioned"] = json.loads(row["parts_mentioned"])
                except json.JSONDecodeError:
                    row["parts_mentioned"] = []

        return rows
    except Exception as e:
        print(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")
    finally:
        cursor.close()
        if close_db and db.is_connected():
            db.close()
            



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

@app.get("/api/health/db")
async def database_health_check():
    """Database health check endpoint"""
    try:
        cnx = get_db_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        cnx.close()
        
        if result:
            return JSONResponse(content={
                "status": "healthy",
                "message": "Database connection successful",
                "database": os.getenv("DB_NAME")
            })
    except Exception as e:
        print(f"Database health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.get("/api/auth/verify")
async def verify_auth(user=Depends(verify_token)):
    """Verify Firebase authentication"""
    return JSONResponse(content={
        "valid": True,
        "uid": user["uid"],
        "email": user["email"],
        "name": user.get("name"),
        "email_verified": user.get("email_verified", False)
    })




@app.post('/api/upload-ledger')
async def upload_medical_documents(file: UploadFile = File(...), user=Depends(verify_token), db=Depends(get_db)):
    """Upload medical documents (images/PDFs) for processing"""
    try:
        uid = user["uid"]
        UPLOAD_DIR = f"../backend/uploads/{uid}"
        
        # Validate file type
        allowed_types = [
            'application/pdf',
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp'
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file.content_type} not supported"
            )
        
        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds 10MB limit"
            )
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename to prevent conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(contents)

        # TODO: Implement document analysis functionality
        json_data = get_doc_info(file_path, uid)

        # Save ledger data to database with actual filename
        save_ledger_data_to_db(json_data, uid, user, db, unique_filename)
        
        return JSONResponse(content={
            "success": True,
            "message": "File uploaded successfully",
        })
        
    except HTTPException as e:
        # Re-raise HTTP exceptions (like 400, 401, etc.)
        raise e
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/medicalData")
async def send_body_data(user=Depends(verify_token), db=Depends(get_db)):
    """Get user's body parts data with viewable links"""
    cursor = None
    try:
        if not db.is_connected():
            raise Exception("Database connection is not active")
            
        cursor = db.cursor(dictionary=True)
        uid = user["uid"]

        cursor.execute("SELECT * FROM BodyParts WHERE user_id = %s", (uid,))
        body_parts_info = cursor.fetchall()
        
        # Process the data to ensure document links are properly formatted
        processed_data = []
        for record in body_parts_info:
            # Convert the record to a regular dict for modification
            record_dict = dict(record)
            
            # Ensure document_link is a full URL if it's just a filename
            document_link = record_dict.get('document_link')
            if document_link and not document_link.startswith('http') and not document_link.startswith('/api/'):
                # If it's just a filename, create the proper view URL
                if '/' not in document_link:  # It's just a filename
                    record_dict['document_link'] = f"/api/view/{document_link}"
            
            processed_data.append(record_dict)
        
        print(f"Retrieved {len(processed_data)} records for user {uid}")

        return ORJSONResponse(content={
            "bodyPartsInfo": processed_data
        })
        
    except Exception as e:
        print(f"Body data retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if cursor:
            cursor.close()


@app.websocket("/ws/chatbot/message")
async def chatbot_message(websocket: WebSocket):
    """WebSocket endpoint for chatbot communication"""
    await websocket.accept()

    try:
        # Wait for authentication message containing Firebase token
        auth_data = await websocket.receive_text()
        auth_message = json.loads(auth_data)
        token = auth_message.get("token")
        user_id = None

        if not token:
            await websocket.send_text(json.dumps({
                "type": "auth_error",
                "message": "No token provided"
            }))
            await websocket.close()
            return

        # Verify Firebase token
        try:
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token.get("uid")
            if not user_id:
                raise ValueError("UID not found in token")
        except Exception as e:
            await websocket.send_text(json.dumps({
                "type": "auth_error",
                "message": "Invalid Firebase token"
            }))
            await websocket.close()
            return

        # Open a single DB connection for the WebSocket session
        db_conn = get_db_connection()
        try:
            # Fetch user-specific data once after authentication
            data_tables = fetch_documents_by_user(user_id, db_conn)
            # Chat loop
            while True:
                data = await websocket.receive_text()
                user_message = json.loads(data)

                # Safely get message
                message_text = user_message.get("message", "")
                
                # Use cached user-specific data
                # TODO: Implement advanced response generation
                data_tables = fetch_documents_by_user(user_id)
                ai_response = get_response(message_text, data_tables)

                # Send response
                response = {
                    "type": "ai_response",
                    "message": ai_response,
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send_text(json.dumps(response))

                # Save chat
                save_chatbot_messages(message_text, ai_response, user_id, db_conn)
        finally:
            if db_conn.is_connected():
                db_conn.close()

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.close()


async def verify_websocket_token(websocket: WebSocket, token: str):
    """Verify Firebase token for WebSocket connection"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        await websocket.close(code=1008, reason="Invalid token")
        return None


@app.websocket("/ws/chatbot")
async def chatbot_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time chatbot communication with Firebase authentication"""
    await websocket.accept()
    
    user_data = None
    authenticated = False
    
    try:
        # Wait for authentication message
        auth_data = await websocket.receive_text()
        auth_message = json.loads(auth_data)
        
        if auth_message.get("type") == "auth":
            token = auth_message.get("token")
            if token:
                user_data = await verify_websocket_token(websocket, token)
                if user_data:
                    authenticated = True
                    await websocket.send_text(json.dumps({
                        "type": "auth_success",
                        "message": "Authentication successful"
                    }))
                    
                    # Send initial greeting message
                    greeting = {
                        "type": "bot_message",
                        "message": "Hello! I'm your medical assistant. How can I help you today?",
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send_text(json.dumps(greeting))
        
        if not authenticated:
            await websocket.send_text(json.dumps({
                "type": "auth_error", 
                "message": "Authentication failed"
            }))
            return
        
        # Main chat loop
        user_id = user_data.get("uid") if user_data else None
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "user_message":
                user_message = message_data.get("message", "")
                
                # Generate AI response using get_response function
                data_tables = fetch_documents_by_user(user_id)
                ai_response = get_response(user_message, data_tables)
                
                # Save chat messages to database
                try:
                    conversation_data = {
                        "user_id": user_id,
                        "user_message": user_message,
                        "bot_message": ai_response
                    }
                    db = get_db_connection()
                    save_chatbot_messages(user_message, ai_response, user_id, db)
                    if db.is_connected():
                        db.close()
                except Exception as db_error:
                    print(f"Failed to save chat message: {db_error}")
                
                # Send response back
                response = {
                    "type": "bot_message",
                    "message": ai_response,
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send_text(json.dumps(response))
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except json.JSONDecodeError:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Invalid JSON format"
        }))
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Connection error occurred"
        }))
    finally:
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.close()

@app.get("/api/user-files")
async def list_user_files(user=Depends(verify_token)):
    """List all files uploaded by the authenticated user"""
    try:
        uid = user["uid"]
        user_upload_dir = f"../uploads/{uid}"
        
        if not os.path.exists(user_upload_dir):
            return JSONResponse(content={
                "files": [],
                "message": "No files uploaded yet",
                "upload_directory": user_upload_dir
            })
        
        files = []
        for filename in os.listdir(user_upload_dir):
            file_path = os.path.join(user_upload_dir, filename)
            if os.path.isfile(file_path):
                # Get file stats
                file_stats = os.stat(file_path)
                file_size = file_stats.st_size
                created_date = datetime.fromtimestamp(file_stats.st_ctime).isoformat()
                modified_date = datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                
                # Determine file type
                file_extension = filename.lower().split('.')[-1]
                file_type = "image" if file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] else "document" if file_extension == 'pdf' else "other"
                
                files.append({
                    "filename": filename,
                    "file_type": file_type,
                    "extension": file_extension,
                    "size": file_size,
                    "size_human": f"{file_size / 1024:.1f} KB" if file_size < 1024*1024 else f"{file_size / (1024*1024):.1f} MB",
                    "created_date": created_date,
                    "modified_date": modified_date,
                    "view_url": f"/api/view/{filename}"
                })
        
        # Sort by creation date, newest first
        files.sort(key=lambda x: x['created_date'], reverse=True)
        
        return JSONResponse(content={
            "files": files,
            "count": len(files),
            "upload_directory": user_upload_dir
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@app.get("/api/view/{filename}")
async def view_file(filename: str, user=Depends(verify_token)):
    """View uploaded file (opens in browser)"""
    try:
        uid = user["uid"]
        filepath = f"../uploads/{uid}/{filename}"
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine media type based on file extension
        file_extension = filename.lower().split('.')[-1]
        media_type_map = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'txt': 'text/plain'
        }
        
        media_type = media_type_map.get(file_extension, 'application/octet-stream')
        
        return FileResponse(
            path=filepath,
            media_type=media_type,
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error viewing file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)