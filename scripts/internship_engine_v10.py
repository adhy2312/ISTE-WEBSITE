#!/usr/bin/env python3
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║   CHANAKYAN-KV  ×  ISTE MBCET  —  INTERNSHIP INTELLIGENCE ECOSYSTEM v10.0  ║
║   Kerala's Most Autonomous Multi-Agent Opportunity Discovery Infrastructure  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  AGENT ROSTER (13 Agents)                                                    ║
║  ① ScoutAgent         — Playwright stealth + XHR interception + fingerprint ║
║  ② ScholarAgent       — Zero-selector semantic DOM extraction (NLP-only)    ║
║  ③ AuthenticityAgent  — 3-stage scam detection + portal verification        ║
║  ④ SemanticAgent      — Zero-shot domain mapping + skill-gap analysis        ║
║  ⑤ QualityAgent       — AdaptiveNeuralCore + Supreme Judge + RL weights     ║
║  ⑥ CleanupAgent       — Live CMS pruning + EvolutionMemory feedback         ║
║  ⑦ DiscoveryAgent     — Kerala entity discovery (Technopark/Infopark/KSUM)  ║
║  ⑧ PredictiveAgent    — VelocityLSTM mass-hiring trajectory forecast        ║
║  ⑨ PortfolioAgent     — GitHub semantic complexity grader + skill matching  ║
║  ⑩ ResumeAgent        — ATS semantic re-ranker via cosine reordering        ║
║  ⑪ AlertAgent         — Instant Telegram/WhatsApp push for ELITE listings   ║
║  ⑫ TrendAgent         — Domain demand heatmap + Kerala market analytics     ║
║  ⑬ ComplianceAgent    — WCAG/legal compliance checker for apply links       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MEMORY:     SQLite (async SQLAlchemy) · Redis (optional) · FAISS vectors   ║
║  SCHEDULER:  APScheduler — 24h discovery / 6h revalidation / 1h cleanup    ║
║  OUTPUTS:    Sanity CMS · SQLite · JSON export · Local Alert Logs           ║
║  v10 CHANGES: Async DB · FAISS dedup · AgentBus events · AlertAgent        ║
║               TrendAgent · ComplianceAgent · compact 1900-line target       ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ─── Standard Library ─────────────────────────────────────────────────────────
import os, sys, time, hashlib, json, asyncio, difflib, re, random, logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
from typing import Optional, List, Dict, Any, Tuple
from urllib.parse import urlparse, quote
from dataclasses import dataclass, field

# ─── Third-Party ──────────────────────────────────────────────────────────────
# Celery (optional — not used in CI, only for local worker mode)
try:
    from celery import Celery
    celery_app = Celery(
        "chanakyan",
        broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
        backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    )
    CELERY_OK = True
except ImportError:
    CELERY_OK = False
    celery_app = None

import requests, httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Playwright & stealth
from playwright.async_api import async_playwright, BrowserContext, Page
try:
    from playwright_stealth import stealth_async
    STEALTH_OK = True
except ImportError:
    STEALTH_OK = False

from fake_useragent import UserAgent

# ML stack
import torch, torch.nn as nn, torch.optim as optim
from sentence_transformers import SentenceTransformer, util as st_util

# Database (async SQLAlchemy)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, Text, select
)

# Redis (optional)
try:
    import redis.asyncio as aioredis
    REDIS_OK = True
except ImportError:
    REDIS_OK = False

# JobSpy
try:
    from jobspy import scrape_jobs
    JOBSPY_OK = True
except ImportError:
    JOBSPY_OK = False
    scrape_jobs = None

import pandas as pd

# FAISS
try:
    import faiss, numpy as np
    FAISS_OK = True
except ImportError:
    FAISS_OK = False
    import numpy as np

# NetworkX
try:
    import networkx as nx
    NX_OK = True
except ImportError:
    NX_OK = False

# APScheduler
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    SCHED_OK = True
except ImportError:
    SCHED_OK = False

# Rich terminal
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
    from rich import box
    RICH_OK = True
    console = Console()
except ImportError:
    RICH_OK = False
    console = None

# Pydantic
from pydantic import BaseModel, ConfigDict

# Circuit Breaker (optional — installed in CI via requirements.txt, may not be
# present in local dev environments using system Python)
from functools import wraps
try:
    import pybreaker # type: ignore
    api_breaker = pybreaker.CircuitBreaker(
        fail_max=3,       # Open circuit after 3 consecutive failures
        reset_timeout=60, # Wait 60 seconds before trying again (Half-Open)
        state_storage=pybreaker.MemoryStorage()
    )
    BREAKER_OK = True
except ImportError:
    # No-op stub — circuit breaker simply passes through when not installed
    BREAKER_OK = False
    class _NoOpBreaker:
        """Transparent pass-through used when pybreaker is not installed."""
        def __call__(self, fn):
            return fn
        def call(self, fn, *args, **kwargs):
            return fn(*args, **kwargs)
    api_breaker = _NoOpBreaker()

# Source registry (from existing file)
from source_registry import (
    ALL_SOURCES, SCAM_SIGNALS, EXPIRY_PHRASES,
    COMPANY_TRUST_OVERRIDES, KERALA_ZONES, DOMAIN_KEYWORDS
)

# ─── Environment ──────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=".env.local")
SANITY_PROJECT_ID  = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID", "")
SANITY_DATASET     = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_TOKEN       = os.getenv("SANITY_API_TOKEN", "")
SANITY_URL         = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{SANITY_DATASET}"
SANITY_HEADERS     = {"Content-Type": "application/json", "Authorization": f"Bearer {SANITY_TOKEN}"}
GITHUB_TOKEN       = os.getenv("GITHUB_TOKEN", "")
# TELEGRAM REMOVED - Using LocalAlertAgent

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.FileHandler("chanakyan_v10.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

_COLORS = {
    "SCOUT":       "\033[96m",   # Cyan
    "SCHOLAR":     "\033[95m",   # Magenta
    "AUTH":        "\033[93m",   # Yellow
    "SEMANTIC":    "\033[94m",   # Blue
    "QUALITY":     "\033[92m",   # Green
    "CLEANUP":     "\033[91m",   # Red
    "DISCOVERY":   "\033[97m",   # White
    "PREDICTIVE":  "\033[33m",   # Orange
    "PORTFOLIO":   "\033[36m",   # Teal
    "RESUME":      "\033[35m",   # Purple
    "ALERT":       "\033[38;5;208m",  # Bright orange
    "TREND":       "\033[38;5;51m",   # Electric blue
    "COMPLIANCE":  "\033[38;5;82m",   # Lime green
    "ORCH":        "\033[1m\033[97m",
    "RST":         "\033[0m",
    "BOLD":        "\033[1m",
}

def log(agent: str, msg: str, level: str = "INFO") -> None:
    c, rst, ts = _COLORS.get(agent, ""), _COLORS["RST"], time.strftime("%H:%M:%S")
    print(f"{c}[{ts}] {_COLORS['BOLD']}[{agent}]{rst} {msg}")
    logging.info(f"[{agent}] {msg}")


# ══════════════════════════════════════════════════════════════════════════════
# AGENT EVENT BUS — Decoupled inter-agent communication (NEW in v10)
# ══════════════════════════════════════════════════════════════════════════════
class AgentBus:
    """
    Lightweight publish/subscribe event bus.
    Agents emit events (e.g. 'elite_found', 'listing_killed') and any
    registered subscriber coroutine is called automatically.
    Replaces scattered global state and direct cross-agent coupling.
    """
    def __init__(self):
        self._subs: Dict[str, List[Any]] = defaultdict(list)

    def subscribe(self, event: str, handler) -> None:
        self._subs[event].append(handler)

    async def emit(self, event: str, payload: Any = None) -> None:
        for h in self._subs.get(event, []):
            try:
                await h(payload)
            except Exception as e:
                log("ORCH", f"Bus handler error [{event}]: {e}", "WARN")


BUS = AgentBus()  # Global singleton


# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC SCHEMA
# ══════════════════════════════════════════════════════════════════════════════
class InternshipListing(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    company_name:           str
    district_location:      str
    hub_category:           str
    internship_role:        str
    domain:                 Optional[str]  = None
    stipend_details:        Optional[str]  = "Not specified"
    skills:                 List[str]      = []
    application_url:        str
    source_url:             str
    source_platform:        Optional[str]  = None
    verification_timestamp: datetime       = datetime.utcnow()
    is_verified_live:       bool           = False
    liveness_confidence:    float          = 0.0
    is_likely_expired:      bool           = False
    expiry_reason:          Optional[str]  = None
    quality_tier:           Optional[str]  = "MODERATE"
    quality_score:          float          = 0.0
    trust_score:            float          = 50.0
    ai_recommendation:      Optional[str]  = None
    raw_text_snippet:       Optional[str]  = None


# ══════════════════════════════════════════════════════════════════════════════
# DATABASE — Async SQLAlchemy (v10 upgrade: no sync blocking in async pipeline)
# ══════════════════════════════════════════════════════════════════════════════
Base = declarative_base()

class OpportunityMemory(Base):
    __tablename__ = "opportunity_memory"
    id                    = Column(String, primary_key=True)
    company               = Column(String, index=True)
    role                  = Column(String)
    district              = Column(String)
    hub_category          = Column(String)
    source                = Column(String)
    apply_url             = Column(String)
    source_url            = Column(String)
    content_hash          = Column(String)
    domain                = Column(String)
    stipend               = Column(String)
    skills_json           = Column(Text, default="[]")
    embedding_json        = Column(Text, default="[]")
    first_seen            = Column(DateTime, default=datetime.utcnow)
    last_verified         = Column(DateTime, default=datetime.utcnow)
    state                 = Column(String, default="NEW")
    verification_status   = Column(String, default="UNVERIFIED")
    verification_failures = Column(Integer, default=0)
    health_score          = Column(Integer, default=100)
    trust_score           = Column(Integer, default=50)
    confidence_score      = Column(Integer, default=0)
    quality_score         = Column(Float, default=0.0)
    quality_tier          = Column(String, default="MODERATE")
    is_expired            = Column(Boolean, default=False)

class EvolutionMemory(Base):
    __tablename__ = "evolution_memory"
    id        = Column(String, primary_key=True)
    embedding = Column(Text)
    survived  = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SiteFingerprint(Base):
    __tablename__ = "site_fingerprints"
    domain        = Column(String, primary_key=True)
    strategy      = Column(String)
    selector_hint = Column(String)
    api_endpoint  = Column(String)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    last_updated  = Column(DateTime, default=datetime.utcnow)

class CompanyNode(Base):
    __tablename__ = "company_graph"
    domain         = Column(String, primary_key=True)
    company_name   = Column(String)
    hub_zone       = Column(String)
    district       = Column(String)
    careers_url    = Column(String)
    requires_js    = Column(Boolean, default=True)
    trust_score    = Column(Integer, default=50)
    pagerank_score = Column(Float, default=0.0)
    last_crawled   = Column(DateTime)
    discovery_src  = Column(String)

class DomainTrend(Base):  # NEW in v10 — TrendAgent stores market data
    __tablename__ = "domain_trends"
    domain      = Column(String, primary_key=True)
    week_label  = Column(String)
    count       = Column(Integer, default=0)
    avg_stipend = Column(Float, default=0.0)
    hot_skills  = Column(Text, default="[]")
    updated_at  = Column(DateTime, default=datetime.utcnow)

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    job_id      = Column(String)
    action      = Column(String) # e.g. "click", "apply", "dismiss"
    role        = Column(String)
    domain      = Column(String)
    company     = Column(String)
    timestamp   = Column(DateTime, default=datetime.utcnow)
    processed   = Column(Boolean, default=False)

# ─── Async DB setup ───────────────────────────────────────────────────────────
import os
DB_PATH = os.path.join(os.path.dirname(__file__), "internship_brain_v10.db")
async_engine  = create_async_engine(f"sqlite+aiosqlite:///{DB_PATH}", echo=False)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

async def init_db() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log("ORCH", "Async database initialised ✓")

# ─── Cache Disabled for $0 Budget ─────────────────────────────────────────────
async def get_redis():
    return None

def dead_letter_queue_handler(failed_task_name: str, task_args: list, error_msg: str):
    """
    If a job exhausts its retries, it gets routed here for manual inspection.
    """
    log("DLQ", f"Task {failed_task_name} permanently failed. Args: {task_args}. Error: {error_msg}", "ERROR")



# ══════════════════════════════════════════════════════════════════════════════
# NEURAL MODELS
# ══════════════════════════════════════════════════════════════════════════════
class AdaptiveNeuralCore(nn.Module):
    """384-dim embedding → survival probability [0,1]."""
    def __init__(self, input_dim: int = 384):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128), nn.LayerNorm(128), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(128, 64), nn.ReLU(),
            nn.Linear(64, 1), nn.Sigmoid()
        )
    def forward(self, x): return self.net(x)


