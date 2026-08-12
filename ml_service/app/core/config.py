import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    ML_SERVICE_PORT: int = 8001

    POSTGRES_DB: str = "dropout_db"
    POSTGRES_USER: str = "dropout_user"
    POSTGRES_PASSWORD: str = "your_secure_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = "postgresql+psycopg2://dropout_user:your_secure_password@localhost:5432/dropout_db"

    MODEL_VERSION: str = "v1.0.0"
    RISK_HIGH_THRESHOLD: float = 70.0
    RISK_MEDIUM_THRESHOLD: float = 40.0

    ARTIFACTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
