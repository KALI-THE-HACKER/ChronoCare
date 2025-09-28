from upload import *
from typing import Dict
from db import *
from chat import process_request
from pydantic import BaseModel
from datetime import datetime,timezone,date

from utils import save_documents_info

class DocInfo(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).date(),description="The primary date of the medical event, extracted from the document.")
    description :str = Field(...,description="A concise summary of findings from the document.")
    link: str = Field(...,description="Path to the document on the server.")

class DocInfoList(BaseModel):
    docs: List[DocInfo] = Field(...,description="List of document information.")


#-----HELPER FUNCTIONS------#
def transform_record(record: dict, document_link:str) -> dict:
    """
    Transform input JSON record into the desired body-part keyed format.
    """
    output = {}
    
    for finding in record.get("findings", []):
        part_name = finding["name"].lower()

        entry = {
            "doc_id": str(record.get("id")),
            "date": record["timestamp"],
            "doc_type": record.get("document_type"),
            "details": finding.get("description", ""),
            "document_link": document_link
        }
        output.setdefault(part_name, []).append(entry)

    return output


def structure_meta_data(doc_info:List[Dict])->str:
    info = DocInfoList(docs=doc_info)
    parts = []
    for doc in info.docs:
        parts.append(
            f"Time: {doc.timestamp.isoformat()}\n"
            f"Description: {doc.description}\n"
            f"Link: {doc.link}"
        )
    return "\n\n".join(parts)    


#------MAIN FUNCTIONS------#
def get_doc_info(file_path:str,user_id:str):
    details = process_upload(file_path)

    doc_output = {}
    doc_output["timestamp"] = details.get("timestamp","")
    doc_output["description"] = details.get("description", "")
    doc_output["parts_mentioned"] = [finding["name"].lower() for finding in details.get("findings", [])]

    chunks = semantically_chunk_pdf(file_path=file_path,meta_data=doc_output)
    _ = save_chunks_to_chroma(chunks=chunks)
    
    doc_output["link"] = file_path
    document_link = file_path 
    transformed = transform_record(details, document_link)

    #push doc_output to backend table
    save_documents_info(doc_output,user_id)

    return transformed


def get_response(user_query:str, meta_datas:List[Dict])->str:
    meta_data = structure_meta_data(meta_datas)
    response = process_request(user_query=user_query, meta_data=meta_data)
    return response


#-----TESTING-------#
if __name__ == "__main__":

    #Uploading the file
    # sample_file = "D:/ChronoCare/DischargeRecord.pdf"
    # transformed,doc_output = get_doc_info(sample_file)
    # print(transformed)
    # final_description = doc_output["description"]
    # print("Overall Description:",final_description)

    md1 = {'description': 'MRI of the right shoulder shows a partial-thickness articular surface tear of the supraspinatus tendon with associated tendinosis, mild biceps tendinosis, and mild degenerative changes of the acromioclavicular joint.', 'parts_mentioned': ['shoulder'], 'link':'D:/ChronoCare/ImagingRecord.pdf', 'timestamp' : '2024-10-05T00:00:00+00:00'}
    md2 = {'description': 'The lipid panel shows mildly elevated total cholesterol (210 mg/dL) and triglycerides (160 mg/dL). Recommend lifestyle modification and follow-up.', 'parts_mentioned': ['heart'], 'link':'D:/ChronoCare/LabRecord.pdf', 'timestamp' : '2024-09-12T00:00:00+00:00'}
    md3 = {'description': 'Patient presented with community-acquired pneumonia in the right lower lobe and was treated with Levofloxacin. The patient responded well to antibiotic therapy, and her fever resolved within 72 hours. She was discharged in stable condition with prescriptions for Levofloxacin, Albuterol inhaler, and Tylenol. Follow up with primary care physician in 7-10 days.','link':'D:/ChronoCare/DischargeRecord.pdf', 'timestamp':'2025-03-15T00:00:00+00:00'}
    records = [md1, md2,md3]  
    print(get_response(user_query="When did the patient get pneumonia and how was it treated?",meta_datas=records))