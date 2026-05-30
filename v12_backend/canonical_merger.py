# canonical_merger.py
import hashlib
import logging
import asyncpg # type: ignore
import json

logger = logging.getLogger(__name__)

class CanonicalMerger:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        try:
            self.pool = await asyncpg.create_pool(self.db_url, min_size=1, max_size=10)
        except Exception as e:
            logger.critical(f"Failed to connect to PostgreSQL: {e}")
            raise

    async def close(self):
        if self.pool:
            await self.pool.close()

    def generate_canonical_id(self, company: str, title: str, location: str) -> str:
        c = company.strip().lower()
        t = title.strip().lower()
        l = (location or "remote").strip().lower()
        
        combined_string = f"{c}{t}{l}".encode('utf-8')
        return hashlib.sha256(combined_string).hexdigest()

    async def upsert_internship(self, source_id: int, url: str, company: str, title: str, location: str) -> None:
        if not self.pool:
            raise RuntimeError("Database connection pool is not initialized")
            
        canonical_id_hash = self.generate_canonical_id(company, title, location)
        
        # Postgres parameter tokens adapted for asyncpg security ($1, $2, etc.)
        query = """
            INSERT INTO public.internships (
                canonical_id_hash, source_id, url, title, company, location, current_state, metadata_history
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'DISCOVERED', $7::jsonb)
            ON CONFLICT (canonical_id_hash) DO UPDATE SET
                last_seen_at = NOW(),
                metadata_history = public.internships.metadata_history || EXCLUDED.metadata_history;
        """
        
        try:
            initial_metadata = json.dumps({"upserted_via": "canonical_merger", "schema_version": 1})
            async with self.pool.acquire() as connection:
                await connection.execute(
                    query,
                    canonical_id_hash,
                    source_id,
                    url,
                    title,
                    company,
                    location,
                    initial_metadata
                )
            logger.info(f"Successfully upserted internship entity: {canonical_id_hash}")
        except asyncpg.PostgresError as e:
            logger.error(f"Database upsert transaction failed for canonical ID {canonical_id_hash}: {e}")
        except Exception as e:
            logger.error(f"Unexpected data-layer error during upsert: {e}")
