import os
from celery import Celery

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = os.getenv("REDIS_PORT", "6379")

broker_url = os.getenv("CELERY_BROKER_URL", f"redis://{redis_host}:{redis_port}/1")
result_backend = os.getenv("CELERY_RESULT_BACKEND", f"redis://{redis_host}:{redis_port}/2")

celery_app = Celery(
    "dropout_prediction_tasks",
    broker=broker_url,
    backend=result_backend,
    include=[
        "app.tasks.risk_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.scheduled",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
