from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ShebaLink API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/shebalink"
    )
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
