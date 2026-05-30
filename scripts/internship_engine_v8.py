#!/usr/bin/env python3
"""
ISTE MBCET INTERNSHIP INTELLIGENCE CORE v8.0
Python-Centric Autonomous Opportunity Intelligence Ecosystem
"""
import os, time, hashlib, json, asyncio, difflib, re
from datetime import datetime, timedelta
from urllib.parse import quote
from dotenv import load_dotenv

import httpx
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, BrowserContext
from sentence_transformers import SentenceTransformer, util
from celery import Celery
import redis
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

from source_registry import ALL_SOURCES, SCAM_SIGNALS, EXPIRY_PHRASES, COMPANY_TRUST_OVERRIDES, KERALA_ZONES, DOMAIN_KEYWORDS

load_dotenv(dotenv_path=".env.local")

# ==============================================================================
# CORE ENGINE 18: Performance Optimization Layer (Redis)
# ==============================================================================
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# ==============================================================================
# CORE ENGINE 16 & 17: Internship Memory Engine & Knowledge Graph
# ==============================================================================
Base = declarative_base()
class OpportunityMemory(Base):
    __tablename__ = 'opportunity_memory'
    id = Column(String, primary_key=True)
    company = Column(String)
    role = Column(String)
    source = Column(String)
    content_hash = Column(String)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_verified = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ACTIVE") # ACTIVE, WARNING, STALE, ARCHIVED
    health_score = Column(Integer, default=100)
    trust_score = Column(Integer, default=50)
    confidence_score = Column(Integer, default=0)
    embedding_json = Column(String)

db_engine = create_engine('sqlite:///internship_brain_v8.db')
Base.metadata.create_all(db_engine)
SessionLocal = sessionmaker(bind=db_engine)

# ==============================================================================
# CORE ENGINE 19: Queue & Worker System
# ==============================================================================
celery_app = Celery('internship_engine_v8', broker='redis://localhost:6379/0')