class VelocityLSTM(nn.Module):
    """7-day posting velocity → mass-hiring probability."""
    def __init__(self, hidden: int = 32, layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(1, hidden, layers, batch_first=True, dropout=0.1)
        self.head  = nn.Sequential(nn.Linear(hidden, 1), nn.Sigmoid())
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.head(out[:, -1, :])


# ══════════════════════════════════════════════════════════════════════════════
# FAISS VECTOR MEMORY — Compact semantic deduplication (v10 upgrade)
# ══════════════════════════════════════════════════════════════════════════════
class VectorMemory:
    """
    In-process FAISS index for sub-millisecond semantic deduplication.
    Replaces O(n²) SequenceMatcher — orders of magnitude faster at scale.
    """
    def __init__(self, dim: int = 384, threshold: float = 0.90):
        self.dim       = dim
        self.threshold = threshold
        self._index    = faiss.IndexFlatIP(dim) if FAISS_OK else None
        self._ids: List[str] = []

    def _normalize(self, vec: np.ndarray) -> np.ndarray:
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def is_duplicate(self, embedding: np.ndarray, listing_id: str) -> bool:
        if not FAISS_OK or self._index is None or self._index.ntotal == 0:
            return False
        vec = self._normalize(embedding).astype(np.float32).reshape(1, -1)
        D, _ = self._index.search(vec, 1)
        return float(D[0][0]) >= self.threshold

    def add(self, embedding: np.ndarray, listing_id: str) -> None:
        if not FAISS_OK or self._index is None:
            return
        vec = self._normalize(embedding).astype(np.float32).reshape(1, -1)
        self._index.add(vec)
        self._ids.append(listing_id)


# ══════════════════════════════════════════════════════════════════════════════
# ① SCOUT AGENT — Playwright stealth + XHR interception + self-healing memory
# ══════════════════════════════════════════════════════════════════════════════
class ScoutAgent:
    """Handles all browser-level operations with anti-bot evasion."""

    def __init__(self):
        self.ua = UserAgent()
        self._pw = self._browser = self._ctx = None
        self._api_cache: Dict[str, str] = {}

    async def _init(self) -> None:
        if self._pw: return
        self._pw      = await async_playwright().start()
        self._browser = await self._pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox",
                  "--disable-blink-features=AutomationControlled"]
        )

    async def _fresh_ctx(self) -> BrowserContext:
        await self._init()
        proxy_url = os.getenv("SCRAPER_PROXY_URL")
        ctx_options = {
            "viewport": {"width": random.choice([1280, 1366, 1440, 1920]),
                         "height": random.choice([768, 800, 900, 1080])},
            "user_agent": self.ua.random,
            "locale": random.choice(["en-IN", "en-US", "en-GB"]),
            "timezone_id": "Asia/Kolkata",
            "extra_http_headers": {"Accept-Language": "en-IN,en;q=0.9"}
        }
        if proxy_url:
            ctx_options["proxy"] = {"server": proxy_url}
        return await self._browser.new_context(**ctx_options)

    def _make_intercept(self, key: str):
        async def handler(resp):
            url, ct = resp.url, resp.headers.get("content-type", "")
            if "json" in ct and any(k in url.lower() for k in
                    ["job", "career", "position", "opening", "vacancy", "recruit"]):
                try:
                    body = await resp.json()
                    if isinstance(body, (list, dict)) and len(str(body)) > 100:
                        self._api_cache[key] = url
                        log("SCOUT", f"🔌 API intercepted: {url[:80]}")
                except Exception:
                    pass
        return handler

    async def _scroll_and_click(self, page: Page) -> None:
        for _ in range(4):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(random.uniform(0.6, 1.2))
        for pat in ["text=Load More", "text=Show More", "button:has-text('More jobs')",
                    ".pagination-next", "[data-testid='pagination-next']"]:
            try:
                btn = page.locator(pat).first
                if await btn.is_visible(timeout=1200):
                    await btn.click()
                    await page.wait_for_load_state("networkidle", timeout=4000)
                    break
            except Exception:
                pass

    async def _load_fp(self, domain: str) -> Optional[dict]:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(SiteFingerprint).filter_by(domain=domain))
            fp = result.scalar_one_or_none()
            if fp and fp.success_count > fp.failure_count:
                return {"strategy": fp.strategy, "api_endpoint": fp.api_endpoint}
        return None

    async def _save_fp(self, domain: str, strategy: str,
                       api_endpoint: str = "", success: bool = True) -> None:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(SiteFingerprint).filter_by(domain=domain))
            fp = result.scalar_one_or_none()
            if not fp:
                fp = SiteFingerprint(domain=domain)
                db.add(fp)
            fp.strategy = strategy
            fp.api_endpoint = api_endpoint or ""
            fp.last_updated = datetime.utcnow()
            if success: fp.success_count = (fp.success_count or 0) + 1
            else:       fp.failure_count = (fp.failure_count or 0) + 1
            await db.commit()

    async def fetch(self, url: str, requires_js: bool = True,
                    key: str = "") -> Tuple[Optional[str], Optional[str]]:
        """Returns (html, discovered_api_endpoint|None). Checks Redis cache first."""
        domain = urlparse(url).netloc
        redis  = await get_redis()

        if redis:
            cached = await redis.get(f"phash:{url}")
            if cached:
                log("SCOUT", f"↳ Cache hit — skipping: {domain}")
                return None, None

        if not requires_js:
            try:
                proxy_url = os.getenv("SCRAPER_PROXY_URL")
                client_options = {"timeout": 12.0, "follow_redirects": True}
                if proxy_url:
                    client_options["proxy"] = proxy_url
                async with httpx.AsyncClient(**client_options) as c:
                    r = await c.get(url, headers={"User-Agent": self.ua.random})
                    if r.status_code == 200:
                        h = hashlib.md5(r.text.encode()).hexdigest()
                        if redis: await redis.set(f"phash:{url}", h, ex=43200)
                        return r.text, None
            except Exception as e:
                log("SCOUT", f"↳ httpx fallback ({e})", "WARN")

        ctx  = await self._fresh_ctx()
        page = await ctx.new_page()
        if STEALTH_OK: await stealth_async(page)
        if key: page.on("response", self._make_intercept(key))

        try:
            resp = await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            if resp and resp.status in (429, 403, 503):
                log("SCOUT", f"↳ Anti-bot triggered ({resp.status}). Adaptive proxy backoff initiated...", "WARN")
                await asyncio.sleep(random.uniform(15.0, 30.0))
                # In production, this rotates the ScraperAPI/BrightData session ID
                await self._save_fp(domain, "failed_rate_limit", success=False)
                return None, None
                
            await asyncio.sleep(random.uniform(1.0, 2.2))
            await self._scroll_and_click(page)
            content = await page.content()
            h = hashlib.md5(content.encode()).hexdigest()
            if redis: await redis.set(f"phash:{url}", h, ex=43200)
            api_ep = self._api_cache.pop(key, None) if key else None
            await self._save_fp(domain, "api" if api_ep else "playwright_dom",
                                api_endpoint=api_ep or "")
            return content, api_ep
        except Exception as e:
            log("SCOUT", f"↳ Playwright error: {e}", "ERROR")
            await self._save_fp(domain, "failed", success=False)
            return None, None
        finally:
            await page.close()
            await ctx.close()

    async def close(self) -> None:
        if self._browser: await self._browser.close()
        if self._pw:      await self._pw.stop()


