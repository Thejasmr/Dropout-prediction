import os
import json
from datetime import datetime
from fastapi import APIRouter, status, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from app.tasks.notification_tasks import send_demo_request_notification
from app.core.dependencies import require_role
from app.models.user import User

router = APIRouter(prefix="/demo", tags=["Demo Requests"])


class DemoRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    institute: str
    role: str


class DemoRequestResponse(BaseModel):
    full_name: str
    email: EmailStr
    institute: str
    role: str
    status: str
    created_at: str


@router.post("/request", status_code=status.HTTP_200_OK)
async def request_demo(demo_in: DemoRequestCreate):
    # Save the request locally to a JSON file
    os.makedirs("data", exist_ok=True)
    file_path = "data/demo_requests.json"
    
    requests_list = []
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                requests_list = json.load(f)
        except Exception:
            pass
            
    # Normalize email and filter out any existing duplicates
    input_email = demo_in.email.strip().lower()
    filtered_requests = []
    existing = None
    for r in requests_list:
        if r.get("email", "").strip().lower() == input_email:
            existing = r
        else:
            filtered_requests.append(r)
            
    if existing:
        existing.update({
            "full_name": demo_in.full_name,
            "institute": demo_in.institute,
            "role": demo_in.role,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        })
        filtered_requests.append(existing)
    else:
        filtered_requests.append({
            "full_name": demo_in.full_name,
            "email": demo_in.email,
            "institute": demo_in.institute,
            "role": demo_in.role,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        })
    requests_list = filtered_requests
    
    with open(file_path, "w") as f:
        json.dump(requests_list, f, indent=2)

    # Fast check if Redis is online to prevent Celery from blocking the request thread
    import socket
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = os.getenv("REDIS_PORT", "6379")
    
    redis_online = False
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.05)  # 50ms is plenty for localhost check
        s.connect((redis_host, int(redis_port)))
        redis_online = True
        s.close()
    except Exception:
        redis_online = False

    if redis_online:
        try:
            send_demo_request_notification.delay(
                full_name=demo_in.full_name,
                email=demo_in.email,
                institute=demo_in.institute,
                role=demo_in.role
            )
        except Exception as e:
            print(f"[CELERY FALLBACK] Redis error during delay ({e}). Running inline.")
            try:
                send_demo_request_notification(
                    full_name=demo_in.full_name,
                    email=demo_in.email,
                    institute=demo_in.institute,
                    role=demo_in.role
                )
            except Exception as inner_err:
                print(f"[CELERY ERROR] Failed to run fallback task: {inner_err}")
    else:
        print("[CELERY FALLBACK] Redis server is offline. Executing notification task synchronously.")
        try:
            send_demo_request_notification(
                full_name=demo_in.full_name,
                email=demo_in.email,
                institute=demo_in.institute,
                role=demo_in.role
            )
        except Exception as inner_err:
            print(f"[CELERY ERROR] Failed to run synchronous task: {inner_err}")
    
    return {"message": "Demo request received successfully."}


@router.get("/requests", response_model=list[DemoRequestResponse])
async def list_demo_requests(current_user: User = Depends(require_role(["admin"]))):
    file_path = "data/demo_requests.json"
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            # Ensure each request has status and created_at fallback
            for item in data:
                if "status" not in item:
                    item["status"] = "pending"
                if "created_at" not in item:
                    item["created_at"] = datetime.utcnow().isoformat()
            return data
    except Exception:
        return []


@router.post("/requests/{email}/resolve", response_model=list[DemoRequestResponse])
async def resolve_demo_request(email: EmailStr, current_user: User = Depends(require_role(["admin"]))):
    file_path = "data/demo_requests.json"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="No demo requests found.")
        
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            
        found = False
        for item in data:
            if item.get("email") == email:
                # Toggle status
                item["status"] = "contacted" if item.get("status") != "contacted" else "pending"
                found = True
                break
                
        if not found:
            raise HTTPException(status_code=404, detail="Request not found.")
            
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
            
        return data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
