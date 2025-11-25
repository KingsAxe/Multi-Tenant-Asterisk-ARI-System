from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+aiomysql://ivr_user:ivr_pass123@mysql:3306/ivr_system"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Asterisk ARI
    ASTERISK_ARI_URL: str = "http://asterisk:8088/ari"
    ASTERISK_ARI_USER: str = "ariuser"
    ASTERISK_ARI_PASSWORD: str = "aripass123"
    
    # JWT
    JWT_SECRET: str = "my-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    class Config:
        env_file = ".env"

settings = Settings()