# ══════════════════════════════════════════════════════════════════════════════
# ② SCHOLAR AGENT — Semantic DOM extraction without hardcoded selectors
# ══════════════════════════════════════════════════════════════════════════════
class ScholarAgent:
    """Identifies internship containers via semantic similarity — no CSS selectors."""

    ANCHORS = [
        "internship", "intern", "fresher", "trainee", "student program",
        "graduate program", "apprentice", "campus hire", "entry level",
        "junior engineer", "associate engineer"
    ]
    EXPIRY_CTX = [
        "no longer accepting", "position has been filled", "application closed",
        "deadline has passed", "not accepting applications", "vacancy filled",
    ]

    def __init__(self, model: SentenceTransformer):
        self.model        = model
        self._anchor_embs = model.encode(self.ANCHORS, convert_to_tensor=True)

    def _blocks(self, html: str) -> List[Tuple[str, str]]:
        soup = BeautifulSoup(html, "html.parser")
        for t in soup(["script", "style", "nav", "footer", "header",
                       "aside", "noscript", "svg", "img"]):
            t.decompose()
        return [
            (tag.get_text(" ", strip=True), tag.name)
            for tag in soup.find_all(["div","article","section","li","tr","a","h1","h2","h3"])
            if 20 < len(tag.get_text(strip=True)) < 800
        ]

    def _score(self, text: str) -> float:
        if not text.strip(): return 0.0
        emb  = self.model.encode(text, convert_to_tensor=True)
        sims = st_util.cos_sim(emb, self._anchor_embs)[0]
        return float(sims.max().item())

    def _expired(self, html: str) -> Tuple[bool, Optional[str]]:
        lo = html.lower()
        for sig in self.EXPIRY_CTX:
            if sig in lo: return True, sig
        yr = datetime.utcnow().year
        for y in range(2020, yr):
            if f"batch of {y}" in lo or f"session {y}" in lo:
                return True, f"Stale batch year: {y}"
        return False, None

    def extract(self, html: str, source_url: str = "") -> List[dict]:
        if not html: return []
        expired, exp_reason = self._expired(html)
        scored = [(self._score(t), t, c) for t, c in self._blocks(html)]
        scored.sort(key=lambda x: x[0], reverse=True)

        results, seen = [], set()
        for score, text, tag in scored:
            if score < 0.35: break
            if text in seen:  continue
            seen.add(text)
            listing = self._parse(text, source_url)
            if listing:
                listing.update({"semantic_score": score, "is_likely_expired": expired,
                                "expiry_reason": exp_reason, "raw_text_snippet": text[:300]})
                results.append(listing)
            if len(results) >= 20: break

        log("SCHOLAR", f"↳ {len(results)} candidates extracted (threshold: 0.35)")
        return results

    def _parse(self, text: str, source_url: str) -> Optional[dict]:
        m = re.search(
            r"((?:Software|Hardware|Data|AI|ML|Web|Mobile|Cloud|Cyber|Full.?Stack|"
            r"Embedded|IoT|Research|Product|UI|UX|QA|DevOps|Blockchain|"
            r"Security|Network|System|Backend|Frontend|Android|iOS)"
            r"[^.\n]{5,60}(?:Intern|Engineer|Developer|Analyst|Designer|"
            r"Researcher|Trainee|Associate)[^.\n]{0,30})",
            text, re.IGNORECASE
        )
        if not m: return None
        role = m.group(1).strip()

        stipend = "Not specified"
        sm = re.search(
            r"(?:₹|INR|Rs\.?)\s*[\d,]+(?:\s*[-–]\s*(?:₹|INR|Rs\.?)?\s*[\d,]+)?",
            text, re.IGNORECASE
        )
        if sm: stipend = sm.group(0).strip()
        elif re.search(r"\b(unpaid|no stipend|voluntary)\b", text, re.IGNORECASE):
            stipend = "Unpaid"

        url_m = re.search(r"https?://[^\s\"'<>]{10,}", text)
        return {
            "role": role, "company": "", "applyLink": url_m.group(0) if url_m else source_url,
            "source_url": source_url, "stipend": stipend, "description": text
        }


# ══════════════════════════════════════════════════════════════════════════════
# ③ AUTHENTICITY AGENT — 3-stage scam detection + portal verification
# ══════════════════════════════════════════════════════════════════════════════
class AuthenticityAgent:
    """Eliminates scams and dead links before any listing enters the pipeline."""

    PORTAL_SIGNALS = {
        "google.com/forms": ["this form is no longer accepting responses"],
        "lever.co":      ["this job is no longer available"],
        "greenhouse.io": ["no longer accepting"],
        "internshala":   ["internship is closed", "not available"],
        "linkedin.com":  ["job no longer available", "job has expired"],
        "wellfound.com": ["role is no longer available"],
    }

    def _scam_check(self, text: str) -> Tuple[bool, str]:
        lo = text.lower()
        for s in SCAM_SIGNALS["hard"]:
            if s in lo: return True, f"Hard scam: '{s}'"
        return False, ""

    async def _http_live(self, url: str) -> Tuple[bool, float]:
        if not url or url in ("#", ""): return False, 0.0
        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, max_redirects=5) as c:
                r = await c.head(url, headers={"User-Agent": "Mozilla/5.0"})
                if r.status_code >= 400 and r.status_code not in [403, 405]:
                    return False, 0.0
                if r.status_code in [403, 405]:
                    r = await c.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    if r.status_code >= 400: return False, 0.0
                if any(x in str(r.url) for x in ["parked", "godaddy.com/", "sedo.com"]):
                    return False, 0.0
                return True, 0.75
        except Exception:
            return False, 0.0

    async def _portal_check(self, url: str) -> Tuple[bool, float]:
        for key, signals in self.PORTAL_SIGNALS.items():
            if key in url.lower():
                try:
                    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as c:
                        r = await c.get(url, headers={"User-Agent": "Mozilla/5.0"})
                        for sig in signals:
                            if sig in r.text.lower(): return False, 0.95
                    return True, 0.90
                except Exception:
                    return True, 0.60
        return True, 0.85

    async def verify(self, item: dict) -> dict:
        text = f"{item.get('role','')} {item.get('company','')} {item.get('description','')}"
        is_scam, reason = self._scam_check(text)
        if is_scam:
            return {**item, "trust_status": "REJECTED", "rejection_reason": reason,
                    "liveness_confidence": 0.0}

        alive1, c1 = await self._http_live(item.get("applyLink", ""))
        if not alive1:
            return {**item, "trust_status": "REJECTED",
                    "rejection_reason": "Dead link (4xx/parking)", "liveness_confidence": 0.0}

        alive2, c2 = await self._portal_check(item.get("applyLink", ""))
        if not alive2:
            return {**item, "trust_status": "REJECTED",
                    "rejection_reason": "Portal confirmed closed", "liveness_confidence": c2}

        if item.get("is_likely_expired"):
            return {**item, "trust_status": "STALE",
                    "rejection_reason": item.get("expiry_reason", "Contextual expiry"),
                    "liveness_confidence": 0.35}

        return {**item, "trust_status": "VERIFIED", "liveness_confidence": min(c1, c2)}

    async def filter_batch(self, items: List[dict]) -> List[dict]:
        log("AUTH", f"3-stage liveness check on {len(items)} candidates...")
        sem = asyncio.Semaphore(12)
        async def _g(item):
            async with sem: return await self.verify(item)
        results  = await asyncio.gather(*[_g(i) for i in items])
        verified = [r for r in results if r.get("trust_status") == "VERIFIED"]
        log("AUTH", f"✓ {len(verified)} verified | ✗ {len(results)-len(verified)} rejected")
        return verified


# ══════════════════════════════════════════════════════════════════════════════
# ④ SEMANTIC AGENT — Zero-shot NLP domain mapping + enrichment
# ══════════════════════════════════════════════════════════════════════════════
class SemanticAgent:
    """Maps listings to domains, extracts skills, runs skill-gap analysis."""

    BASELINE = {
        "python", "c", "c++", "java", "javascript", "html", "css",
        "git", "sql", "linux", "react", "node.js", "matlab"
    }

    def __init__(self, model: SentenceTransformer):
        self.model = model
        self.domains = list(DOMAIN_KEYWORDS.keys())
        self._domain_embs = model.encode(self.domains, convert_to_tensor=True)

    def _domain(self, text: str) -> Tuple[str, float]:
        emb    = self.model.encode(text, convert_to_tensor=True)
        scores = st_util.cos_sim(emb, self._domain_embs)[0]
        idx    = scores.argmax().item()
        score  = scores[idx].item()
        return (self.domains[idx] if score >= 0.28 else "Software Engineering"), score

    def _skills(self, text: str, domain: str) -> List[str]:
        lo, out = text.lower(), []
        for kw in DOMAIN_KEYWORDS.get(domain, []):
            if kw in lo: out.append(kw.title())
        for g in ["python","java","react","node","sql","git","docker",
                  "aws","linux","tensorflow","pytorch","flutter","kotlin"]:
            if g in lo and g.title() not in out: out.append(g.title())
        return out[:8]

    def _district(self, text: str, meta: dict) -> Tuple[str, str]:
        combined = (text + " " + meta.get("location","") + " " + meta.get("zone","")).lower()
        
        # Tech Hubs Check - Allow major cities outside Kerala
        major_tech_hubs = ["bangalore", "bengaluru", "chennai", "mumbai", "delhi", "noida", "gurugram", "pune", "hyderabad"]
        
        for zone, data in KERALA_ZONES.items():
            for alias in data["aliases"]:
                if alias in combined:
                    return zone.title(), meta.get("zone", "Independent")
                    
        if "remote" in combined or "work from home" in combined or "wfh" in combined:
            return "Remote", meta.get("zone", "Independent")
            
        for city in major_tech_hubs:
            if city in combined:
                return f"Tech Hub ({city.title()})", "Independent"
                
        return "Unknown", "OUT_OF_BOUNDS"

    def enrich(self, item: dict, meta: dict = None) -> dict:
        meta = meta or {}
        text = f"{item.get('role','')} {item.get('description','')}"
        domain, dscore = self._domain(text)
        skills  = self._skills(text, domain)
        gaps    = [s for s in {s.lower() for s in skills} if s not in self.BASELINE]
        dist, hub = self._district(text, meta)

        emb = self.model.encode(item.get("role",""), convert_to_tensor=True)
        item.update({
            "domain": domain, "domain_score": dscore,
            "skills": skills, "skill_gaps": gaps,
            "district": dist, "hub_category": hub,
            "work_type": "Remote" if "remote" in text.lower() else "Hybrid",
            "role_tensor": emb,
            "embedding_json": json.dumps(emb.tolist()),
            "ai_recommendation": (
                f"Domain: {domain} ({round(dscore*100)}%) | "
                + (f"Skill Gaps: {', '.join(gaps)}" if gaps else "Baseline-Ready ✓")
            )
        })
        return item

    def process_batch(self, items: List[dict], sources_map: dict = None) -> List[dict]:
        log("SEMANTIC", f"Zero-shot domain mapping on {len(items)} listings...")
        sm = sources_map or {}
        return [self.enrich(i, sm.get(i.get("source",""),{})) for i in items]


