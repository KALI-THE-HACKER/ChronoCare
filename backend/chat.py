from pydantic import BaseModel,Field
from typing import Optional,List
from datetime import datetime,timezone,date
from agno.agent import Agent, RunResponse
from agno.tools.function import Function
from pydantic import BaseModel, Field
from agno.models.google import Gemini
from agno.utils.log import logger
from enum import Enum
import os, json
import logging
from dotenv import load_dotenv
from pypdf import PdfReader 
from db import search
from agno.document.base import Document

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("output.log"),
        logging.StreamHandler()             
    ]
)

logger = logging.getLogger(__name__)

def retrieve_medical_context(query:str,document_paths:List[str])->List[Document]:
    try:
        results = None
        for paths in document_paths:
            result = search(query=query,document_path=paths)
            if results is None:
                results = result
            else:
                results.extend(result)
        return results
    
    except Exception as e:
        logger.error(f"Error during vector search {e}")
        raise

chatbot: Agent = Agent(
    model=Gemini(id="gemini-2.0-flash", api_key=api_key), 
    description = "An AI assistant that analyzes a patient's medical history from multiple documents to provide accurate answers to a doctor's questions",
    instructions = """
        # MISSION & PERSONA
        You are a direct, factual Medical AI Assistant. Your primary mission is to answer a doctor's questions about a patient's medical history. **Your output must ALWAYS be the final answer, not your reasoning process or plan.** You will follow a strict procedure internally, but your final response to the user will only be the synthesized result.

        # CONTEXT
        You will receive two inputs:
        1.  `user_query`: The question the doctor is asking.
        2.  `available_documents`: A summary list of all documents for the patient, including a description, date, and a `document_link` (path).

        # INTERNAL OPERATING PROCEDURE
        This is your internal thought process. Do not repeat this process in your output.

        ## STEP 1: ANALYZE THE QUERY'S INTENT
        First, determine the nature of the user's query.

        ### -> Branch A: General Conversation or General Medical Knowledge
        - **Criteria**: The query is conversational ("hello", "thanks"), a command, or asks for general medical information not specific to the patient ("what is cholesterol?").
        - **Action**: Proceed directly to the "FINAL OUTPUT INSTRUCTIONS" and formulate a helpful answer without using tools.

        ### -> Branch B: Patient-Specific Medical History Question
        - **Criteria**: The query asks ANYTHING about the patient's data.
        - **Action**:
            1.  **Select Relevant Documents**: Internally, review the `available_documents` list. Based on each document's `description` and `date`, decide if it is relevant to the query.
            2.  **Create a Document List**: Compile a list of the `document_link` strings for ALL potentially relevant documents.
            3.  **Call the Tool**: You MUST call the `retrieve_medical_context` tool. Pass the original `user_query` and the `document_paths` list you just created.
            4.  **Wait for Tool Output**: Once the tool returns the `retrieved_chunks`, proceed to the "FINAL OUTPUT INSTRUCTIONS" to build your answer.

        # AVAILABLE TOOLS
        - `retrieve_medical_context(query: str, document_paths: List[str]) -> List[Document]`:
            - **Description**: Performs a vector search on a specific list of documents and returns the most relevant text chunks.
            - **When to use**: Use it for ANY patient-specific medical question.

        # FINAL OUTPUT INSTRUCTIONS
        Your final response to the user MUST be a single, direct answer.

        - **If you followed Branch A (General Question):** Your final output is simply the helpful, conversational answer.
        - **If you followed Branch B (Used the Tool):**
            - Your final output is the synthesized answer based *exclusively* on the `retrieved_chunks` from the tool.
            - **Cite your sources** within the answer by mentioning the document's name and date.
            - If the tool returned no relevant information, your final output must be a statement like, "The provided medical documents do not contain information about [the user's query]."
            - **DO NOT** say "I will call the tool" or "Based on my plan...". Just provide the answer.

        # GUIDING PRINCIPLES
        - **ZERO HALLUCINATION**: Never state a fact not supported by the retrieved chunks.
        - **DO NOT INTERPRET**: Report facts, do not give a new diagnosis.
        - **ADHERE TO THE RESPONSE MODEL**: Your final output must strictly follow the `FinalAnswer` Pydantic model.
    """,
    tools=[Function.from_callable(retrieve_medical_context, strict=False)],
    # debug_mode = True
)

def process_request(user_query:str, meta_data:str) -> str:
    prompt = "available_documents: \n"+meta_data
    prompt += f"\nuser_query: {user_query}\n\n"
    response = chatbot.run(prompt)
    return response.content


if __name__=="__main__":
    meta_data = """
    Time: 2024-10-05T00:00:00+00:00
    Description: MRI of the right shoulder shows a partial-thickness articular surface tear of the supraspinatus tendon with associated tendinosis, mild biceps tendinosis, and mild degenerative changes of the acromioclavicular joint.
    Link: D:/ChronoCare/ImagingRecord.pdf

    Time: 2024-09-12T00:00:00+00:00
    Description: Complete blood count, comprehensive metabolic panel and lipid panel results are provided. The lipid panel shows mildly elevated total cholesterol (210 mg/dL) and triglycerides (160 mg/dL), with LDL cholesterol elevated at 133 mg/dL. Recommend lifestyle modification and follow-up.
    Link: D:/ChronoCare/LabRecord.pdf"""
    user_query = "What was the patient's cholestrol level?"
    response = process_request(user_query=user_query, meta_data=meta_data)
    print(response)