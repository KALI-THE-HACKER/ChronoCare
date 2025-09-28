import json
import uuid
import os
from datetime import datetime
from dotenv import load_dotenv
import mysql.connector as connector
from fastapi import HTTPException

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create a database connection"""
    try:
        cnx = connector.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USERNAME"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            autocommit=False
        )
        return cnx
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

def save_documents_info(doc_output, user_id, db=None):
    """
    Save document info to the 'documents' table in the database.

    Args:
        doc_output (dict): Contains 'timestamp', 'description', 'parts_mentioned', 'link'
        user_id (str): ID of the user to whom the document belongs
        db: MySQL connection object (optional). If None, a new connection will be created.
    """
    close_db = False
    if db is None:
        db = get_db_connection()
        close_db = True

    cursor = db.cursor()
    try:
        doc_id = str(uuid.uuid4())
        event_date = doc_output.get("timestamp")
        description = doc_output.get("description")
        parts_mentioned = json.dumps(doc_output.get("parts_mentioned", []))
        link = doc_output.get("link")

        cursor.execute(
            "INSERT INTO documents (id, user_id, event_date, description, parts_mentioned, link) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (doc_id, user_id, event_date, description, parts_mentioned, link)
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving document info: {e}")
        raise HTTPException(status_code=500, detail="Failed to save document info")
    finally:
        cursor.close()
        if close_db and db.is_connected():
            db.close()

def save_ledger_data_to_db(json_data: str, uid: str, user_info: dict, db, filename: str = None):
    """Save ledger data to BodyParts table"""
    cursor = None
    try:
        if not db.is_connected():
            raise Exception("Database connection is not active")
            
        data = json_data
        cursor = db.cursor(dictionary=True)
        
        for key, value in data.items():
            if isinstance(value, list):
                for item in value:
                    # Create view link using the filename
                    view_link = f"/api/view/{filename}" if filename else item.get('document_link')
                    
                    cursor.execute(
                        "INSERT INTO BodyParts (user_id, body_part_name, date, doc_type, details, document_link) VALUES (%s, %s, %s, %s, %s, %s)",
                        (uid, key, item.get('date'), item.get('doc_type'), item.get('details'), view_link)
                    )
        
        db.commit()
        print(f"Successfully saved data for user {uid}")
        
    except json.JSONDecodeError as e:
        if db.is_connected():
            db.rollback()
        raise HTTPException(status_code=400, detail=f"Invalid JSON data: {str(e)}")
    except Exception as e:
        if db.is_connected():
            db.rollback()
        print(f"Database save error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if cursor:
            cursor.close()

def save_chatbot_messages(user_query: str, ai_response: str, uid: str, db: connector.MySQLConnection):
    """Save chatbot conversation to database"""
    cursor = None
    try:
        if not db.is_connected():
            raise Exception("Database connection is not active")
            
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            "INSERT INTO Conversations (user_id, query, response) VALUES (%s, %s, %s)", 
            (uid, user_query, ai_response)
        )
        db.commit()
        print(f"Successfully saved conversation for user {uid}")
        
    except Exception as e:
        if db.is_connected():
            db.rollback()
        print(f"Database save error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if cursor:
            cursor.close()