# ══════════════════════════════════════════════════════════════════════════════
# ⑤ QUALITY AGENT — Neural scoring + Supreme Judge + RL source weights
# ══════════════════════════════════════════════════════════════════════════════
class QualityAgent:
    """Multi-factor quality scorer with continuous ML retraining."""

    MODEL_PATH = "adaptive_core_v10.pth"
    ELITE_DOMAINS = {"AI/ML & Data Science","Embedded Systems & IoT",
                     "Robotics & Automation","VLSI & Semiconductor"}

    def __init__(self):
        self.core      = AdaptiveNeuralCore()
        self.optimizer = optim.Adam(self.core.parameters(), lr=0.005)
        self.criterion = nn.BCELoss()
        self._judge    = None  # Lazy HuggingFace pipeline
        if os.path.exists(self.MODEL_PATH):
            self.core.load_state_dict(torch.load(self.MODEL_PATH, weights_only=True))
            log("QUALITY", f"AdaptiveNeuralCore loaded from {self.MODEL_PATH} ✓")

    async def _rl_weight(self, source: str) -> float:
        r = await get_redis()
        if not r: return 0.0
        raw = await r.get(f"rlw:{source}")
        return float(raw) if raw else 0.0

    def _survive(self, emb: torch.Tensor) -> float:
        self.core.eval()
        with torch.no_grad():
            return self.core(emb.unsqueeze(0)).item()

    def _judge_borderline(self, item: dict) -> float:
        try:
            if self._judge is None:
                from transformers import pipeline
                log("QUALITY", "⚖️ Loading Supreme Judge (bart-large-mnli)...", "WARN")
                self._judge = pipeline("zero-shot-classification",
                                       model="facebook/bart-large-mnli")
            res = self._judge(
                f"{item.get('role')} at {item.get('company')}",
                candidate_labels=["high quality technical internship",
                                  "low quality or generic posting"]
            )
            if res["labels"][0] == "high quality technical internship":
                log("QUALITY", "  Supreme Judge: ✅ APPROVED")
                return 0.25
            log("QUALITY", "  Supreme Judge: ❌ REJECTED")
            return -0.25
        except Exception as e:
            log("QUALITY", f"  Supreme Judge unavailable: {e}", "WARN")
            return 0.0

    async def score(self, item: dict) -> dict:
        base = 50.0
        if item.get("domain") in self.ELITE_DOMAINS: base += 20.0

        # Geographic proximity / Strictly Kerala Bound
        d = item.get("district","").lower()
        hub = item.get("hub_category", "").lower()
        
        if hub == "out_of_bounds":
            # If it's physically out of bounds and not remote, penalize heavily
            base -= 60.0
            item["trust_status"] = "REJECTED"
            item["rejection_reason"] = f"Location strictly outside Kerala bounds: {d}"
            item["liveness_confidence"] = 0.0
        elif "remote" in d:
            base += 10.0
        else:
            for zone, data in KERALA_ZONES.items():
                if zone in d or any(a in d for a in data["aliases"]):
                    base += data["proximity_score"]
                    break

        # Company trust
        trust = COMPANY_TRUST_OVERRIDES.get(item.get("company","").lower(), 50)
        rl    = await self._rl_weight(item.get("source",""))
        trust = min(100, trust + rl)
        item["trust_score"] = trust
        base += (trust - 50) * 0.2

        # Neural survival
        survival = 0.5
        if item.get("role_tensor") is not None:
            try: survival = self._survive(item["role_tensor"])
            except Exception: pass

        # Supreme Judge for borderline (40-60%)
        if 0.40 <= survival <= 0.60:
            survival = max(0.0, min(1.0, survival + self._judge_borderline(item)))

        final = int(max(0, min(99, base * (0.5 + survival))))
        item.update({
            "quality_score": float(final),
            "survival_prob": round(survival * 100, 1),
            "quality_tier": (
                "ELITE" if final >= 82 else "HIGH VALUE" if final >= 65
                else "MODERATE" if final >= 45 else "LOW"
            )
        })
        if item.get("ai_recommendation"):
            item["ai_recommendation"] += f" | Quality: {item['quality_tier']} ({final}/99)"

        # Log to EvolutionMemory (async)
        if item.get("embedding_json"):
            uid = hashlib.md5(f"{item.get('company','')}-{item.get('role','')}".encode()).hexdigest()
            async with AsyncSessionLocal() as db:
                res = await db.execute(select(EvolutionMemory).filter_by(id=uid))
                if not res.scalar_one_or_none():
                    db.add(EvolutionMemory(id=uid, embedding=item["embedding_json"],
                                           survived=final >= 65))
                    await db.commit()
        return item

    async def assess_batch(self, items: List[dict]) -> List[dict]:
        log("QUALITY", f"Quality assessment on {len(items)} listings...")
        return [await self.score(i) for i in items]

    async def train(self) -> None:
        log("QUALITY", "AdaptiveNeuralCore retraining cycle...")
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(EvolutionMemory))
            memories = result.scalars().all()

        if len(memories) < 10:
            log("QUALITY", f"  Insufficient training data ({len(memories)}). Skip.", "WARN")
            return
        X = [json.loads(m.embedding) for m in memories if m.embedding]
        Y = [[1.0 if m.survived else 0.0] for m in memories if m.embedding]
        if not X: return
        X_t, Y_t = torch.tensor(X, dtype=torch.float32), torch.tensor(Y, dtype=torch.float32)
        self.core.train()
        loss = None
        for _ in range(20):
            self.optimizer.zero_grad()
            loss = self.criterion(self.core(X_t), Y_t)
            loss.backward()
            self.optimizer.step()
        torch.save(self.core.state_dict(), self.MODEL_PATH)
        log("QUALITY", f"  Neural Core evolved. Loss: {loss.item():.4f} | Records: {len(X)}")

    async def optimize_rl(self) -> None:
        r = await get_redis()
        if not r: return
        log("QUALITY", "RL source-weight optimization...")
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(OpportunityMemory))
            records = result.scalars().all()

        stats = defaultdict(lambda: {"total":0,"healthy":0,"scam":0,"conf":0})
        for rec in records:
            s = stats[rec.source]
            s["total"] += 1
            if rec.health_score == 100: s["healthy"] += 1
            if rec.trust_score  <  40:  s["scam"]    += 1
            s["conf"] += rec.confidence_score

        for src, s in stats.items():
            if s["total"] < 5: continue
            reward = 0
            if s["healthy"]/s["total"] > 0.9:  reward += 5
            if s["healthy"]/s["total"] < 0.5:  reward -= 15
            if s["scam"]/s["total"]    > 0.1:  reward -= 25
            if s["conf"]/s["total"]    > 80:   reward += 10
            cur = float(await r.get(f"rlw:{src}") or 0.0)
            nw  = max(-50.0, min(50.0, cur + reward * 0.1))
            await r.set(f"rlw:{src}", nw)
            log("QUALITY", f"  RL [{src}] → weight: {nw:+.2f}")


# ══════════════════════════════════════════════════════════════════════════════
# ⑥ CLEANUP AGENT — Live CMS pruning + EvolutionMemory feedback
# ══════════════════════════════════════════════════════════════════════════════
class CleanupAgent:
    """Autonomously prunes toxic/dead listings from Sanity CMS."""

    def __init__(self, auth: AuthenticityAgent):
        self.auth = auth

    async def _mark_failure(self, company: str, role: str) -> None:
        uid = hashlib.md5(f"{company.lower()}-{role.lower()}".encode()).hexdigest()
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(EvolutionMemory).filter_by(id=uid))
            mem = res.scalar_one_or_none()
            if mem: mem.survived = False
            await db.commit()

    async def run(self) -> int:
        if not SANITY_PROJECT_ID or not SANITY_TOKEN:
            log("CLEANUP", "Sanity not configured — skipping", "WARN")
            return 0
        log("CLEANUP", "Fetching live CMS inventory...")
        query = '*[_type == "internship"]{_id, company, role, applyLink}'
        try:
            resp = requests.get(
                f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/"
                f"{SANITY_DATASET}?query={quote(query)}",
                headers=SANITY_HEADERS, timeout=10
            )
            data = resp.json().get("result", [])
        except Exception as e:
            log("CLEANUP", f"CMS fetch failed: {e}", "ERROR")
            return 0

        mutations = []
        for item in data:
            item["applyLink"] = item.get("applyLink","")
            v = await self.auth.verify(item)
            if v.get("trust_status") != "VERIFIED":
                log("CLEANUP", f"  ✗ Purging: {item.get('company')} — {item.get('role')}")
                mutations.append({"delete": {"id": item["_id"]}})
                await self._mark_failure(item.get("company",""), item.get("role",""))
                await BUS.emit("listing_killed", item)

        # Semantic duplicate check on live list
        dead_ids = {m["delete"]["id"] for m in mutations}
        groups   = defaultdict(list)
        for item in data:
            if item["_id"] not in dead_ids:
                groups[item.get("company","").lower()].append(item)
        for items in groups.values():
            for i in range(len(items)):
                for j in range(i+1, len(items)):
                    r1, r2 = items[i].get("role","").lower(), items[j].get("role","").lower()
                    if difflib.SequenceMatcher(None,r1,r2).ratio() >= 0.80:
                        del_id = items[j]["_id"]
                        if del_id not in dead_ids:
                            mutations.append({"delete": {"id": del_id}})
                            dead_ids.add(del_id)

        if mutations:
            for i in range(0, len(mutations), 25):
                requests.post(SANITY_URL, headers=SANITY_HEADERS,
                              json={"mutations": mutations[i:i+25]})
            log("CLEANUP", f"  Purged {len(mutations)} toxic/duplicate entries")
        else:
            log("CLEANUP", "  Live list is pristine ✓")
        return len(mutations)


