# pipeline_engine.py
import hashlib
import logging
import time
import re
from pydantic import BaseModel, Field
from redis.asyncio import Redis

from compliance_scraper import AsyncScraper
from canonical_merger import CanonicalMerger

logger = logging.getLogger(__name__)

class RawCrawlPayload(BaseModel):
    url: str
    source_id: int
    region: str
    schema_version: int = Field(default=1)

class PipelineEngine:
    def __init__(self, redis_url: str, db_url: str):
        self.redis = Redis.from_url(redis_url, decode_responses=True)
        self.merger = CanonicalMerger(db_url)
        self.scraper = AsyncScraper(max_concurrent=20)
        
    async def startup(self):
        await self.scraper.__aenter__()
        await self.merger.connect()
        
    async def shutdown(self):
        await self.scraper.__aexit__(None, None, None)
        await self.merger.close()
        await self.redis.close()

    def _parse_content(self, html: str) -> dict:
        company_match = re.search(r'<meta\s+property=["\']og:site_name["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
        title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
        location_match = re.search(r'(?i)(?:location|city):\s*([a-zA-Z,\s]+)', html)
        
        return {
            "company": company_match.group(1).strip() if company_match else "Unknown Company",
            "title": title_match.group(1).strip() if title_match else "Unknown Title",
            "location": location_match.group(1).strip() if location_match else "Remote"
        }

    async def process_ingestion_stream(self, payload: RawCrawlPayload) -> None:
        try:
            # 1. Fetch raw text
            raw_text = await self.scraper.fetch(payload.url)
            if not raw_text:
                return

            # 2. Generate string signature
            url_md5 = hashlib.md5(payload.url.encode('utf-8')).hexdigest()
            body_hash = hashlib.sha256(raw_text.encode('utf-8')).hexdigest()
            redis_key = f"hash:page:content:{url_md5}"

            # 3. Evaluate and store page fingerprint
            existing_hash = await self.redis.hget(redis_key, "body_hash")
            if existing_hash == body_hash:
                logger.info(f"Page unmodified, short-circuiting: {payload.url}")
                return
                
            # 4. Extract structural data
            parsed_data = self._parse_content(raw_text)
            
            # 5. Database upsert
            await self.merger.upsert_internship(
                source_id=payload.source_id,
                url=payload.url,
                company=parsed_data["company"],
                title=parsed_data["title"],
                location=parsed_data["location"]
            )
            
            # Update cache to indicate new hash processed (7-day TTL)
            await self.redis.hset(redis_key, mapping={
                "body_hash": body_hash,
                "last_checked_at": str(int(time.time()))
            })
            await self.redis.expire(redis_key, 604800) 

        except Exception as e:
            logger.error(f"Pipeline error processing {payload.url}: {e}")
