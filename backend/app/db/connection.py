import asyncpg
import logging
import os
from app.core.config import get_settings

logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        self.pool = None

    async def init_db_pool(self):
        settings = get_settings()
        try:
            self.pool = await asyncpg.create_pool(dsn=settings.DATABASE_URL)
            logger.info("Database connection pool successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize database connection pool: {e}")
            raise

    async def close_db_pool(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed.")

    def get_db(self):
        if not self.pool:
            raise Exception("Database pool is not initialized yet.")
        return self.pool

    async def init_schema(self, schema_path: str = "app/db/schema.sql"):
        if not self.pool:
            raise Exception("Database pool is not initialized yet.")
        
        if not os.path.exists(schema_path):
            logger.warning(f"Schema file not found at {schema_path}, skipping schema initialization.")
            return

        with open(schema_path, "r") as f:
            schema_sql = f.read()

        async with self.pool.acquire() as conn:
            await conn.execute(schema_sql)
            logger.info("Database schema applied successfully.")

db = DatabaseConnection()

# Helper exports
init_db_pool = db.init_db_pool
close_db_pool = db.close_db_pool
get_db = db.get_db
init_schema = db.init_schema