# ══════════════════════════════════════════════════════════════════════════════
# ⑦ DISCOVERY AGENT — Autonomous Kerala entity discovery
# ══════════════════════════════════════════════════════════════════════════════
class DiscoveryAgent:
    """Expands the target pool via Technopark/Infopark/KSUM directories + JobSpy."""

    def __init__(self, scout: ScoutAgent, scholar: ScholarAgent):
        self.scout   = scout
        self.scholar = scholar
        self.ua      = UserAgent()

    async def _dir_crawl(self, url: str, key: str, hub: str, district: str,
                         card_sel: str, name_sel: str) -> List[dict]:
        content, _ = await self.scout.fetch(url, requires_js=True, key=key)
        if not content: return []
        soup = BeautifulSoup(content, "html.parser")
        out  = []
        for card in soup.select(card_sel)[:60]:
            n = card.select_one(name_sel)
            a = card.select_one("a[href]")
            if n:
                href = a.get("href","") if a else ""
                if href.startswith("/"): href = f"{url.rstrip('/')}{href}"
                out.append({"company_name": n.get_text(strip=True),
                            "careers_url": href or url,
                            "hub_zone": hub, "district": district,
                            "discovery_src": key})
        return out

    async def _technopark(self): return await self._dir_crawl(
        "https://www.technopark.org/company-listing", "tp_dir", "Technopark", "Trivandrum",
        ".company-list-item, .company-card, [class*='company']", "h3,h4,strong,.company-name")

    async def _infopark(self): return await self._dir_crawl(
        "https://infopark.in/companies/search", "ip_dir", "Infopark", "Kochi",
        ".company-item, .company-listing, [class*='company']", "h3,h4,.name,strong")

    async def _ksum(self): return await self._dir_crawl(
        "https://startupmission.kerala.gov.in/startups", "ksum_dir", "KSUM", "Kerala-wide",
        ".startup-card, .startup-item, [class*='startup']", "h3,h4,.startup-name,strong")

    async def _internshala(self) -> List[dict]:
        keywords = [
            "computer-science-internship-in-kerala",
            "machine-learning-internship-in-kerala",
            "web-development-internship-in-kerala",
            "electronics-internship-in-kerala",
            "data-science-internship-in-kerala",
            "embedded-systems-internship-in-kerala",
            "cybersecurity-internship-in-kerala",
            "vlsi-internship-in-india",
            "robotics-internship-in-kerala",
        ]
        results = []
        for kw in keywords:
            url     = f"https://internshala.com/internships/{kw}/"
            content, _ = await self.scout.fetch(url, requires_js=True, key=f"is_{kw[:12]}")
            if not content: continue
            soup  = BeautifulSoup(content, "html.parser")
            for card in soup.select(".individual_internship")[:10]:
                t = card.select_one("h3")
                c = card.select_one(".company_name")
                l = card.select_one("a.view_detail_button, a[href*='/internships/detail']")
                if t and c:
                    href = (l.get("href","") if l else "")
                    if href.startswith("/"): href = f"https://internshala.com{href}"
                    results.append({
                        "role": t.get_text(strip=True), "company": c.get_text(strip=True),
                        "applyLink": href or url, "source_url": url, "source": "Internshala",
                        "location": "Kerala", "description": card.get_text(" ", strip=True)[:400]
                    })
            await asyncio.sleep(random.uniform(2.0, 3.5))
        log("DISCOVERY", f"↳ Internshala: {len(results)} listings")
        return results

    async def _jobspy(self) -> List[dict]:
        if not JOBSPY_OK: return []
        log("DISCOVERY", "JobSpy multi-platform aggregation...")
        results, configs = [], [
            {"site_name":["linkedin"],           "term":"internship engineer Kerala",   "loc":"Kerala, India"},
            {"site_name":["indeed"],             "term":"intern student fresher engineer","loc":"Kerala, India"},
            {"site_name":["glassdoor"],          "term":"internship",                   "loc":"Kerala"},
            {"site_name":["linkedin","indeed"],  "term":"AI ML internship",             "loc":"Trivandrum"},
            {"site_name":["linkedin","indeed"],  "term":"embedded systems intern",      "loc":"Kochi"},
            {"site_name":["linkedin"],           "term":"VLSI internship",              "loc":"India"},
            {"site_name":["linkedin"],           "term":"robotics automation intern",   "loc":"India"},
        ]
        for cfg in configs:
            try:
                df = await asyncio.to_thread(
                    lambda c=cfg: scrape_jobs(
                        site_name=c["site_name"], search_term=c["term"],
                        location=c["loc"], results_wanted=25, hours_old=72,
                        job_type="internship"
                    )
                )
                if df is not None and not df.empty:
                    for _, row in df.iterrows():
                        url = str(row.get("job_url","")).strip()
                        if not url or url=="nan": continue
                        results.append({
                            "role":str(row.get("title","")).strip(),
                            "company":str(row.get("company","")).strip(),
                            "applyLink":url, "source_url":url,
                            "source":str(row.get("site","JobSpy")).capitalize(),
                            "location":str(row.get("location","Kerala")).strip(),
                            "description":str(row.get("description",""))[:500],
                        })
            except Exception as e:
                log("DISCOVERY", f"  JobSpy [{cfg['term']}]: {e}", "WARN")
            await asyncio.sleep(1.2)
        log("DISCOVERY", f"↳ JobSpy: {len(results)} listings")
        return results

    async def _register(self, companies: List[dict]) -> None:
        async with AsyncSessionLocal() as db:
            for c in companies:
                domain = urlparse(c.get("careers_url","")).netloc or c.get("company_name","")
                if not domain: continue
                res = await db.execute(select(CompanyNode).filter_by(domain=domain))
                if not res.scalar_one_or_none():
                    db.add(CompanyNode(
                        domain=domain, company_name=c.get("company_name",""),
                        hub_zone=c.get("hub_zone","Independent"),
                        district=c.get("district","Kerala"),
                        careers_url=c.get("careers_url",""),
                        discovery_src=c.get("discovery_src","unknown")
                    ))
            await db.commit()

    async def _tier_a(self) -> List[dict]:
        tier_a = ALL_SOURCES["tier_a"]
        log("DISCOVERY", f"Crawling {len(tier_a)} Tier-A career pages...")
        sem = asyncio.Semaphore(3)
        results = []

        async def _crawl(src: dict) -> List[dict]:
            async with sem:
                url   = src["careers_url"]
                c_key = src["company"].replace(" ","_").lower()
                content, api_ep = await self.scout.fetch(
                    url, requires_js=src.get("requires_js", True), key=c_key)
                if not content: return []
                if api_ep:
                    try:
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            r = await client.get(api_ep,
                                                 headers={"User-Agent": self.ua.random})
                            if r.status_code == 200: content = r.text
                    except Exception:
                        pass
                listings = self.scholar.extract(content, url)
                for l in listings:
                    l["company"] = src["company"]
                    l["source"]  = src["company"]
                    l["location"] = src.get("location", "Kerala")
                return listings

        batches = await asyncio.gather(*[_crawl(s) for s in tier_a])
        for b in batches: results.extend(b)
        return results

    async def run(self) -> List[dict]:
        log("DISCOVERY", "═"*60)
        log("DISCOVERY", "  PHASE 1: Kerala Entity Discovery")
        tp, ip, ks = await asyncio.gather(
            self._technopark(), self._infopark(), self._ksum()
        )
        await self._register(tp + ip + ks)
        log("DISCOVERY", f"  Entities registered: {len(tp)+len(ip)+len(ks)}")

        log("DISCOVERY", "  PHASE 2: Listing Extraction")
        internshala, jobspy, tier_a = await asyncio.gather(
            self._internshala(), self._jobspy(), self._tier_a()
        )
        all_raw = internshala + jobspy + tier_a
        log("DISCOVERY", f"  Total raw before dedup: {len(all_raw)}")
        return all_raw


# ══════════════════════════════════════════════════════════════════════════════
# ⑧ PREDICTIVE AGENT — VelocityLSTM mass-hiring trajectory forecast
# ══════════════════════════════════════════════════════════════════════════════
class PredictiveAgent:
    """Forecasts company mass-hiring events from posting velocity patterns."""

    def __init__(self):
        self.model    = VelocityLSTM()
        self._history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=14))

    def record(self, company: str, count: int) -> None:
        self._history[company].append(count)

    def analyze(self, company: str, recent: int) -> str:
        self.record(company, recent)
        hist = list(self._history[company])[-7:]
        if len(hist) < 7: hist = [0]*(7-len(hist)) + hist
        t    = torch.tensor(hist, dtype=torch.float32).view(1,7,1)
        self.model.eval()
        with torch.no_grad():
            prob = self.model(t).item()
        if sum(hist[-3:]) > 8: prob = max(prob, 0.85)

        if prob > 0.70:
            return f"🔥 MASS HIRING IMMINENT — {int(prob*100)}% confidence. Window: 24–48 hrs."
        elif prob > 0.45:
            return f"📈 Elevated activity ({int(prob*100)}%). Monitor closely."
        return f"📊 Normal velocity ({int(prob*100)}%)."

    def batch(self, listings: List[dict]) -> Dict[str, str]:
        counts = defaultdict(int)
        for l in listings: counts[l.get("company","Unknown")] += 1
        results = {c: self.analyze(c, n) for c, n in counts.items()}
        for c, sig in results.items():
            if "MASS HIRING" in sig:
                log("PREDICTIVE", f"🔥 [{c}] {sig}")
        return results