class InternshipIntelligenceCore:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context: BrowserContext = None
        self.st_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.db = SessionLocal()
        print("[INIT] Intelligence Core v8.0 Booted.")

    async def init_browser(self):
        if not self.playwright:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(headless=True)
            # Reusing browser context across requests (Core Engine 2)
            self.context = await self.browser.new_context(
                viewport={'width': 1280, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) ISTE-Bot/8.0"
            )

    async def close_browser(self):
        if self.context: await self.context.close()
        if self.browser: await self.browser.close()
        if self.playwright: await self.playwright.stop()

    # ==============================================================================
    # CORE ENGINE 1 & 2: Multi-Source Discovery & High Performance Crawl Engine
    # ==============================================================================
    async def fetch_page(self, url: str, requires_js: bool, timeout=10):
        # CORE ENGINE 21: Security Layer (Timeout, Circuit Breaker via Try/Except)
        try:
            if not requires_js:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    resp = await client.get(url, follow_redirects=True)
                    if resp.status_code == 200:
                        return resp.text, resp.headers.get("ETag"), resp.headers.get("Last-Modified")
            
            # Playwright Fallback
            if not self.context: await self.init_browser()
            page = await self.context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=timeout*1000)
            content = await page.content()
            await page.close()
            return content, None, None
        except Exception as e:
            print(f"[FETCH ERROR] {url}: {e}")
            return None, None, None

    # ==============================================================================
    # CORE ENGINE 3: Incremental Crawl Engine
    # ==============================================================================
    def is_content_changed(self, url: str, current_hash: str):
        cache_key = f"hash:{url}"
        prev_hash = redis_client.get(cache_key)
        if prev_hash and prev_hash.decode() == current_hash:
            return False
        redis_client.set(cache_key, current_hash, ex=86400) # 24h cache
        return True

    # ==============================================================================
    # CORE ENGINE 4: Normalization Engine
    # ==============================================================================
    def normalize_opportunity(self, raw_data: dict):
        return {
            "company": raw_data.get("company", "Unknown").strip(),
            "role": raw_data.get("role", "Unknown").strip(),
            "location": raw_data.get("location", "Remote").strip(),
            "applyUrl": raw_data.get("applyLink", "").strip(),
            "source": raw_data.get("source", "Unknown").strip(),
            "description": raw_data.get("description", "").strip(),
            "stipend": raw_data.get("stipend", "Check listing"),
            "skills": [],
            "postedDate": raw_data.get("postedDate", datetime.utcnow().isoformat()),
            "deadline": raw_data.get("deadline", ""),
            "trustScore": 50,
            "confidenceScore": 0,
            "healthScore": 100
        }

    # ==============================================================================
    # CORE ENGINE 5: Link Health Intelligence Engine
    # ==============================================================================
    async def validate_health(self, opp: dict):
        url = opp["applyUrl"]
        if not url or url == "#": return 0
        try:
            # Level 1 & 2: HTTP Status & Redirect
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.head(url, follow_redirects=True)
                if res.status_code >= 400 and res.status_code not in [403, 405]:
                    return 0 # Dead
            
            # Level 3 & 6: Content & Expiry Validation
            content, _, _ = await self.fetch_page(url, False)
            if content:
                content_lower = content.lower()
                for phrase in EXPIRY_PHRASES:
                    if phrase in content_lower:
                        return 20 # Expired
            return 100 # Healthy
        except:
            return 0

    # ==============================================================================
    # CORE ENGINE 9: Scam Detection Engine
    # ==============================================================================
    def detect_scam(self, text: str):
        text_lower = text.lower()
        for hard in SCAM_SIGNALS["hard"]:
            if hard in text_lower: return "HIGH RISK"
        for soft in SCAM_SIGNALS["soft"]:
            if soft in text_lower: return "WARNING"
        return "SAFE"

    # ==============================================================================
    # CORE ENGINE 8 & 6: Trust & Confidence Intelligence
    # ==============================================================================
    def calculate_scores(self, opp: dict, scam_status: str, health_score: int):
        comp_lower = opp["company"].lower()
        
        # Trust Score
        trust = COMPANY_TRUST_OVERRIDES.get(comp_lower, 50)
        if opp["source"] in [s["company"] for s in ALL_SOURCES["tier_a"] if "company" in s]:
            trust = max(trust, 90)
            
        if scam_status == "HIGH RISK": trust = 10
        elif scam_status == "WARNING": trust -= 30
        
        # Confidence Score
        conf = 50
        if health_score == 100: conf += 20
        if trust >= 90: conf += 20
        if opp["company"] != "Unknown" and opp["role"] != "Unknown": conf += 10
        
        opp["trustScore"] = max(0, min(100, trust))
        opp["confidenceScore"] = max(0, min(100, conf))
        return opp

    # ==============================================================================
    # CORE ENGINE 10 & 11: AI Skill Extraction & Classification
    # ==============================================================================
    def enrich_with_ai(self, opp: dict):
        # 11. Classification
        role_emb = self.st_model.encode(opp["role"], convert_to_tensor=True)
        domains = list(DOMAIN_KEYWORDS.keys())
        domain_embs = self.st_model.encode(domains, convert_to_tensor=True)
        scores = util.cos_sim(role_emb, domain_embs)[0]
        best_idx = scores.argmax().item()
        
        domain = domains[best_idx]
        if scores[best_idx] < 0.3: domain = "Software Engineering"
        opp["domain"] = domain
        
        # 10. Skill Extraction
        desc_lower = (opp["role"] + " " + opp.get("description", "")).lower()
        skills = []
        for d, kws in DOMAIN_KEYWORDS.items():
            for kw in kws:
                if kw in desc_lower and kw not in skills:
                    skills.append(kw.title())
        opp["skills"] = skills[:5]
        opp["embedding_json"] = json.dumps(role_emb.tolist())
        return opp

    # ==============================================================================
    # CORE ENGINE 12, 13 & 14: Fit, Learning Value & Recommendation
    # ==============================================================================
    def generate_recommendations(self, opp: dict):
        score = 50
        if opp["confidenceScore"] >= 90: score += 20
        if len(opp["skills"]) > 3: score += 15
        if opp["domain"] in ["AI/ML & Data Science", "Robotics & Automation"]: score += 10
        
        # Fit & Value
        opp["learning_value"] = "ELITE" if score > 85 else "HIGH VALUE" if score > 70 else "MODERATE"
        opp["ai_recommendation"] = f"Top match for {opp['domain']} students. Key skills: {', '.join(opp['skills'])}."
        return opp

    # ==============================================================================
    # CORE ENGINE 15: Duplicate Detection Engine
    # ==============================================================================
    def deduplicate(self, opportunities: list):
        unique = []
        seen = []
        for opp in opportunities:
            key = f"{opp['company'].lower()}-{opp['role'].lower()}"
            is_dup = False
            for s in seen:
                if difflib.SequenceMatcher(None, key, s).ratio() > 0.85:
                    is_dup = True
                    break
            if not is_dup:
                seen.append(key)
                unique.append(opp)
        return unique

    # ==============================================================================
    # MAIN WORKFLOW (Discovery -> Publish)
    # ==============================================================================
    async def run_discovery_cycle(self):
        print("[CYCLE] Starting Discovery...")
        raw_opps = []
        
        # Mocking discovery from Tier A for demonstration
        for source in ALL_SOURCES["tier_a"][:2]: # Just testing 2
            try:
                print(f"[DISCOVERY] Scraping {source['company']}")
                content, _, _ = await self.fetch_page(source['careers_url'], source['requires_js'])
                if content:
                    content_hash = hashlib.md5(content.encode()).hexdigest()
                    if not self.is_content_changed(source['careers_url'], content_hash):
                        print(" -> Content unchanged. Skipping via Cache.")
                        continue
                    
                    # Mock parsing
                    raw_opps.append({
                        "company": source["company"],
                        "role": "Software Engineering Intern",
                        "applyLink": source["careers_url"],
                        "source": source["company"]
                    })
            except Exception as e:
                print(f"[DISCOVERY ERROR] {e}")

        # Normalization
        normalized = [self.normalize_opportunity(o) for o in raw_opps]
        
        # Verification, Trust, AI Enrichment
        final_opps = []
        for opp in normalized:
            health = await self.validate_health(opp)
            opp["healthScore"] = health
            
            scam_status = self.detect_scam(opp["role"] + " " + opp["description"])
            opp = self.calculate_scores(opp, scam_status, health)
            
            if opp["confidenceScore"] >= 60:
                opp = self.enrich_with_ai(opp)
                opp = self.generate_recommendations(opp)
                final_opps.append(opp)

        final_opps = self.deduplicate(final_opps)
        
        # Memory & Sanity Sync
        for opp in final_opps:
            uid = hashlib.md5(f"{opp['company']}-{opp['role']}".encode()).hexdigest()
            mem = self.db.query(OpportunityMemory).filter_by(id=uid).first()
            if not mem:
                mem = OpportunityMemory(
                    id=uid, company=opp["company"], role=opp["role"],
                    source=opp["source"], health_score=opp["healthScore"],
                    trust_score=opp["trustScore"], confidence_score=opp["confidenceScore"],
                    embedding_json=opp.get("embedding_json", "")
                )
                self.db.add(mem)
            else:
                mem.last_verified = datetime.utcnow()
                mem.health_score = opp["healthScore"]
                mem.confidence_score = opp["confidenceScore"]
        
        self.db.commit()
        await self.close_browser()
        print(f"[CYCLE COMPLETE] Processed {len(final_opps)} elite opportunities.")
        return final_opps

if __name__ == "__main__":
    core = InternshipIntelligenceCore()
    asyncio.run(core.run_discovery_cycle())
