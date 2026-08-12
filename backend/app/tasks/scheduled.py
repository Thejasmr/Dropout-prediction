from celery.schedules import crontab
from .celery_app import celery_app

celery_app.conf.beat_schedule = {
    "weekly-mentor-digest": {
        "task": "app.tasks.notification_tasks.dispatch_weekly_digests",
        "schedule": crontab(hour=8, minute=0, day_of_week="monday"),
    },
    "nightly-risk-rescore": {
        "task": "app.tasks.risk_tasks.rescore_all_students_nightly",
        "schedule": crontab(hour=1, minute=0),
    },
}