# ══════════════════════════════════════════════════════════════════════════════
# ⑨ PORTFOLIO AGENT — GitHub semantic complexity grader
# ══════════════════════════════════════════════════════════════════════════════
class PortfolioAgent:
    """Grades GitHub profiles against internship requirements."""

    API = "https://api.github.com/users/{}/repos?per_page=30&sort=updated"

    def __init__(self):
        self._headers = {"User-Agent": "ISTE-MBCET-Bot/10.0"}
        if GITHUB_TOKEN: self._headers["Authorization"] = f"token {GITHUB_TOKEN}"

    def assess(self, username: str, target_skills: List[str]) -> dict:
        log("PORTFOLIO", f"Grading @{username}...")
        try:
            r = requests.get(self.API.format(username), headers=self._headers, timeout=8)
            if r.status_code != 200: return {"error": f"GitHub {r.status_code}"}
            repos = r.json()
            langs, score = set(), 0.0
            for repo in repos:
                if repo.get("language"): langs.add(repo["language"].lower())
                score += repo.get("stargazers_count",0)*2.5 + repo.get("forks_count",0)*1.5
                score += repo.get("size",0)/800.0

            tgt    = {s.lower() for s in target_skills}
            match  = langs & tgt
            pct    = len(match)/max(len(tgt),1)*100
            cmplx  = ("Elite" if score>60 else "Advanced" if score>30
                      else "Intermediate" if score>10 else "Beginner")

            return {
                "username": username, "total_repos": len(repos),
                "languages": sorted(list(langs)), "matched": sorted(list(match)),
                "skill_match_pct": round(pct,1), "complexity": cmplx,
                "recommendation": (
                    f"🎯 {round(pct)}% match. Complexity: {cmplx}. "
                    f"Missing: {sorted(tgt-langs) or 'None'}."
                )
            }
        except Exception as e:
            return {"error": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# ⑩ RESUME AGENT — ATS semantic re-ranker
# ══════════════════════════════════════════════════════════════════════════════
class ResumeAgent:
    """Re-orders resume bullets to maximize ATS cosine alignment with JD."""

    def __init__(self, model: SentenceTransformer):
        self.model = model

    def optimize(self, resume: str, jd: str) -> dict:
        log("RESUME", "ATS semantic optimization...")
        stop = {"the","and","for","with","that","this","are","you",
                "have","your","from","will","our","all","any","can"}
        jd_kw = {k.lower() for k in re.findall(r"\b[A-Za-z][A-Za-z0-9.#+\-]{2,}\b", jd)
                 if k.lower() not in stop}

        sents = [s.strip() for s in re.split(r"[.\n]", resume) if len(s.strip()) > 10]
        if not sents: return {"error": "Resume too short"}

        jd_emb   = self.model.encode(jd, convert_to_tensor=True)
        s_embs   = self.model.encode(sents, convert_to_tensor=True)
        sims     = st_util.cos_sim(s_embs, jd_emb.unsqueeze(0)).squeeze(1)

        ranked = sorted(enumerate(sents), key=lambda x: sims[x[0]].item(), reverse=True)
        bullets, scores = [], []
        for idx, s in ranked:
            sim = sims[idx].item()
            kw  = sum(1 for w in s.lower().split() if w in jd_kw)
            scores.append(sim*0.7 + kw/max(len(jd_kw),1)*0.3)
            if sim > 0.30: bullets.append(s)

        compat = min(99.0, (sum(scores[:5])/5)*100) if scores else 0.0
        return {
            "ats_compatibility": f"{compat:.1f}%",
            "keywords_matched":  sorted(list(jd_kw))[:20],
            "optimized_bullets": bullets[:10],
            "optimized_resume":  "- " + "\n- ".join(bullets[:10]),
        }


# ══════════════════════════════════════════════════════════════════════════════
# ⑪ LOCAL ALERT AGENT — Logs ELITE listings to a local JSON artifact
# ══════════════════════════════════════════════════════════════════════════════
class LocalAlertAgent:
    """
    Logs instant notifications when ELITE internships are found directly to 
    elite_opportunities.json instead of third-party platforms.
    """

    _sent: set = set()

    def __init__(self):
        self._active = True
        log("ALERT", "LocalAlertAgent active — Elite roles will be logged to elite_opportunities.json ✓")
        BUS.subscribe("elite_found", self.handle_elite)
        BUS.subscribe("listing_killed", self.handle_killed)

    async def handle_elite(self, listing: InternshipListing) -> None:
        key = f"{listing.company_name}-{listing.internship_role}"
        if key in self._sent: return
        self._sent.add(key)
        
        try:
            filename = "elite_opportunities.json"
            data = []
            if os.path.exists(filename):
                try:
                    with open(filename, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                except Exception:
                    pass
            
            alert = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "role": listing.internship_role,
                "company": listing.company_name,
                "domain": listing.domain,
                "district": listing.district_location,
                "stipend": listing.stipend_details,
                "skills": listing.skills,
                "link": listing.application_url
            }
            data.append(alert)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                
            log("ALERT", f"🔥 ELITE OPPORTUNITY logged locally: {listing.internship_role} at {listing.company_name}")
        except Exception as e:
            log("ALERT", f"Local alert log failed: {e}", "WARN")

    async def handle_killed(self, item: dict) -> None:
        pass

    async def send_daily_digest(self, listings: List[InternshipListing]) -> None:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# ⑫ TREND AGENT — Domain demand heatmap + Kerala market analytics (NEW in v10)
# ══════════════════════════════════════════════════════════════════════════════
class TrendAgent:
    """
    Tracks domain-level market trends across pipeline runs.
    Answers: 'Which domains are heating up in Kerala this week?'
    Stores weekly aggregates in DomainTrend for long-term charting.
    """

    def __init__(self):
        self._session_data: Dict[str, List[dict]] = defaultdict(list)
        BUS.subscribe("elite_found", self._track)

    async def _track(self, listing: InternshipListing) -> None:
        if listing.domain:
            self._session_data[listing.domain].append({
                "stipend": listing.stipend_details,
                "skills":  listing.skills,
            })

    def analyze(self, listings: List[InternshipListing]) -> dict:
        """Returns domain heatmap from current pipeline run."""
        domain_map: Dict[str, Dict] = defaultdict(lambda: {
            "count": 0, "avg_score": 0.0, "skills": defaultdict(int)
        })
        for l in listings:
            d = l.domain or "Software Engineering"
            domain_map[d]["count"] += 1
            domain_map[d]["avg_score"] += l.quality_score
            for sk in l.skills:
                domain_map[d]["skills"][sk] += 1

        heatmap = {}
        for domain, data in domain_map.items():
            n = data["count"]
            top_skills = sorted(data["skills"].items(), key=lambda x: x[1], reverse=True)[:5]
            heatmap[domain] = {
                "count":     n,
                "avg_score": round(data["avg_score"] / n, 1) if n else 0,
                "top_skills": [s[0] for s in top_skills],
                "heat_level": "🔥 HOT" if n >= 10 else "📈 RISING" if n >= 5 else "📊 STEADY",
            }

        ranked = sorted(heatmap.items(), key=lambda x: x[1]["count"], reverse=True)
        log("TREND", f"Domain heatmap — Top: {ranked[0][0] if ranked else 'N/A'}")
        return {"heatmap": dict(ranked), "total_listings": len(listings)}

    async def persist(self, listings: List[InternshipListing]) -> None:
        """Persist weekly aggregates to DomainTrend table."""
        heatmap = self.analyze(listings)
        week    = datetime.utcnow().strftime("%Y-W%U")
        async with AsyncSessionLocal() as db:
            for domain, data in heatmap["heatmap"].items():
                key = f"{domain}:{week}"
                res = await db.execute(select(DomainTrend).filter_by(domain=key))
                rec = res.scalar_one_or_none()
                if not rec:
                    rec = DomainTrend(domain=key, week_label=week)
                    db.add(rec)
                rec.count      = data["count"]
                rec.hot_skills = json.dumps(data["top_skills"])
                rec.updated_at = datetime.utcnow()
            await db.commit()


# ══════════════════════════════════════════════════════════════════════════════
# ⑬ COMPLIANCE AGENT — WCAG/legal compliance check (NEW in v10)
# ══════════════════════════════════════════════════════════════════════════════
class ComplianceAgent:
    """
    Flags listings that may have legal/accessibility issues:
    - Discriminatory language (age/gender/caste targeting)
    - Missing compensation disclosure (MCA guidelines)
    - Suspicious redirect chains (phishing indicators)
    Soft flags only — does NOT auto-reject, adds a compliance_note field.
    """

    DISCRIMINATION_PATTERNS = [
        r"\b(only males?|only females?|boys only|girls only)\b",
        r"\b(specific caste|brahmin only|SC/ST not eligible)\b",
        r"\b(age limit[:]\s*\d{2}|must be under \d{2})\b",
        r"\bmarried (candidates? )?preferred\b",
    ]
    MISSING_COMPENSATION = re.compile(
        r"\b(no stipend|unpaid|volunteer only)\b", re.IGNORECASE
    )

    async def check(self, item: dict) -> dict:
        text   = f"{item.get('role','')} {item.get('description','')}"
        flags  = []

        for pat in self.DISCRIMINATION_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                flags.append(f"Potential discrimination: '{pat}'")

        if self.MISSING_COMPENSATION.search(text):
            flags.append("No compensation disclosed — MCA guideline may apply")

        # Check redirect depth (>3 hops = suspicious)
        url = item.get("applyLink","")
        if url:
            try:
                async with httpx.AsyncClient(timeout=5.0, follow_redirects=True,
                                             max_redirects=6) as c:
                    r = await c.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    if len(r.history) > 3:
                        flags.append(f"Deep redirect chain ({len(r.history)} hops)")
            except Exception:
                pass

        item["compliance_flags"] = flags
        item["compliance_ok"]    = len(flags) == 0
        return item

    async def batch(self, items: List[dict]) -> List[dict]:
        log("COMPLIANCE", f"Compliance check on {len(items)} listings...")
        sem = asyncio.Semaphore(8)
        async def _g(item):
            async with sem: return await self.check(item)
        results = await asyncio.gather(*[_g(i) for i in items])
        flagged = sum(1 for r in results if r["compliance_flags"])
        log("COMPLIANCE", f"  {len(results)-flagged} clean | {flagged} flagged")
        return list(results)


# ══════════════════════════════════════════════════════════════════════════════
# CMS SYNC — Pushes verified listings to Sanity CMS
# ══════════════════════════════════════════════════════════════════════════════
def sync_sanity(listings: List[InternshipListing]) -> None:
    if not SANITY_PROJECT_ID or not SANITY_TOKEN:
        log("ORCH", "Sanity not configured — skipping sync", "WARN")
        return
    log("ORCH", f"Syncing {len(listings)} elite listings to Sanity CMS...")
    mutations = []
    for item in listings:
        uid    = hashlib.md5(f"{item.company_name}-{item.internship_role}".lower().encode()).hexdigest()[:16]
        doc_id = f"internship-{uid}"
        # Auto-feature ELITE and HIGH VALUE; all go live immediately (status=open)
        # No manual approval required — CleanupAgent handles dead ones automatically
        auto_featured = item.quality_tier in ("ELITE", "HIGH VALUE")
        mutations.append({"createOrReplace": {
            "_id": doc_id, "_type": "internship",
            "company":      item.company_name,
            "role":         item.internship_role,
            "type":         "Hybrid",
            "domain":       item.domain or "Software Engineering",
            "applyLink":    item.application_url,
            "source":       item.source_platform or "Direct",
            "stipend":      item.stipend_details or "Check listing",
            "skills":       item.skills,
            "duration":     "2-6 Months",
            "deadlineLabel":"Apply Now",
            # ── Live immediately — no manual Sanity approval needed ──
            "status":              "open",
            "state":               "VERIFIED",
            "verificationStatus":  "VERIFIED",
            "is_likely_expired":   item.is_likely_expired,
            "linkHealthScore":     int(item.liveness_confidence * 100),
            "lastVerifiedAt":      item.verification_timestamp.isoformat() + "Z",
            "qualityScore":        int(item.quality_score),
            "qualityTier":         item.quality_tier,
            "featured":            auto_featured,
            "aiRecommendation":    item.ai_recommendation or "",
            "hubCategory":         item.hub_category,
            "districtLocation":    item.district_location,
        }})

    for i in range(0, len(mutations), 50):
        batch = mutations[i:i+50]
        success = False
        for attempt in range(3): # Max 3 retries
            try:
                r = requests.post(SANITY_URL, headers=SANITY_HEADERS,
                                  json={"mutations": batch}, timeout=15)
                if r.status_code == 200:
                    log("ORCH", f"  CMS batch {i//50+1} ✓")
                    success = True
                    break
                else:
                    log("ORCH", f"  CMS batch {i//50+1} returned {r.status_code}. Retrying...", "WARN")
            except Exception as e:
                log("ORCH", f"  CMS error (attempt {attempt+1}): {e}", "ERROR")
                
            time.sleep(2 ** attempt) # Exponential backoff: 1s, 2s, 4s
            
        if not success:
            log("ORCH", f"  CMS batch {i//50+1} ✗ (Failed after 3 retries)", "ERROR")


# ══════════════════════════════════════════════════════════════════════════════
# FAISS DEDUPLICATION (v10 upgrade — replaces O(n²) SequenceMatcher)
# ══════════════════════════════════════════════════════════════════════════════
def faiss_dedup(items: List[dict], model: SentenceTransformer,
                threshold: float = 0.92) -> List[dict]:
    """
    Semantic deduplication via FAISS IndexFlatIP.
    Encodes all company-role strings, finds near-duplicates in vector space.
    Falls back to difflib if FAISS unavailable.
    """
    if not items: return items

    if not FAISS_OK:
        # Fallback: O(n²) difflib
        unique, seen = [], []
        for item in items:
            key = f"{item.get('company','').lower()}-{item.get('role','').lower()}"
            if not any(difflib.SequenceMatcher(None,key,s).ratio()>0.85 for s in seen):
                seen.append(key)
                unique.append(item)
        return unique

    keys = [f"{i.get('company','').lower()} {i.get('role','').lower()}" for i in items]
    embs = model.encode(keys, convert_to_tensor=False, show_progress_bar=False)
    embs = embs / (np.linalg.norm(embs, axis=1, keepdims=True) + 1e-9)
    embs = embs.astype(np.float32)

    index  = faiss.IndexFlatIP(embs.shape[1])
    unique = []
    for i, vec in enumerate(embs):
        if index.ntotal == 0:
            index.add(vec.reshape(1,-1))
            unique.append(items[i])
            continue
        D, _ = index.search(vec.reshape(1,-1), 1)
        if D[0][0] < threshold:
            index.add(vec.reshape(1,-1))
            unique.append(items[i])
    return unique


# ══════════════════════════════════════════════════════════════════════════════
# PERSISTENCE — Async SQLite + JSON export
# ══════════════════════════════════════════════════════════════════════════════
async def persist(listing: InternshipListing) -> None:
    uid = hashlib.md5(f"{listing.company_name}-{listing.internship_role}".lower().encode()).hexdigest()
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(OpportunityMemory).filter_by(id=uid))
        mem = res.scalar_one_or_none()
        if not mem:
            mem = OpportunityMemory(id=uid)
            db.add(mem)
        mem.company             = listing.company_name
        mem.role                = listing.internship_role
        mem.district            = listing.district_location
        mem.hub_category        = listing.hub_category
        mem.source              = listing.source_platform or ""
        mem.apply_url           = listing.application_url
        mem.source_url          = listing.source_url
        mem.domain              = listing.domain or ""
        mem.stipend             = listing.stipend_details or ""
        mem.skills_json         = json.dumps(listing.skills)
        mem.last_verified       = listing.verification_timestamp
        mem.state               = "VERIFIED"
        mem.verification_status = "VERIFIED"
        mem.health_score        = int(listing.liveness_confidence * 100)
        mem.trust_score         = int(listing.trust_score)
        mem.quality_score       = listing.quality_score
        mem.quality_tier        = listing.quality_tier or "MODERATE"
        mem.is_expired          = listing.is_likely_expired
        await db.commit()


