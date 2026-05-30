# sanity_sync.py
import os
import logging
import asyncio
import aiohttp
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Sanity V2 API Configuration
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID", "default_project")
SANITY_DATASET = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")
API_VERSION = "v2026-03-01"
SANITY_MUTATE_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/{API_VERSION}/data/mutate/{SANITY_DATASET}"

class SanitySyncEngine:
    def __init__(self, max_retries: int = 5, base_backoff: float = 1.0):
        self.max_retries = max_retries
        self.base_backoff = base_backoff
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SANITY_API_TOKEN}"
        }
        
    async def sync_postgres_record_to_sanity(self, db_record: Dict[str, Any]) -> bool:
        """
        Maps a PostgreSQL relational record to a Sanity document and pushes it.
        Enforces idempotency using canonical_id_hash mapping to _id.
        """
        canonical_id = db_record.get("canonical_id_hash")
        if not canonical_id:
            logger.error("Database record missing canonical_id_hash, cannot sync.")
            return False
            
        # Map DB columns to Sanity schema requirements (v12.1)
        sanity_document = {
            "_id": canonical_id,
            "_type": "internship",
            "title": db_record.get("title", ""),
            "company": db_record.get("company", ""),
            "location": db_record.get("location", "Remote"),
            "url": db_record.get("url", ""),
            "stipend": db_record.get("stipend", "Not Disclosed"),
            "schema_version": 1
        }
        
        payload = {
            "mutations": [
                {
                    "createOrReplace": sanity_document
                }
            ]
        }
        
        return await self._dispatch_mutation_with_retry(payload, document_id=canonical_id)
        
    async def _dispatch_mutation_with_retry(self, payload: Dict[str, Any], document_id: str) -> bool:
        retries = 0
        
        async with aiohttp.ClientSession() as session:
            while retries <= self.max_retries:
                try:
                    async with session.post(SANITY_MUTATE_URL, headers=self.headers, json=payload) as response:
                        if response.status == 200:
                            logger.info(f"Successfully synced internship to Sanity: {document_id}")
                            return True
                            
                        # Handle rate limits specifically
                        if response.status == 429:
                            retry_after = int(response.headers.get("Retry-After", 2))
                            logger.warning(f"Sanity API rate limit hit (429). Retrying after {retry_after}s.")
                            await asyncio.sleep(retry_after)
                            retries += 1
                            continue
                            
                        # For other server errors, apply exponential backoff
                        if response.status >= 500:
                            backoff_time = self.base_backoff * (2 ** retries)
                            logger.warning(f"Sanity server error ({response.status}). Retrying in {backoff_time}s.")
                            await asyncio.sleep(backoff_time)
                            retries += 1
                            continue
                            
                        # Fatal client errors (400, 401, 403, etc.)
                        response_text = await response.text()
                        logger.error(f"Fatal Sanity API error ({response.status}): {response_text}")
                        return False
                        
                except aiohttp.ClientError as e:
                    backoff_time = self.base_backoff * (2 ** retries)
                    logger.error(f"Network error communicating with Sanity: {e}. Retrying in {backoff_time}s.")
                    await asyncio.sleep(backoff_time)
                    retries += 1
                    
        logger.critical(f"Failed to sync {document_id} after {self.max_retries} retries. Payload dropped.")
        return False
