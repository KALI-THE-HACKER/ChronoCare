from pydantic import BaseModel,Field
from typing import Optional,List
from datetime import datetime,timezone,date
from agno.agent import Agent, RunResponse
from pydantic import BaseModel, Field
from agno.models.google import Gemini
from agno.utils.log import logger
from enum import Enum
import os, json
import logging
from dotenv import load_dotenv
from pypdf import PdfReader 

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

class BodyPartName(Enum):
    brain = "brain"
    heart = "heart"
    lungs = "lungs"
    stomach = "stomach"
    kidneys = "kidneys"
    arms = "arms"
    knee = "knee"
    ankle = "ankle"
    shoulder = "shoulder"
    spine = "spine"
    eyes = "eyes"

class BodyPart(BaseModel):
    id: int = Field(..., description="Unique identifier for the body part")
    name: BodyPartName = Field(..., description="Name of the body part")
    description : str = Field(..., description="A concise summary of findings from the document that are RELEVANT ONLY to this specific body part.")

class DocumentType(Enum):
    lab_report = "lab_report"
    prescription = "prescription"
    imaging_report = "imaging_report"          
    discharge_summary = "discharge_summary"  
    surgery_report = "surgery_report"         
    consultation_note = "consultation_note"   
    referral_letter = "referral_letter"       
    vaccination_record = "vaccination_record" 
    other = "other"

class Details(BaseModel):
    id: int = Field(..., description="Unique identifier for the upload. This will be system-generated.")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).date(),description="The primary date of the medical event, extracted from the document.")
    findings : List[BodyPart] =  Field(..., description="A list of all body-part-specific findings extracted from the document.")
    document_type: DocumentType = Field(..., description="The classified type of the document.")
    description: str = Field(...,description="A concise, clinically accurate summary of the document's key findings and conclusions.")

    
fetcher: Agent = Agent(
    model=Gemini(id="gemini-2.0-flash", api_key=api_key), 
    description = "A specialized AI agent that performs a thorough analysis of a medical document to extract its type, date, and a list of tailored summaries for each affected body part.",
    instructions = """
        # MISSION
        You are a hyper-specialized medical AI, an expert in clinical document analysis and data extraction. Your mission is to meticulously process a given medical document and transform its contents into a structured, clinically-relevant summary according to the `Details` model. Your output is critical for building a patient's medical timeline for review by healthcare professionals. Accuracy, precision, and conciseness are paramount.

        # OPERATING PROCEDURE
        Follow this procedure step-by-step to ensure consistent and accurate results.

        ## STEP 1: GLOBAL ANALYSIS
        First, analyze the document as a whole to determine its global properties.
        1.  **Temporal Analysis (Timestamp Extraction):**
            * Scan the entire document for dates. Prioritize dates labeled "Date of Service," "Report Date," "Procedure Date," or "Discharge Date."
            * Select the single primary date that represents the time of the actual medical event.
            * If no date can be found, the system will handle it, but your primary goal is to find the contextual date.
        2.  **Document Classification:**
            * Examine the document's title, headers, and overall structure.
            * Look for explicit keywords like "Laboratory Report," "Radiology Report," "Prescription," etc.
            * Assign the most appropriate `DocumentType` enum. Use `other` as a last resort.
        3.  **Anatomical Identification:**
            * Read the entire document to identify all mentions of anatomical parts, organs, or physiological systems.
            * Map every identified part to one of the choices in the `BodyPartName` enum. For example, "anterior cruciate ligament" maps to `knee`, and "myocardium" maps to `heart`.
            * For systemic issues like diabetes, identify the primary organs discussed or at risk from the predefined list (e.g., `heart`, `kidneys`, `eyes`).
            * Create a final, unique list of all implicated `BodyPartName`s.

        ## STEP 2: FOCUSED SUMMARY GENERATION
        With the global information gathered, create a `BodyPart` object for each body part identified in the previous step.
        1.  **Isolate Relevant Information:** For each body part, focus ONLY on the sections, sentences, and data points relevant to it.
        2.  **Clinical Synthesis (Focused Description):** Write a dense, clinical `description` for that body part.
            * **Content to Include:** Start with the primary diagnosis or key findings. Include critical results, measurements, conclusions, or treatment plans *relevant to that part*. For normal findings, explicitly state they are normal.
            * **Content to Exclude:** Patient identifying information, document boilerplate, vague language, and information about other body parts.
            * **Format:** The summary should be a concise, self-contained statement.

        ## STEP 3: FINAL ASSEMBLY
        Combine the global `timestamp` and `document_type` with the list of `findings` you created into the final `Details` object.

        # GUIDING PRINCIPLES & CONSTRAINTS
        - **NO HALLUCINATION:** Every piece of information in your output MUST be directly traceable to the source document.
        - **CLINICAL TERMINOLOGY:** Use precise medical terms found in the document.
        - **OUTPUT STRUCTURE:** Adhere strictly to the `Details` Pydantic model. Do not add, omit, or alter fields.
    """,
    response_model = Details,
    # debug_mode = True
)

def _model_to_dict(model) -> dict:
    """Convert a Pydantic model to a plain dict with enums and datetimes normalized."""
    if hasattr(model, "model_dump"):
        data = model.model_dump()
    elif hasattr(model, "dict"):
        data = model.dict()
    else:
        data = model

    def _convert(obj):
        if isinstance(obj, dict):
            return {k: _convert(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_convert(v) for v in obj]
        if isinstance(obj, datetime):
            return obj.isoformat()     
        if isinstance(obj, Enum):
            return obj.value
        return obj

    return _convert(data)

def process_upload(file_path:str) -> Details:
    logger.info("Starting to process upload")
    reader = PdfReader(file_path)
    logger.info(f"Starting to read file at {file_path}")
    text = ""
    for i,page in enumerate(reader.pages):
        text += page.extract_text() + "\n"
        logger.info("Extracted text from page %d",i+1)
    
    try:
        logger.info("Sending text to AI agent for processing")
        response: RunResponse = fetcher.run(text)
        logger.info("Successfully processed upload and extracted details")
        details = response.content
        json_details = _model_to_dict(details)
        return json_details

    except Exception as e:
        logger.error(f"Error processing upload: {e}")
        raise


if __name__=="__main__":
    # sample_file = "D:/ChronoCare/LabRecord.pdf"
    # sample_file = "D:/ChronoCare/ImagingRecord.pdf"
    sample_file = "D:/ChronoCare/Medicine.pdf"
    details = process_upload(sample_file)
    print(details)
    # print(type(details))