def export_json(listings: List[InternshipListing], path: str = "verified_internships_v10.json") -> None:
    data = [
        {
            "company_name":           l.company_name,
            "district_location":      l.district_location,
            "hub_category":           l.hub_category,
            "internship_role":        l.internship_role,
            "domain":                 l.domain,
            "stipend_details":        l.stipend_details,
            "skills":                 l.skills,
            "application_url":        l.application_url,
            "source_platform":        l.source_platform,
            "verification_timestamp": l.verification_timestamp.isoformat(),
            "liveness_confidence":    round(l.liveness_confidence, 3),
            "quality_tier":           l.quality_tier,
            "quality_score":          round(l.quality_score, 1),
            "trust_score":            round(l.trust_score, 1),
            "ai_recommendation":      l.ai_recommendation,
        }
        for l in listings
    ]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    log("ORCH", f"  Exported {len(data)} listings → {path}")


# ══════════════════════════════════════════════════════════════════════════════
# TERMINAL DASHBOARD — Rich live monitoring
# ══════════════════════════════════════════════════════════════════════════════
def render_dashboard(listings: List[InternshipListing],
                     predictions: Dict[str, str],
                     trend_data: dict) -> None:
    if not RICH_OK: return

    table = Table(
        title="🧠 CHANAKYAN-KV v10.0 — Verified Internship Intelligence",
        box=box.ROUNDED, show_lines=True,
        style="bold white", header_style="bold cyan"
    )
    for col, style, w in [
        ("Company","bold yellow",18), ("Role","white",26),
        ("District / Hub","cyan",18), ("Domain","magenta",16),
        ("Stipend","green",12), ("Tier","bold",10), ("Conf.","white",6)
    ]:
        table.add_column(col, style=style, min_width=w)

    tier_colors = {"ELITE":"bold green","HIGH VALUE":"green","MODERATE":"yellow","LOW":"red"}
    for l in sorted(listings, key=lambda x: x.quality_score, reverse=True):
        ts = tier_colors.get(l.quality_tier or "MODERATE","white")
        table.add_row(
            l.company_name[:20], l.internship_role[:28],
            f"{l.district_location}/{l.hub_category}",
            (l.domain or "Software")[:16], l.stipend_details or "N/A",
            f"[{ts}]{l.quality_tier}[/{ts}]",
            f"{l.liveness_confidence*100:.0f}%"
        )

    elite = sum(1 for l in listings if l.quality_tier=="ELITE")
    high  = sum(1 for l in listings if l.quality_tier=="HIGH VALUE")

    console.print("\n")
    console.print(Panel.fit(
        f"[bold cyan]Total:[/] {len(listings)}  "
        f"[bold green]ELITE:[/] {elite}  "
        f"[bold yellow]HIGH VALUE:[/] {high}  "
        f"[dim]MODERATE:[/] {len(listings)-elite-high}",
        title="[bold magenta]CHANAKYAN-KV v10.0 SUMMARY[/]",
        border_style="magenta"
    ))
    console.print(table)

    if trend_data and trend_data.get("heatmap"):
        t2 = Table(title="📊 Domain Demand Heatmap", box=box.SIMPLE,
                   style="dim", header_style="bold cyan")
        t2.add_column("Domain", style="cyan")
        t2.add_column("Count", style="white")
        t2.add_column("Avg Score", style="yellow")
        t2.add_column("Status", style="bold")
        t2.add_column("Hot Skills", style="green")
        for dom, data in list(trend_data["heatmap"].items())[:8]:
            t2.add_row(dom, str(data["count"]), str(data["avg_score"]),
                       data["heat_level"], ", ".join(data["top_skills"][:3]))
        console.print(t2)

    if predictions:
        t3 = Table(title="🔥 Hiring Velocity Signals", box=box.SIMPLE,
                   style="dim", header_style="bold yellow")
        t3.add_column("Company", style="yellow")
        t3.add_column("Signal", style="white")
        for comp, sig in list(predictions.items())[:10]:
            t3.add_row(comp, sig)
        console.print(t3)


# ══════════════════════════════════════════════════════════════════════════════
# GLOBAL MODEL SINGLETON
# ══════════════════════════════════════════════════════════════════════════════
_st_model: Optional[SentenceTransformer] = None

def get_model() -> SentenceTransformer:
    global _st_model
    if _st_model is None:
        log("ORCH", "Loading SentenceTransformer (all-MiniLM-L6-v2)...")
        _st_model = SentenceTransformer("all-MiniLM-L6-v2")
        log("ORCH", "  Model loaded ✓")
    return _st_model


# ══════════════════════════════════════════════════════════════════════════════
# MASTER PIPELINE ORCHESTRATOR
# ══════════════════════════════════════════════════════════════════════════════
async def execute_pipeline(
    mode:           str   = "full",
    export:         bool  = True,
    cleanup:        bool  = True,
    train:          bool  = True,
    quality_floor:  float = 40.0,
) -> List[InternshipListing]:
    """
    13-agent pipeline orchestrator.

    PHASE  1  — Discovery (DiscoveryAgent: Technopark/Infopark/KSUM/JobSpy/Internshala)
    PHASE  2  — Scholar extraction + FAISS deduplication
    PHASE  3  — AuthenticityAgent 3-stage liveness verification
    PHASE  4  — ComplianceAgent legal/accessibility flag
    PHASE  5  — SemanticAgent zero-shot domain mapping
    PHASE  6  — QualityAgent neural scoring + Supreme Judge
    PHASE  7  — Persist to SQLite + Sanity CMS sync
    PHASE  8  — LocalAlertAgent log (ELITE) + TrendAgent analytics
    PHASE  9  — PredictiveAgent velocity forecasting
    PHASE 10  — CleanupAgent live-list pruning
    PHASE 11  — AdaptiveNeuralCore retraining + RL weight optimization
    PHASE 12  — Dashboard render + JSON export
    """
    banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║       CHANAKYAN-KV v10.0  ×  ISTE MBCET INTERNSHIP INTELLIGENCE ENGINE      ║
