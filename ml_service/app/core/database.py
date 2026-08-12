import psycopg2
from psycopg2.extras import RealDictCursor
from ml_service.app.core.config import settings


def get_db_connection():
    """
    Returns a read-only database connection for historical data extraction during model retraining.
    """
    try:
        conn = psycopg2.connect(
            settings.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Database connection warning: {e}")
        return None
