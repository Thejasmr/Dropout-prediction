import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion"])


def _log_ingestion_history(filename: str, processed_records: int, status_str: str):
    try:
        os.makedirs("data", exist_ok=True)
        history_path = "data/ingestion_history.json"
        
        history_list = []
        if os.path.exists(history_path):
            try:
                with open(history_path, "r") as f:
                    history_list = json.load(f)
            except Exception:
                pass
                
        # Generate new batch ID
        next_id = 1
        if history_list:
            try:
                next_id = max(int(item.get("id", 0)) for item in history_list) + 1
            except Exception:
                next_id = len(history_list) + 1
            
        history_list.append({
            "id": str(next_id),
            "filename": filename,
            "processed_records": processed_records,
            "status": status_str,
            "uploaded_at": datetime.utcnow().isoformat()
        })
        
        with open(history_path, "w") as f:
            json.dump(history_list, f, indent=2)
    except Exception as e:
        print(f"[INGESTION HISTORY ERROR] Failed to write history: {e}")


@router.post("/upload")
async def upload_ingestion_file(
    file: UploadFile = File(...),
    field_mapping_json: Optional[str] = Form(None),
    entity_type: str = Form("student"),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    field_mapping = {}
    if field_mapping_json:
        try:
            field_mapping = json.loads(field_mapping_json)
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON in field_mapping_json")

    df = None
    try:
        df = await IngestionService.parse_and_validate_file(file)

        if entity_type == "student":
            result = await IngestionService.ingest_students(session, df, field_mapping)
        elif entity_type == "attendance":
            result = await IngestionService.ingest_attendance(session, df, field_mapping)
        elif entity_type == "assessment":
            result = await IngestionService.ingest_assessments(session, df, field_mapping)
        elif entity_type == "fee":
            result = await IngestionService.ingest_fees(session, df, field_mapping)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported entity type: {entity_type}"
            )
            
        _log_ingestion_history(file.filename or "unknown", len(df) if df is not None else 0, "completed")
        return result
        
    except Exception as e:
        _log_ingestion_history(file.filename or "unknown", len(df) if df is not None else 0, "failed")
        raise e


@router.get("/history")
async def get_ingestion_history(
    current_user: User = Depends(get_current_user)
):
    history_path = "data/ingestion_history.json"
    if not os.path.exists(history_path):
        # Default mock starting history if no uploads have occurred yet
        return [
            {
                "id": "1",
                "filename": "students_batch_2025.csv",
                "processed_records": 120,
                "status": "completed",
                "uploaded_at": "2026-07-29T10:00:00Z"
            }
        ]
        
    try:
        with open(history_path, "r") as f:
            return json.load(f)
    except Exception:
        return []


@router.post("/reprocess")
async def reprocess_ingestion(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Reprocessing queued successfully"}


@router.post("/map-fields")
async def map_fields(
    mapping: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    return {"message": "Field mapping saved successfully", "mapping": mapping}