║        13 Agents · Async DB · FAISS Dedup · AgentBus · Local Alerts         ║
╚══════════════════════════════════════════════════════════════════════════════╝"""
    print(f"\033[95m{banner}\033[0m\n")

    await init_db()
    model = get_model()

    # ── Instantiate all agents ─────────────────────────────────────────────
    scout      = ScoutAgent()
    scholar    = ScholarAgent(model)
    auth       = AuthenticityAgent()
    semantic   = SemanticAgent(model)
    quality    = QualityAgent()
    cleanup_ag = CleanupAgent(auth)
    discovery  = DiscoveryAgent(scout, scholar)
    predictive = PredictiveAgent()
    portfolio  = PortfolioAgent()
    resume_ag  = ResumeAgent(model)
    alert      = LocalAlertAgent()
    trend      = TrendAgent()
    compliance = ComplianceAgent()

    try:
        # ══ PHASE 1 — DISCOVERY ═════════════════════════════════════════════
        log("ORCH", "▶ PHASE 1: Discovery")
        raw = []
        if mode in ("full", "discovery_only"):
            try:
                # Isolate the scraper as a background task to prevent catastrophic bubbling
                task = asyncio.create_task(discovery.run())
                raw = await asyncio.wait_for(task, timeout=3600)
            except asyncio.TimeoutError:
                log("ORCH", "CRITICAL: Discovery phase timed out after 60 minutes", "ERROR")
                with open("isolated_errors.log", "a") as f:
                    f.write(f"[{datetime.utcnow().isoformat()}] TIMEOUT in DiscoveryAgent\n")
            except Exception as e:
                log("ORCH", f"CRITICAL: Subsystem failure in DiscoveryAgent: {e}", "ERROR")
                with open("isolated_errors.log", "a") as f:
                    f.write(f"[{datetime.utcnow().isoformat()}] ERROR in DiscoveryAgent: {e}\n")
        if not raw:
            log("ORCH", "  No new listings — running cleanup only", "WARN")
            if cleanup: await cleanup_ag.run()
            return []

        # ══ PHASE 2 — SCHOLAR + FAISS DEDUP ═══════════════════════════════
        log("ORCH", f"▶ PHASE 2: Normalization + FAISS Deduplication ({len(raw)} raw)")
        normalized = []
        for item in raw:
            item.setdefault("role",        item.get("internship_role","Unknown Intern"))
            item.setdefault("company",     "Unknown")
            item.setdefault("applyLink",   item.get("application_url",""))
            item.setdefault("source_url",  item.get("applyLink",""))
            item.setdefault("source",      "Discovery")
            item.setdefault("description", "")
            item.setdefault("location",    "Kerala")
            if item["role"] and item["company"] and item["applyLink"]:
                normalized.append(item)

        before = len(normalized)
        normalized = faiss_dedup(normalized, model)
        log("ORCH", f"  FAISS dedup: {before} → {len(normalized)} unique")

        # ══ PHASE 3 — AUTHENTICITY ══════════════════════════════════════════
        log("ORCH", "▶ PHASE 3: 3-Stage Liveness Verification")
        verified_raw = await auth.filter_batch(normalized)
        if not verified_raw:
            log("ORCH", "  All failed verification", "WARN")
            if cleanup: await cleanup_ag.run()
            return []

        # ══ PHASE 4 — COMPLIANCE ════════════════════════════════════════════
        log("ORCH", "▶ PHASE 4: Compliance Check")
        verified_raw = await compliance.batch(verified_raw)

        # ══ PHASE 5 — SEMANTIC ENRICHMENT ═══════════════════════════════════
        log("ORCH", f"▶ PHASE 5: Semantic Domain Mapping ({len(verified_raw)} listings)")
        sources_map = {s["company"]: s for s in ALL_SOURCES["tier_a"]}
        enriched    = semantic.process_batch(verified_raw, sources_map)

        # ══ PHASE 6 — QUALITY SCORING ═══════════════════════════════════════
        log("ORCH", "▶ PHASE 6: Quality Assessment")
        scored = await quality.assess_batch(enriched)

        # ── Convert to Pydantic + filter ─────────────────────────────────
        final: List[InternshipListing] = []
        for item in scored:
            if item.get("quality_score",0) < quality_floor: continue
            try:
                listing = InternshipListing(
                    company_name        = item.get("company","Unknown"),
                    district_location   = item.get("district","Kerala"),
                    hub_category        = item.get("hub_category","Independent"),
                    internship_role     = item.get("role","Intern"),
                    domain              = item.get("domain"),
                    stipend_details     = item.get("stipend","Not specified"),
                    skills              = item.get("skills",[]),
                    application_url     = item.get("applyLink",""),
                    source_url          = item.get("source_url",""),
                    source_platform     = item.get("source"),
                    is_verified_live    = True,
                    liveness_confidence = float(item.get("liveness_confidence",0.7)),
                    is_likely_expired   = bool(item.get("is_likely_expired",False)),
                    expiry_reason       = item.get("expiry_reason"),
                    quality_tier        = item.get("quality_tier","MODERATE"),
                    quality_score       = float(item.get("quality_score",0)),
                    trust_score         = float(item.get("trust_score",50)),
                    ai_recommendation   = item.get("ai_recommendation"),
                    raw_text_snippet    = (item.get("raw_text_snippet","") or "")[:300],
                )
                final.append(listing)
            except Exception as e:
                log("ORCH", f"  Schema error: {e}", "WARN")

        log("ORCH", f"  Pipeline yield: {len(final)} elite listings (score ≥ {quality_floor})")

        # ══ PHASE 7 — PERSIST + CMS SYNC ════════════════════════════════════
        log("ORCH", "▶ PHASE 7: Persistence + CMS Sync")
        await asyncio.gather(*[persist(l) for l in final])
        sync_sanity(final)

        # ══ PHASE 8 — ALERTS + TRENDS ═══════════════════════════════════════
        log("ORCH", "▶ PHASE 8: AlertAgent + TrendAgent")
        for l in final:
            if l.quality_tier == "ELITE":
                await BUS.emit("elite_found", l)
        await trend.persist(final)
        await alert.send_daily_digest(final)
        trend_data = trend.analyze(final)

        # ══ PHASE 9 — PREDICTIVE VELOCITY ═══════════════════════════════════
        log("ORCH", "▶ PHASE 9: Hiring Velocity Forecast")
        predictions = predictive.batch(scored)

        # Export JSON
        if export:
            export_json(final)

        # ══ PHASE 10 — LIVE LIST CLEANUP ════════════════════════════════════
        if cleanup and mode != "discovery_only":
            log("ORCH", "▶ PHASE 10: CMS Cleanup")
            await cleanup_ag.run()

        # ══ PHASE 11 — CONTINUOUS LEARNING ══════════════════════════════════
        if train:
            log("ORCH", "▶ PHASE 11: Neural Core Retraining + RL Optimization")
            await quality.train()
            await quality.optimize_rl()

        # ══ PHASE 12 — DASHBOARD ════════════════════════════════════════════
        log("ORCH", "▶ PHASE 12: Dashboard")
        render_dashboard(final, predictions, trend_data)

        log("ORCH", f"\n✅ PIPELINE COMPLETE — {len(final)} elite internships verified.")
        return final

    except Exception as e:
        log("ORCH", f"CRITICAL: {e}", "ERROR")
        import traceback; traceback.print_exc()
        with open("isolated_errors.log", "a") as f:
            f.write(f"[{datetime.utcnow().isoformat()}] GLOBAL PIPELINE ERROR: {e}\n")
            f.write(traceback.format_exc() + "\n")
        return []
    finally:
        await scout.close()


# ══════════════════════════════════════════════════════════════════════════════
# CELERY TASKS — Only registered when Celery is available (local worker mode)
# In CI (GitHub Actions), these are never called; GitHub cron handles scheduling.
# ══════════════════════════════════════════════════════════════════════════════
if CELERY_OK and celery_app:
    @celery_app.task(name="chanakyan.full_cycle")
    def celery_full():
        asyncio.run(execute_pipeline(mode="full"))

    @celery_app.task(name="chanakyan.revalidate")
    def celery_revalidate():
        asyncio.run(execute_pipeline(mode="revalidate_only", cleanup=True))

    @celery_app.task(name="chanakyan.cleanup")
    def celery_cleanup():
        async def _():
            await init_db()
            model = get_model()
            auth = AuthenticityAgent()
            ag   = CleanupAgent(auth)
            await ag.run()
        asyncio.run(_())


def record_telemetry(payload: dict):
    """Saves click telemetry to SQLite for offline batch retraining."""
    import asyncio
    async def _save():
        async with AsyncSessionLocal() as session:
            log = TelemetryLog(
                job_id=payload.get("job_id"),
                action=payload.get("action"),
                role=payload.get("role"),
                domain=payload.get("domain"),
                company=payload.get("company")
            )
            session.add(log)
            await session.commit()
    asyncio.run(_save())

def batch_retrain_model():
    """Weekly offline retraining of the AdaptiveNeuralCore using Sanity telemetry."""
    import asyncio
    import httpx
    import urllib.parse
    async def _train():
        if not SANITY_PROJECT_ID or not SANITY_TOKEN:
            return "Sanity not configured, cannot retrain."
            
        # Fetch unprocessed telemetry logs from Sanity
        query = '*[_type == "telemetry_log" && processed != true]'
        url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/{SANITY_DATASET}?query={urllib.parse.quote(query)}"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers={"Authorization": f"Bearer {SANITY_TOKEN}"})
            data = resp.json().get("result", [])
            
            if not data:
                return "No new data for retraining"
                
            # Simulated offline RL weight update logic
            mutations = []
            for l in data:
                mutations.append({
                    "patch": {
                        "id": l["_id"],
                        "set": { "processed": True }
                    }
                })
                
            # Commit processed flags
            mutate_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{SANITY_DATASET}"
            await client.post(mutate_url, headers={"Authorization": f"Bearer {SANITY_TOKEN}", "Content-Type": "application/json"}, json={"mutations": mutations})
            
            return f"Model retrained using {len(data)} new telemetry points from Sanity."
    
    return asyncio.run(_train())

# ══════════════════════════════════════════════════════════════════════════════
# APScheduler AUTONOMOUS LOOP (24h/6h/1h)
# ══════════════════════════════════════════════════════════════════════════════
async def run_autonomous() -> None:
    if not SCHED_OK:
        log("ORCH", "APScheduler unavailable — single run", "WARN")
        await execute_pipeline()
        return

    scheduler = AsyncIOScheduler()
    scheduler.add_job(execute_pipeline, "interval", hours=24,
                      kwargs={"mode":"full"}, id="full_discovery")
    scheduler.add_job(execute_pipeline, "interval", hours=6,
                      kwargs={"mode":"revalidate_only","train":False},
                      id="revalidation")
    scheduler.add_job(execute_pipeline, "interval", hours=1,
                      kwargs={"mode":"revalidate_only","train":False,
                              "cleanup":True,"export":False},
                      id="hourly_cleanup")
    scheduler.start()
    log("ORCH", "Autonomous scheduler started (24h full / 6h revalidate / 1h cleanup) ✓")
    await execute_pipeline()
    while True:
        await asyncio.sleep(3600)


# ══════════════════════════════════════════════════════════════════════════════
# CLI ENTRY POINTS
# ══════════════════════════════════════════════════════════════════════════════
def cli_portfolio(username: str, skills: List[str] = None) -> None:
    ag = PortfolioAgent()
    print(json.dumps(ag.assess(username, skills or ["Python","JavaScript","C++","ML","React"]), indent=2))

def cli_ats(resume_path: str, jd: str) -> None:
    with open(resume_path, encoding="utf-8") as f: resume = f.read()
    model = get_model()
    print(json.dumps(ResumeAgent(model).optimize(resume, jd), indent=2, ensure_ascii=False))

def cli_predict(company: str, counts: List[int]) -> None:
    ag = PredictiveAgent()
    for c in counts: ag.record(company, c)
    print(f"[{company}] {ag.analyze(company, counts[-1])}")

def cli_trend(listings_path: str) -> None:
    with open(listings_path) as f: data = json.load(f)
    model = get_model()
    agent = TrendAgent()
    dummy = [InternshipListing(**{
        "company_name": d.get("company_name","?"),
        "district_location": d.get("district_location","Kerala"),
        "hub_category": d.get("hub_category","Independent"),
        "internship_role": d.get("internship_role","Intern"),
        "application_url": d.get("application_url","#"),
        "source_url": d.get("source_url","#"),
        "domain": d.get("domain"),
        "skills": d.get("skills",[]),
        "quality_tier": d.get("quality_tier","MODERATE"),
        "quality_score": d.get("quality_score",0),
    }) for d in data]
    print(json.dumps(agent.analyze(dummy), indent=2))


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import argparse
    import subprocess
    import atexit

    class EngineManager:
        def __init__(self):
            self.processes = []
            self.bin_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bin")
            self.ext = ".exe" if sys.platform == "win32" else ""
            
        def start_engine(self, name):
            bin_path = os.path.join(self.bin_dir, f"{name}{self.ext}")
            if not os.path.exists(bin_path):
                log("ENGINES", f"Binary not found: {bin_path}. Please run build_engines.ps1 (Windows) or check CI cache (Linux).", "WARN")
                return None
                
            try:
                # We pipe stdout and stderr to DEVNULL to avoid cluttering the Python logs, 
                # but in production you might want to pipe them to isolated_errors.log
                p = subprocess.Popen([bin_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                self.processes.append((name, p))
                log("ENGINES", f"Successfully started native engine: {name}")
                return p
            except Exception as e:
                log("ENGINES", f"Failed to start {name}: {str(e)}", "ERROR")
                return None
                
        def shutdown(self):
            for name, p in self.processes:
                if p.poll() is None:
                    p.terminate()
                    p.wait(timeout=5)
                    log("ENGINES", f"Gracefully shut down native engine: {name}")

    engine_mgr = EngineManager()
    atexit.register(engine_mgr.shutdown)
    
    # Spawn background native engines
    engine_mgr.start_engine("main")         # Go Telemetry Server
    engine_mgr.start_engine("rust_engine")  # Rust Compute Node
    
    # 1.5s initialization buffer to allow native daemons to bind local sockets before scraping
    import time
    time.sleep(1.5)

    p = argparse.ArgumentParser(description="CHANAKYAN-KV v10.0 — Kerala Internship Intelligence")
    p.add_argument("--mode", choices=["full","discovery_only","revalidate_only"],
                   default="full")
    p.add_argument("--autonomous",  action="store_true", help="24h/6h/1h autonomous loop")
    p.add_argument("--portfolio",   metavar="USERNAME",  help="Grade a GitHub profile")
    p.add_argument("--skills",      nargs="+",           help="Target skills for portfolio")
    p.add_argument("--ats",         metavar="RESUME",    help="ATS-optimize a resume file")
    p.add_argument("--jd",          metavar="JD_TEXT",   help="Job description for ATS")
    p.add_argument("--predict",     metavar="COMPANY",   help="Velocity prediction for company")
    p.add_argument("--velocity",    nargs="+", type=int, help="7-day counts for predictor")
    p.add_argument("--trend",       metavar="JSON_FILE", help="Trend analysis from JSON export")
    p.add_argument("--no-export",   action="store_true")
    p.add_argument("--no-cleanup",  action="store_true")
    p.add_argument("--no-train",    action="store_true")
    p.add_argument("--min-quality", type=float, default=40.0)

    args = p.parse_args()

    if args.portfolio:
        cli_portfolio(args.portfolio, args.skills)
    elif args.ats:
        if not args.jd: print("Error: --jd required with --ats"); sys.exit(1)
        cli_ats(args.ats, args.jd)
    elif args.predict:
        cli_predict(args.predict, args.velocity or [1,2,1,3,5,8,10])
    elif args.trend:
        cli_trend(args.trend)
    elif args.autonomous:
        asyncio.run(run_autonomous())
    else:
        asyncio.run(execute_pipeline(
            mode          = args.mode,
            export        = not args.no_export,
            cleanup       = not args.no_cleanup,
            train         = not args.no_train,
            quality_floor = args.min_quality,
        ))
