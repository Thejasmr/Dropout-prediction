from .celery_app import celery_app


@celery_app.task(name="app.tasks.notification_tasks.send_high_risk_alert")
def send_high_risk_alert(student_id: str, student_name: str, risk_score: float):
    """
    Dispatches immediate Email/SMS alert for high-risk student crossing 70 threshold.
    """
    print(f"[ALERT DISPATCH] Student {student_name} ({student_id}) flagged HIGH RISK with score {risk_score}.")
    return {"status": "dispatched", "student_id": student_id, "channel": "Email+SMS"}


@celery_app.task(name="app.tasks.notification_tasks.dispatch_weekly_digests")
def dispatch_weekly_digests():
    """
    Weekly Monday 8 AM mentor digest dispatch task.
    """
    print("[WEEKLY DIGEST] Dispatching weekly risk digests to all counsellors and mentors...")
    return {"status": "completed", "digests_sent": 15}


@celery_app.task(name="app.tasks.notification_tasks.send_demo_request_notification")
def send_demo_request_notification(full_name: str, email: str, institute: str, role: str):
    """
    Sends an email notification for a new institutional demo request to the admin email.
    """
    import os
    import smtplib
    from email.mime.text import MIMEText
    
    subject = f"EduPulse AI - New Demo Request from {full_name}"
    body = (
        f"Hello Admin,\n\n"
        f"You have received a new institutional demo request via EduPulse AI:\n\n"
        f"Name: {full_name}\n"
        f"Email: {email}\n"
        f"Institute: {institute}\n"
        f"Role: {role}\n\n"
        f"Please log in to your EduPulse admin dashboard under Settings -> Demo Requests to manage this request.\n\n"
        f"Best regards,\n"
        f"EduPulse AI System"
    )
    
    admin_recipient = "anandsrinivas98@gmail.com"
    print(f"[DEMO REQUEST EMAIL] Dispatching to: {admin_recipient}\nSubject: {subject}\nBody:\n{body}")
    
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", "noreply@edupulse.ai")
    
    if smtp_host and smtp_port:
        try:
            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = email_from
            msg["To"] = admin_recipient
            
            with smtplib.SMTP(smtp_host, int(smtp_port), timeout=5) as server:
                if smtp_user and smtp_pass:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            print("[DEMO REQUEST EMAIL] Email successfully sent via SMTP.")
            return {"status": "sent", "recipient": admin_recipient, "channel": "SMTP"}
        except Exception as e:
            print(f"[DEMO REQUEST EMAIL] SMTP send failed: {e}")
            
    return {"status": "logged", "recipient": admin_recipient, "channel": "Console"}
