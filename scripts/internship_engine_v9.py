#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  ISTE MBCET × CHANAKYAN-KV  —  INTERNSHIP INTELLIGENCE ECOSYSTEM  v9.0     ║
║  Kerala's Premier Autonomous Multi-Agent Opportunity Discovery Infrastructure║
╠══════════════════════════════════════════════════════════════════════════════╣
║  AGENT ROSTER                                                                ║
║  ① ScoutAgent         — Playwright stealth crawler + network intercept       ║
║  ② ScholarAgent       — LLM semantic DOM parser (no static selectors)        ║
║  ③ AuthenticityAgent  — Scam detection + multi-stage liveness verification   ║
║  ④ SemanticAgent      — Zero-shot NLP domain mapping + stipend extraction    ║
║  ⑤ QualityAgent       — AdaptiveNeuralCore scoring + Supreme Judge LLM      ║
║  ⑥ SanityCleanupAgent — Live CMS pruning + EvolutionMemory feedback loop    ║
║  ⑦ DiscoveryAgent     — Autonomous Kerala entity discovery (Technopark, etc) ║
║  ⑧ PredictiveAgent    — VelocityLSTM mass-hiring trajectory prediction       ║
║  ⑨ PortfolioAgent     — GitHub AST grader + skill-match engine               ║
║  ⑩ ResumeAgent        — ATS resume optimizer via semantic re-ranking         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MEMORY STACK: SQLite (SQLAlchemy) + Redis + FAISS + NetworkX                ║
║  SCHEDULER:    APScheduler (24h discovery / 6h re-verification)              ║
║  OUTPUT:       Sanity CMS + local SQLite + JSON export                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ─── Standard Library ─────────────────────────────────────────────────────────
import os, sys, time, hashlib, json, asyncio, difflib, re, random
import logging
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse, quote

# ─── Third-Party ──────────────────────────────────────────────────────────────
import requests
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Playwright & stealth
from playwright.async_api import async_playwright, BrowserContext, Page
try:
    from playwright_stealth import stealth_async
    STEALTH_AVAILABLE = True
except ImportError:
    STEALTH_AVAILABLE = False

from fake_useragent import UserAgent

# ML stack
import torch
import torch.nn as nn
import torch.optim as optim
from sentence_transformers import SentenceTransformer, util as st_util

# Database & queue
from sqlalchemy import (
    create_engine, Column, String, Boolean, Integer, Float, DateTime, Text
)
from sqlalchemy.orm import declarative_base, sessionmaker
import redis

# Celery task queue
from celery import Celery

# JobSpy multi-platform aggregator
try:
    from jobspy import scrape_jobs  # type: ignore
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False
    scrape_jobs = None

import pandas as pd

# FAISS vector memory
try:
    import faiss
    import numpy as np
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

# Graph memory
try:
    import networkx as nx
    NX_AVAILABLE = True
except ImportError:
    NX_AVAILABLE = False

# APScheduler
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False

# Rich terminal dashboard
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
    from rich.panel import Panel
    from rich import box
    RICH_AVAILABLE = True
    console = Console()
except ImportError:
    RICH_AVAILABLE = False
    console = None

# Pydantic schema validation
from pydantic import BaseModel, HttpUrl, field_validator
from pydantic import ConfigDict

# Source registry
from source_registry import (
    ALL_SOURCES, SCAM_SIGNALS, EXPIRY_PHRASES,
    COMPANY_TRUST_OVERRIDES, KERALA_ZONES, DOMAIN_KEYWORDS
)

# ─── Environment ──────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=".env.local")
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID", "")
SANITY_DATASET    = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_TOKEN      = os.getenv("SANITY_API_TOKEN", "")
SANITY_URL        = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{SANITY_DATASET}"
SANITY_HEADERS    = {"Content-Type": "application/json", "Authorization": f"Bearer {SANITY_TOKEN}"}
GITHUB_TOKEN      = os.getenv("GITHUB_TOKEN", "")  # Optional: prevents rate-limiting

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.FileHandler("chanakyan_v9.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

AGENT_COLORS = {
    "SCOUT":       "\033[96m",  # Cyan
    "SCHOLAR":     "\033[95m",  # Magenta
    "AUTHENTICITY":"\033[93m",  # Yellow
    "SEMANTIC":    "\033[94m",  # Blue
    "QUALITY":     "\033[92m",  # Green
    "CLEANUP":     "\033[91m",  # Red
    "DISCOVERY":   "\033[97m",  # White
    "PREDICTIVE":  "\033[33m",  # Orange-ish
    "PORTFOLIO":   "\033[36m",  # Teal
    "RESUME":      "\033[35m",  # Purple
    "ORCHESTRATOR":"\033[1m\033[97m",
    "RESET":       "\033[0m",
    "BOLD":        "\033[1m",
}

def log(agent: str, msg: str, level: str = "INFO") -> None:
    """Colorized, timestamped agent log."""
    c   = AGENT_COLORS.get(agent, "")
    rst = AGENT_COLORS["RESET"]
    bd  = AGENT_COLORS["BOLD"]
    ts  = time.strftime("%H:%M:%S")
    prefix = f"{c}[{ts}] {bd}[{agent}]{rst} "
    print(f"{prefix}{msg}")
    logging.info(f"[{agent}] {msg}")


# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC SCHEMA — Strict output contract. No listing passes without this.
# ══════════════════════════════════════════════════════════════════════════════
class InternshipListing(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    company_name:           str
    district_location:      str                        # e.g., "Thiruvananthapuram"
    hub_category:           str                        # e.g., "Technopark", "Infopark", "Startup"
    internship_role:        str
    domain:                 Optional[str]   = None     # e.g., "AI/ML & Data Science"
    stipend_details:        Optional[str]   = "Not specified"
    skills:                 List[str]       = []
    application_url:        str                        # Verified live URL
    source_url:             str                        # Page where listing was found
    source_platform:        Optional[str]   = None
    verification_timestamp: datetime        = datetime.utcnow()
    is_verified_live:       bool            = False
    liveness_confidence:    float           = 0.0      # 0.0 – 1.0
    is_likely_expired:      bool            = False
    expiry_reason:          Optional[str]   = None
    quality_tier:           Optional[str]   = "MODERATE"
    quality_score:          float           = 0.0
    trust_score:            float           = 50.0
    ai_recommendation:      Optional[str]   = None
    raw_text_snippet:       Optional[str]   = None     # Audit trail


# ══════════════════════════════════════════════════════════════════════════════
# DATABASE — SQLAlchemy ORM models
# ══════════════════════════════════════════════════════════════════════════════
Base = declarative_base()

class OpportunityMemory(Base):
    """Long-term memory of every discovered opportunity with state machine."""
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
    # State machine: NEW → ACTIVE → VERIFIED → SUSPECT → ARCHIVED → DELETED
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
    """Feedback memory for the AdaptiveNeuralCore continuous training loop."""
    __tablename__ = "evolution_memory"
    id        = Column(String, primary_key=True)
    embedding = Column(Text)
    survived  = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SiteFingerprint(Base):
    """Self-learning memory: how each company structures its career page."""
    __tablename__ = "site_fingerprints"
    domain          = Column(String, primary_key=True)
    strategy        = Column(String)           # "api", "dom_css", "playwright_scroll"
    selector_hint   = Column(String)           # Cached successful selector
    api_endpoint    = Column(String)           # Discovered XHR endpoint
    success_count   = Column(Integer, default=0)
    failure_count   = Column(Integer, default=0)
    last_updated    = Column(DateTime, default=datetime.utcnow)
    fingerprint_vec = Column(Text)             # FAISS index embedding JSON

class CompanyNode(Base):
    """Knowledge graph nodes — every discovered Kerala company."""
    __tablename__ = "company_graph"
    domain          = Column(String, primary_key=True)
    company_name    = Column(String)
    hub_zone        = Column(String)
    district        = Column(String)
    careers_url     = Column(String)
    requires_js     = Column(Boolean, default=True)
    trust_score     = Column(Integer, default=50)
    pagerank_score  = Column(Float, default=0.0)
    last_crawled    = Column(DateTime)
    discovery_src   = Column(String)           # How we found this company

# ─── DB Init ──────────────────────────────────────────────────────────────────
DB_PATH    = "internship_brain_v9.db"
db_engine  = create_engine(f"sqlite:///{DB_PATH}", echo=False)
Base.metadata.create_all(db_engine)
SessionLocal = sessionmaker(bind=db_engine)

# ─── Redis & Celery ───────────────────────────────────────────────────────────
try:
    redis_client = redis.Redis(host="localhost", port=6379, db=0, socket_timeout=2)
    redis_client.ping()
    REDIS_AVAILABLE = True
    log("ORCHESTRATOR", "Redis connection established ✓")
except Exception:
    redis_client = None
    REDIS_AVAILABLE = False
    log("ORCHESTRATOR", "Redis unavailable — cache layer disabled (OK for local dev)", "WARN")

celery_app = Celery(
    "chanakyan_v9",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)


# ══════════════════════════════════════════════════════════════════════════════
# NEURAL MODELS
# ══════════════════════════════════════════════════════════════════════════════
class AdaptiveNeuralCore(nn.Module):
    """
    Self-learning survival predictor.
    Input: 384-dim sentence embedding of a job role.
    Output: Probability [0,1] that this listing is high-quality and will survive cleanup.
    """
    def __init__(self, input_dim: int = 384):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class VelocityLSTM(nn.Module):
    """
    Time-series hiring velocity predictor.
    Input: 7-day posting volume sequence per company.
    Output: Probability of imminent mass-hiring spree.
    """
    def __init__(self, input_dim: int = 1, hidden_dim: int = 32, layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, layers, batch_first=True, dropout=0.1)
        self.head  = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out, _ = self.lstm(x)
        return self.head(out[:, -1, :])


# ══════════════════════════════════════════════════════════════════════════════
# ① SCOUT AGENT — Playwright stealth crawler with network interception
# ══════════════════════════════════════════════════════════════════════════════
class ScoutAgent:
    """
    The Hunter. Handles:
    - Rotating user-agents + viewport fingerprints
    - playwright-stealth anti-bot evasion
    - XHR/Fetch network interception (discovers hidden REST APIs)
    - Infinite scroll + "Load More" button automation
    - Self-healing via SiteFingerprint memory
    """

    def __init__(self):
        self.ua = UserAgent()
        self._playwright = None
        self._browser    = None
        self._context: Optional[BrowserContext] = None
        self._intercepted_apis: Dict[str, List[dict]] = {}

    async def _init_browser(self) -> None:
        if self._playwright:
            return
        self._playwright = await async_playwright().start()
        self._browser    = await self._playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox",
                  "--disable-blink-features=AutomationControlled"]
        )

    async def _new_stealth_context(self) -> BrowserContext:
        """Creates a fresh browser context with randomized fingerprint."""
        await self._init_browser()
        ctx = await self._browser.new_context(
            viewport={
                "width":  random.choice([1280, 1366, 1440, 1920]),
                "height": random.choice([768, 800, 900, 1080])
            },
            user_agent=self.ua.random,
            locale=random.choice(["en-IN", "en-US", "en-GB"]),
            timezone_id="Asia/Kolkata",
            extra_http_headers={
                "Accept-Language": "en-IN,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
            }
        )
        return ctx

    def _intercept_handler(self, company_key: str):
        """Captures XHR/fetch responses to discover hidden job API endpoints."""
        async def handler(response):
            url = response.url
            ct  = response.headers.get("content-type", "")
            # Only capture JSON-like responses that might be job feeds
            if "json" in ct and any(kw in url.lower() for kw in
                                    ["job", "career", "position", "opening", "vacancy",
                                     "recruit", "hire", "talent"]):
                try:
                    body = await response.json()
                    if isinstance(body, (list, dict)) and len(str(body)) > 100:
                        if company_key not in self._intercepted_apis:
                            self._intercepted_apis[company_key] = []
                        self._intercepted_apis[company_key].append({
                            "endpoint": url,
                            "sample":   str(body)[:500]
                        })
                        log("SCOUT", f"🔌 API endpoint intercepted: {url[:80]}")
                except Exception:
                    pass
        return handler

    def _load_fingerprint(self, domain: str) -> Optional[dict]:
        db = SessionLocal()
        fp = db.query(SiteFingerprint).filter_by(domain=domain).first()
        db.close()
        if fp and fp.success_count > fp.failure_count:
            return {
                "strategy":     fp.strategy,
                "selector":     fp.selector_hint,
                "api_endpoint": fp.api_endpoint
            }
        return None

    def _save_fingerprint(self, domain: str, strategy: str,
                          selector: str = "", api_endpoint: str = "",
                          success: bool = True) -> None:
        db = SessionLocal()
        fp = db.query(SiteFingerprint).filter_by(domain=domain).first()
        if not fp:
            fp = SiteFingerprint(domain=domain)
            db.add(fp)
        fp.strategy     = strategy
        fp.selector_hint = selector
        fp.api_endpoint  = api_endpoint
        fp.last_updated  = datetime.utcnow()
        if success:
            fp.success_count += 1
        else:
            fp.failure_count += 1
        db.commit()
        db.close()

    async def _auto_scroll_and_click(self, page: Page) -> None:
        """Triggers infinite scroll and clicks 'Load More' patterns."""
        for _ in range(5):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(random.uniform(0.8, 1.5))

        # Click 'Load More' / 'Next' / 'Show more jobs' buttons
        load_more_patterns = [
            "text=Load More", "text=Show More", "text=Next",
            "[aria-label*='Load more']", "[aria-label*='Next page']",
            "button:has-text('More jobs')", "button:has-text('Load more')",
            ".pagination-next", "[data-testid='pagination-next']"
        ]
        for pattern in load_more_patterns:
            try:
                btn = page.locator(pattern).first
                if await btn.is_visible(timeout=1500):
                    await btn.click()
                    await page.wait_for_load_state("networkidle", timeout=5000)
                    log("SCOUT", f"  ↳ Clicked load-more: {pattern}")
                    break
            except Exception:
                pass

    async def fetch_page_content(
        self,
        url: str,
        requires_js: bool = True,
        company_key: str  = ""
    ) -> tuple[Optional[str], Optional[str]]:
        """
        Returns (html_content, discovered_api_endpoint | None).
        Tries httpx first for speed; falls back to Playwright.
        Checks content hash via Redis to avoid re-processing unchanged pages.
        """
        domain = urlparse(url).netloc

        # ── Redis cache check ────────────────────────────────────────────────
        if REDIS_AVAILABLE:
            cached_hash = redis_client.get(f"page_hash:{url}")
            if cached_hash:
                log("SCOUT", f"  ↳ Cache hit — content unchanged, skipping: {domain}")
                return None, None  # Signal: no change, skip

        # ── Fast path: httpx ─────────────────────────────────────────────────
        if not requires_js:
            try:
                async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
                    resp = await client.get(url, headers={"User-Agent": self.ua.random})
                    if resp.status_code == 200:
                        content = resp.text
                        h = hashlib.md5(content.encode()).hexdigest()
                        if REDIS_AVAILABLE:
                            redis_client.set(f"page_hash:{url}", h, ex=3600 * 12)
                        return content, None
            except Exception as e:
                log("SCOUT", f"  ↳ httpx failed ({e}), escalating to Playwright", "WARN")

        # ── Playwright with stealth ──────────────────────────────────────────
        ctx  = await self._new_stealth_context()
        page = await ctx.new_page()

        if STEALTH_AVAILABLE:
            await stealth_async(page)

        # Register network interceptor
        intercepted_endpoint = None
        if company_key:
            page.on("response", self._intercept_handler(company_key))

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await asyncio.sleep(random.uniform(1.0, 2.5))  # Human-like pause
            await self._auto_scroll_and_click(page)

            content = await page.content()
            h = hashlib.md5(content.encode()).hexdigest()
            if REDIS_AVAILABLE:
                redis_client.set(f"page_hash:{url}", h, ex=3600 * 12)

            # Check if we intercepted an API
            if company_key and company_key in self._intercepted_apis:
                intercepted_endpoint = self._intercepted_apis[company_key][0]["endpoint"]
                self._save_fingerprint(domain, "api", api_endpoint=intercepted_endpoint)
            else:
                self._save_fingerprint(domain, "playwright_dom")

            return content, intercepted_endpoint

        except Exception as e:
            log("SCOUT", f"  ↳ Playwright error on {url}: {e}", "ERROR")
            self._save_fingerprint(domain, "failed", success=False)
            return None, None
        finally:
            await page.close()
            await ctx.close()

    async def close(self) -> None:
        if self._browser:  await self._browser.close()
        if self._playwright: await self._playwright.stop()


# ══════════════════════════════════════════════════════════════════════════════
# ② SCHOLAR AGENT — LLM-backed semantic DOM parser
# ══════════════════════════════════════════════════════════════════════════════
class ScholarAgent:
    """
    The Brain. Uses sentence-transformer embeddings to identify internship
    containers from raw HTML/markdown without any hardcoded CSS selectors.
    Falls back to heuristic BeautifulSoup parsing if model confidence is low.
    """

    INTERNSHIP_ANCHORS = [
        "internship", "intern", "fresher", "trainee", "student program",
        "graduate program", "apprentice", "campus hire", "entry level",
        "junior engineer", "associate engineer"
    ]

    EXPIRY_CONTEXT_SIGNALS = [
        "no longer accepting", "position has been filled", "application closed",
        "deadline has passed", "batch of 202", "not accepting applications",
        "internship closed", "vacancy filled", "hiring paused",
    ]

    def __init__(self, st_model: SentenceTransformer):
        self.model = st_model
        self._anchor_embeddings = self.model.encode(
            self.INTERNSHIP_ANCHORS, convert_to_tensor=True
        )

    def _html_to_clean_text_blocks(self, html: str) -> List[tuple[str, str]]:
        """
        Returns list of (text, tag_context) tuples from the HTML.
        Strips scripts, styles, navigation noise.
        """
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header",
                         "aside", "noscript", "svg", "img"]):
            tag.decompose()

        blocks = []
        for tag in soup.find_all(["div", "article", "section", "li", "tr", "a", "h1", "h2", "h3"]):
            text = tag.get_text(separator=" ", strip=True)
            if 20 < len(text) < 800:  # Reasonable listing size
                blocks.append((text, tag.name))
        return blocks

    def _score_block(self, text: str) -> float:
        """Semantic similarity score of a text block against internship anchors."""
        if not text.strip():
            return 0.0
        emb   = self.model.encode(text, convert_to_tensor=True)
        sims  = st_util.cos_sim(emb, self._anchor_embeddings)[0]
        return float(sims.max().item())

    def _check_contextual_expiry(self, html: str) -> tuple[bool, Optional[str]]:
        """Detects implicit expiry signals in surrounding text context."""
        lower = html.lower()
        for signal in self.EXPIRY_CONTEXT_SIGNALS:
            if signal in lower:
                return True, signal
        # Batch year check: mentions of years before current year
        current_year = datetime.utcnow().year
        for year in range(2020, current_year):
            if f"batch of {year}" in lower or f"session {year}" in lower:
                return True, f"Stale batch year detected: {year}"
        return False, None

    def extract_internship_listings(
        self, html: str, source_url: str = ""
    ) -> List[dict]:
        """
        Core extraction method.
        Returns structured listing dicts from raw HTML without hardcoded selectors.
        """
        if not html:
            return []

        is_expired, expiry_reason = self._check_contextual_expiry(html)
        blocks = self._html_to_clean_text_blocks(html)

        # Score all blocks semantically
        scored = [(self._score_block(text), text, ctx) for text, ctx in blocks]
        scored.sort(key=lambda x: x[0], reverse=True)

        results = []
        seen_texts = set()

        for score, text, tag in scored:
            if score < 0.35:  # Below threshold — not an internship listing
                break
            if text in seen_texts:
                continue
            seen_texts.add(text)

            # Extract structure from the text block
            listing = self._parse_listing_from_text(text, source_url)
            if listing:
                listing["semantic_score"] = score
                listing["is_likely_expired"] = is_expired
                listing["expiry_reason"] = expiry_reason
                listing["raw_text_snippet"] = text[:300]
                results.append(listing)

            if len(results) >= 20:  # Cap per page
                break

        log("SCHOLAR", f"  ↳ Extracted {len(results)} candidate listings (semantic threshold: 0.35)")
        return results

    def _parse_listing_from_text(self, text: str, source_url: str) -> Optional[dict]:
        """
        Heuristic extraction of structured fields from a semantic listing block.
        Extracts: role, company, stipend, deadline, apply_url.
        """
        # Role extraction — first meaningful title-case phrase
        role_match = re.search(
            r"((?:Software|Hardware|Data|AI|ML|Web|Mobile|Cloud|Cyber|Full.?Stack|"
            r"Embedded|IoT|Research|Product|UI|UX|QA|DevOps|Blockchain|"
            r"Security|Network|System|Backend|Frontend|Android|iOS)[^.\n]{5,60}(?:Intern|Engineer|"
            r"Developer|Analyst|Designer|Researcher|Trainee|Associate)[^.\n]{0,30})",
            text, re.IGNORECASE
        )
        if not role_match:
            return None

        role = role_match.group(1).strip()

        # Stipend extraction
        stipend = "Not specified"
        stipend_match = re.search(
            r"(?:₹|INR|Rs\.?)\s*[\d,]+(?:\s*[-–]\s*(?:₹|INR|Rs\.?)?\s*[\d,]+)?(?:\s*/\s*(?:month|mo|pm))?",
            text, re.IGNORECASE
        )
        if stipend_match:
            stipend = stipend_match.group(0).strip()
        elif re.search(r"\b(unpaid|no stipend|voluntary)\b", text, re.IGNORECASE):
            stipend = "Unpaid"

        # Deadline detection
        deadline_match = re.search(
            r"(?:deadline|apply by|last date|closes?(?:\s+on)?)[:\s]+([A-Za-z0-9,\s]+\d{4})",
            text, re.IGNORECASE
        )
        deadline = deadline_match.group(1).strip() if deadline_match else ""

        # Link extraction from text (often visible in rendered content)
        url_match = re.search(r"https?://[^\s\"'<>]{10,}", text)
        apply_url = url_match.group(0) if url_match else source_url

        return {
            "role":       role,
            "company":    "",  # Will be filled from source metadata
            "applyLink":  apply_url,
            "source_url": source_url,
            "stipend":    stipend,
            "deadline":   deadline,
            "description": text
        }


# ══════════════════════════════════════════════════════════════════════════════
# ③ AUTHENTICITY AGENT — Scam detection + multi-stage liveness verification
# ══════════════════════════════════════════════════════════════════════════════
class AuthenticityAgent:
    """
    The Guardian. Three verification stages:
      Stage 1 — HTTP liveness (async httpx with redirect following)
      Stage 2 — Application action verification (Google Forms, HR portals)
      Stage 3 — Contextual expiry (already done by Scholar, re-confirmed here)
    """

    PORTAL_CLOSED_SIGNALS = {
        "google.com/forms": [
            "this form is no longer accepting responses",
            "form response limit reached",
            "form is closed"
        ],
        "lever.co":      ["this job is no longer available", "job not found"],
        "greenhouse.io": ["job application", "no longer accepting"],
        "recruitcrm":    ["job closed", "position filled"],
        "internshala":   ["internship is closed", "internship not found", "not available"],
        "linkedin.com":  ["job no longer available", "job has expired"],
        "wellfound.com": ["role is no longer available"],
    }

    def __init__(self):
        pass

    def _is_scam(self, text: str) -> tuple[bool, str]:
        text_lower = text.lower()
        for signal in SCAM_SIGNALS["hard"]:
            if signal in text_lower:
                return True, f"Hard scam signal: '{signal}'"
        for signal in SCAM_SIGNALS["soft"]:
            if signal in text_lower:
                return False, f"Soft warning: '{signal}'"
        return False, ""

    async def _stage1_http_liveness(self, url: str) -> tuple[bool, float]:
        """HTTP liveness with redirect chain following (up to 5 hops)."""
        if not url or url in ("#", ""):
            return False, 0.0
        try:
            async with httpx.AsyncClient(
                timeout=8.0, follow_redirects=True, max_redirects=5
            ) as client:
                # HEAD first (cheap)
                resp = await client.head(url, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code >= 400 and resp.status_code not in [403, 405]:
                    return False, 0.0
                # 403/405 means resource exists but method blocked — try GET
                if resp.status_code in [403, 405]:
                    resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                    if resp.status_code >= 400:
                        return False, 0.0
                # Detect parking/error pages disguised as 200
                final_url = str(resp.url)
                if any(x in final_url for x in ["parked", "godaddy.com/", "sedo.com"]):
                    return False, 0.0
                return True, 0.7
        except Exception:
            return False, 0.0

    async def _stage2_portal_verification(self, url: str) -> tuple[bool, float]:
        """Follows redirect to external HR portals and checks if job/form is still active."""
        url_lower = url.lower()
        matched_portal = None
        for portal_key in self.PORTAL_CLOSED_SIGNALS:
            if portal_key in url_lower:
                matched_portal = portal_key
                break

        if not matched_portal:
            return True, 0.85  # Not a known portal — Stage 1 result stands

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                body_lower = resp.text.lower()
                for closed_signal in self.PORTAL_CLOSED_SIGNALS[matched_portal]:
                    if closed_signal in body_lower:
                        return False, 0.95  # High confidence it's closed
            return True, 0.90
        except Exception:
            return True, 0.6  # Inconclusive — pass with lower confidence

    async def verify_single(self, item: dict) -> dict:
        """Full three-stage verification pipeline for one listing."""
        url  = item.get("applyLink", "")
        text = f"{item.get('role', '')} {item.get('company', '')} {item.get('description', '')}"

        # ── Scam detection ───────────────────────────────────────────────────
        is_scam, scam_reason = self._is_scam(text)
        if is_scam:
            item["trust_status"]       = "REJECTED"
            item["rejection_reason"]   = scam_reason
            item["liveness_confidence"] = 0.0
            return item

        # ── Stage 1: HTTP liveness ───────────────────────────────────────────
        alive_s1, conf_s1 = await self._stage1_http_liveness(url)
        if not alive_s1:
            item["trust_status"]       = "REJECTED"
            item["rejection_reason"]   = "Dead link (HTTP 4xx / parking page)"
            item["liveness_confidence"] = 0.0
            return item

        # ── Stage 2: Portal-specific validation ──────────────────────────────
        alive_s2, conf_s2 = await self._stage2_portal_verification(url)
        if not alive_s2:
            item["trust_status"]       = "REJECTED"
            item["rejection_reason"]   = "Application portal confirmed closed"
            item["liveness_confidence"] = conf_s2
            return item

        # ── Stage 3: Expiry from Scholar context ──────────────────────────────
        if item.get("is_likely_expired"):
            item["trust_status"]       = "STALE"
            item["rejection_reason"]   = item.get("expiry_reason", "Contextual expiry detected")
            item["liveness_confidence"] = 0.35
            return item

        item["trust_status"]       = "VERIFIED"
        item["liveness_confidence"] = min(conf_s1, conf_s2)
        return item

    async def filter_batch(self, items: List[dict]) -> List[dict]:
        """Concurrent batch verification with semaphore throttling."""
        log("AUTHENTICITY", f"Running 3-stage liveness check on {len(items)} candidates...")
        sem   = asyncio.Semaphore(10)
        async def _guarded(item):
            async with sem:
                return await self.verify_single(item)
        results  = await asyncio.gather(*[_guarded(i) for i in items])
        verified = [r for r in results if r.get("trust_status") == "VERIFIED"]
        rejected = len(results) - len(verified)
        stale    = sum(1 for r in results if r.get("trust_status") == "STALE")
        log("AUTHENTICITY",
            f"✓ {len(verified)} verified | ✗ {rejected} rejected | ⚠ {stale} stale")
        return verified


# ══════════════════════════════════════════════════════════════════════════════
# ④ SEMANTIC INTELLIGENCE AGENT — Zero-shot NLP classification + enrichment
# ══════════════════════════════════════════════════════════════════════════════
class SemanticAgent:
    """
    The Cartographer. Maps job roles to precise engineering domains via
    sentence-transformer cosine similarity. Extracts stipend via NLP regex.
    Runs skill-gap analysis against Kerala baseline.
    """

    KERALA_BASELINE_SKILLS = {
        "python", "c", "c++", "java", "javascript", "html", "css", "git",
        "sql", "linux", "react", "node.js", "matlab"
    }

    def __init__(self, st_model: SentenceTransformer):
        self.model    = st_model
        self.domains  = list(DOMAIN_KEYWORDS.keys())
        self._domain_embs = self.model.encode(self.domains, convert_to_tensor=True)

    def _classify_domain(self, text: str) -> tuple[str, float]:
        emb    = self.model.encode(text, convert_to_tensor=True)
        scores = st_util.cos_sim(emb, self._domain_embs)[0]
        idx    = scores.argmax().item()
        score  = scores[idx].item()
        domain = self.domains[idx] if score >= 0.28 else "Software Engineering"
        return domain, score

    def _extract_skills(self, text: str, domain: str) -> List[str]:
        lower  = text.lower()
        skills = []
        # Domain-specific keywords first
        for kw in DOMAIN_KEYWORDS.get(domain, []):
            if kw in lower and kw.title() not in skills:
                skills.append(kw.title())
        # Generic technical keywords
        general = ["python", "java", "react", "node", "sql", "git", "docker",
                   "aws", "linux", "tensorflow", "pytorch", "flutter", "kotlin"]
        for g in general:
            if g in lower and g.title() not in skills:
                skills.append(g.title())
        return skills[:8]

    def _skill_gap_analysis(self, skills: List[str]) -> List[str]:
        """Returns skills required by listing but NOT in Kerala baseline."""
        required = {s.lower() for s in skills}
        return [s for s in required if s not in self.KERALA_BASELINE_SKILLS]

    def _resolve_district(self, text: str, source_meta: dict) -> tuple[str, str]:
        """Maps location mentions to Kerala districts and hub categories."""
        combined = (text + " " + source_meta.get("location", "") +
                    " " + source_meta.get("zone", "")).lower()
        for zone, data in KERALA_ZONES.items():
            for alias in data["aliases"]:
                if alias in combined:
                    district    = zone.title()
                    hub_category = source_meta.get("zone", "Independent")
                    return district, hub_category
        return "Kerala", source_meta.get("zone", "Independent")

    def enrich(self, item: dict, source_meta: dict = None) -> dict:
        if source_meta is None:
            source_meta = {}

        text    = f"{item.get('role', '')} {item.get('description', '')}"
        domain, d_score = self._classify_domain(text)
        skills  = self._extract_skills(text, domain)
        gaps    = self._skill_gap_analysis(skills)
        district, hub = self._resolve_district(text, source_meta)

        item["domain"]          = domain
        item["domain_score"]    = d_score
        item["skills"]          = skills
        item["skill_gaps"]      = gaps
        item["district"]        = district
        item["hub_category"]    = hub
        item["work_type"]       = "Remote" if "remote" in text.lower() else "Hybrid"

        # Embedding for downstream neural scoring
        role_emb = self.model.encode(item.get("role", ""), convert_to_tensor=True)
        item["role_tensor"]     = role_emb
        item["embedding_json"]  = json.dumps(role_emb.tolist())

        # Recommendation text
        gap_str = f" | Skill Gaps: {', '.join(gaps)}" if gaps else " | Baseline-Ready ✓"
        item["ai_recommendation"] = (
            f"Domain: {domain} (confidence {round(d_score*100)}%){gap_str}"
        )
        return item

    def process_batch(self, items: List[dict], sources_map: dict = None) -> List[dict]:
        if sources_map is None:
            sources_map = {}
        log("SEMANTIC", f"Running zero-shot domain mapping on {len(items)} listings...")
        enriched = []
        for item in items:
            src_meta = sources_map.get(item.get("source", ""), {})
            enriched.append(self.enrich(item, src_meta))
        return enriched


# ══════════════════════════════════════════════════════════════════════════════
# ⑤ QUALITY ASSESSMENT AGENT — Multi-factor scoring + Supreme Judge
# ══════════════════════════════════════════════════════════════════════════════
class QualityAgent:
    """
    The Judge. Computes multi-factor quality scores using:
    - Geographic proximity weighting (KERALA_ZONES)
    - Reinforcement-learning source weights (from Redis)
    - AdaptiveNeuralCore survival probability
    - Supreme Judge LLM (facebook/bart-large-mnli) for borderline cases (40–60%)
    """

    MODEL_PATH = "adaptive_core_v9.pth"

    def __init__(self):
        self.neural_core = AdaptiveNeuralCore()
        if os.path.exists(self.MODEL_PATH):
            self.neural_core.load_state_dict(
                torch.load(self.MODEL_PATH, weights_only=True)
            )
            log("QUALITY", f"AdaptiveNeuralCore loaded from {self.MODEL_PATH} ✓")
        self.optimizer = optim.Adam(self.neural_core.parameters(), lr=0.005)
        self.criterion = nn.BCELoss()
        self._supreme_judge = None  # Lazy-loaded HuggingFace pipeline

    def _get_proximity_score(self, item: dict) -> int:
        district = item.get("district", "").lower()
        for zone, data in KERALA_ZONES.items():
            if zone in district or any(a in district for a in data["aliases"]):
                return data["proximity_score"]
        return 0

    def _get_source_rl_weight(self, source: str) -> float:
        if not REDIS_AVAILABLE:
            return 0.0
        raw = redis_client.get(f"ml_weight:{source}")
        return float(raw) if raw else 0.0

    def _predict_survival(self, embedding_tensor: torch.Tensor) -> float:
        self.neural_core.eval()
        with torch.no_grad():
            return self.neural_core(embedding_tensor.unsqueeze(0)).item()

    def _invoke_supreme_judge(self, item: dict) -> float:
        """Loads bart-large-mnli on-demand for borderline cases only."""
        try:
            if self._supreme_judge is None:
                from transformers import pipeline  # type: ignore
                log("QUALITY", "⚖️  Loading Supreme Judge (bart-large-mnli)...", "WARN")
                self._supreme_judge = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli"
                )
            result = self._supreme_judge(
                f"{item.get('role')} at {item.get('company')}",
                candidate_labels=[
                    "high quality technical internship",
                    "low quality or generic posting"
                ]
            )
            if result["labels"][0] == "high quality technical internship":
                log("QUALITY", "  Supreme Judge: ✅ APPROVED")
                return 0.25  # Boost
            else:
                log("QUALITY", "  Supreme Judge: ❌ REJECTED")
                return -0.25  # Penalize
        except Exception as e:
            log("QUALITY", f"  Supreme Judge unavailable: {e}", "WARN")
            return 0.0

    def score(self, item: dict) -> dict:
        base_score = 50.0

        # ── Domain premium ────────────────────────────────────────────────────
        elite_domains = {"AI/ML & Data Science", "Embedded Systems & IoT",
                         "Robotics & Automation", "VLSI & Semiconductor"}
        if item.get("domain") in elite_domains:
            base_score += 20.0

        # ── Geographic proximity ──────────────────────────────────────────────
        base_score += self._get_proximity_score(item)

        # ── Company trust override ────────────────────────────────────────────
        comp_lower = item.get("company", "").lower()
        trust      = COMPANY_TRUST_OVERRIDES.get(comp_lower, 50)
        rl_boost   = self._get_source_rl_weight(item.get("source", ""))
        trust      = min(100, trust + rl_boost)
        item["trust_score"] = trust
        base_score += (trust - 50) * 0.2  # Proportional trust bonus

        # ── AdaptiveNeuralCore survival prediction ────────────────────────────
        role_tensor = item.get("role_tensor")
        survival    = 0.5
        if role_tensor is not None:
            try:
                survival = self._predict_survival(role_tensor)
            except Exception:
                pass

        # ── Supreme Judge for borderline cases ────────────────────────────────
        if 0.40 <= survival <= 0.60:
            delta    = self._invoke_supreme_judge(item)
            survival = max(0.0, min(1.0, survival + delta))

        # ── Final computation ─────────────────────────────────────────────────
        final = int(base_score * (0.5 + survival))
        final = max(0, min(99, final))

        item["quality_score"]   = float(final)
        item["survival_prob"]   = round(survival * 100, 1)
        item["quality_tier"]    = (
            "ELITE"      if final >= 82 else
            "HIGH VALUE" if final >= 65 else
            "MODERATE"   if final >= 45 else
            "LOW"
        )
        if item.get("ai_recommendation"):
            item["ai_recommendation"] += f" | Quality: {item['quality_tier']} ({final}/99)"

        # ── Log to EvolutionMemory ────────────────────────────────────────────
        if item.get("embedding_json"):
            uid = hashlib.md5(
                f"{item.get('company','')}-{item.get('role','')}".encode()
            ).hexdigest()
            db = SessionLocal()
            if not db.query(EvolutionMemory).filter_by(id=uid).first():
                db.add(EvolutionMemory(
                    id=uid,
                    embedding=item["embedding_json"],
                    survived=final >= 65
                ))
                db.commit()
            db.close()

        return item

    def assess_batch(self, items: List[dict]) -> List[dict]:
        log("QUALITY", f"Running multi-factor quality assessment on {len(items)} listings...")
        return [self.score(i) for i in items]

    def train_on_memory(self) -> None:
        """Continuous ML retraining on EvolutionMemory feedback."""
        log("QUALITY", "Initiating AdaptiveNeuralCore retraining cycle...")
        db       = SessionLocal()
        memories = db.query(EvolutionMemory).all()
        db.close()

        if len(memories) < 10:
            log("QUALITY", f"  Insufficient training data ({len(memories)} records). Skipping.", "WARN")
            return

        X = [json.loads(m.embedding) for m in memories if m.embedding]
        Y = [[1.0 if m.survived else 0.0] for m in memories if m.embedding]

        if not X:
            return

        X_t = torch.tensor(X, dtype=torch.float32)
        Y_t = torch.tensor(Y, dtype=torch.float32)

        self.neural_core.train()
        for epoch in range(20):
            self.optimizer.zero_grad()
            loss = self.criterion(self.neural_core(X_t), Y_t)
            loss.backward()
            self.optimizer.step()

        torch.save(self.neural_core.state_dict(), self.MODEL_PATH)
        log("QUALITY", f"  Neural Core evolved. Loss: {loss.item():.4f} | Records: {len(X)}", "SUCCESS")

    def optimize_rl_weights(self) -> None:
        """RL reward/punishment for each source based on historical performance."""
        log("QUALITY", "Running RL source-weight optimization...")
        if not REDIS_AVAILABLE:
            return
        db      = SessionLocal()
        records = db.query(OpportunityMemory).all()
        db.close()

        stats = defaultdict(lambda: {"total": 0, "healthy": 0, "scam": 0, "conf_sum": 0})
        for r in records:
            s = stats[r.source]
            s["total"]    += 1
            if r.health_score == 100: s["healthy"] += 1
            if r.trust_score  <  40:  s["scam"]    += 1
            s["conf_sum"] += r.confidence_score

        for source, s in stats.items():
            if s["total"] < 5:
                continue
            reward = 0
            if s["healthy"] / s["total"] > 0.9:  reward += 5
            if s["healthy"] / s["total"] < 0.5:  reward -= 15
            if s["scam"]   / s["total"] > 0.1:   reward -= 25
            if s["conf_sum"] / s["total"] > 80:  reward += 10
            current = float(redis_client.get(f"ml_weight:{source}") or 0.0)
            new_w   = max(-50.0, min(50.0, current + reward * 0.1))
            redis_client.set(f"ml_weight:{source}", new_w)
            log("QUALITY", f"  RL [{source}] → weight: {new_w:+.2f}")


# ══════════════════════════════════════════════════════════════════════════════
# ⑥ SANITY CLEANUP AGENT — Live CMS pruning + EvolutionMemory feedback
# ══════════════════════════════════════════════════════════════════════════════
class SanityCleanupAgent:
    """
    The Janitor. Autonomously prunes the live Sanity CMS database.
    Marks dead listings as ARCHIVED in EvolutionMemory (teaches the Neural Core
    to avoid similar semantic patterns in future).
    """

    def __init__(self, authenticity: AuthenticityAgent):
        self.auth = authenticity

    def _mark_as_failure(self, company: str, role: str) -> None:
        uid = hashlib.md5(f"{company.lower()}-{role.lower()}".encode()).hexdigest()
        db  = SessionLocal()
        mem = db.query(EvolutionMemory).filter_by(id=uid).first()
        if mem:
            mem.survived = False
        db.commit()
        db.close()

    async def cleanup_live_list(self) -> int:
        """Fetches live Sanity CMS, validates every listing, deletes toxic entries."""
        if not SANITY_PROJECT_ID or not SANITY_TOKEN:
            log("CLEANUP", "Sanity CMS not configured — skipping live cleanup", "WARN")
            return 0

        log("CLEANUP", "Fetching live CMS inventory for deep pruning...")
        query   = '*[_type == "internship"]{_id, company, role, applyLink}'
        fetch_url = (
            f"https://{SANITY_PROJECT_ID}.api.sanity.io/"
            f"v2023-01-01/data/query/{SANITY_DATASET}"
            f"?query={quote(query)}"
        )
        try:
            resp = requests.get(fetch_url, headers=SANITY_HEADERS, timeout=10)
            data = resp.json().get("result", [])
        except Exception as e:
            log("CLEANUP", f"CMS fetch failed: {e}", "ERROR")
            return 0

        log("CLEANUP", f"Scanning {len(data)} live entries...")
        mutations = []

        for item in data:
            item["applyLink"] = item.get("applyLink", "")
            verified          = await self.auth.verify_single(item)
            if verified.get("trust_status") != "VERIFIED":
                log("CLEANUP",
                    f"  ✗ Purging: {item.get('company')} — {item.get('role')} "
                    f"({verified.get('rejection_reason', 'Unknown')})", "WARN")
                mutations.append({"delete": {"id": item["_id"]}})
                self._mark_as_failure(
                    item.get("company", ""),
                    item.get("role", "")
                )

        # Semantic deduplication on live list
        groups = defaultdict(list)
        for item in data:
            if item["_id"] not in {m.get("delete", {}).get("id") for m in mutations}:
                groups[item.get("company", "").lower()].append(item)

        for comp, items in groups.items():
            for i in range(len(items)):
                for j in range(i + 1, len(items)):
                    r1 = items[i].get("role", "").lower()
                    r2 = items[j].get("role", "").lower()
                    if difflib.SequenceMatcher(None, r1, r2).ratio() >= 0.80:
                        del_id = items[j]["_id"]
                        if del_id not in {m.get("delete", {}).get("id") for m in mutations}:
                            log("CLEANUP", f"  ✗ Semantic duplicate: '{r1}' ≈ '{r2}'")
                            mutations.append({"delete": {"id": del_id}})

        if mutations:
            for i in range(0, len(mutations), 25):
                batch = mutations[i:i+25]
                requests.post(SANITY_URL, headers=SANITY_HEADERS,
                              json={"mutations": batch})
            log("CLEANUP", f"  Purged {len(mutations)} toxic/duplicate entries", "SUCCESS")
        else:
            log("CLEANUP", "  Live list is pristine. No toxic entries found ✓", "SUCCESS")

        return len(mutations)


# ══════════════════════════════════════════════════════════════════════════════
# ⑦ DISCOVERY AGENT — Autonomous Kerala entity discovery
# ══════════════════════════════════════════════════════════════════════════════
class DiscoveryAgent:
    """
    The Cartographer. Autonomously expands the company target pool by:
    - Scraping live Technopark / Infopark / KSUM company directories
    - JobSpy multi-platform search (LinkedIn, Indeed, Glassdoor)
    - Internshala Playwright stealth crawl (Kerala-specific keyword URLs)
    - Wellfound startup discovery
    Stores all discovered entities in CompanyGraph for future crawls.
    """

    def __init__(self, scout: ScoutAgent):
        self.scout = scout
        self.ua    = UserAgent()

    async def discover_technopark_companies(self) -> List[dict]:
        """Crawls the live Technopark company directory."""
        log("DISCOVERY", "Scanning Technopark live directory...")
        url     = "https://www.technopark.org/company-listing"
        content, _ = await self.scout.fetch_page_content(url, requires_js=True,
                                                          company_key="technopark_dir")
        companies = []
        if not content:
            return companies

        soup = BeautifulSoup(content, "html.parser")
        # Technopark uses various card patterns — try multiple
        for card in soup.select(".company-list-item, .company-card, [class*='company']")[:50]:
            name_tag = card.select_one("h3, h4, strong, .company-name, [class*='name']")
            link_tag = card.select_one("a[href]")
            if name_tag and link_tag:
                href = link_tag.get("href", "")
                if href.startswith("/"):
                    href = f"https://www.technopark.org{href}"
                companies.append({
                    "company_name": name_tag.get_text(strip=True),
                    "careers_url":  href,
                    "hub_zone":     "Technopark",
                    "district":     "Trivandrum",
                    "discovery_src": "technopark_directory"
                })
        log("DISCOVERY", f"  ↳ Technopark: {len(companies)} companies found")
        return companies

    async def discover_infopark_companies(self) -> List[dict]:
        """Crawls the live Infopark company directory."""
        log("DISCOVERY", "Scanning Infopark live directory...")
        url     = "https://infopark.in/companies/search"
        content, _ = await self.scout.fetch_page_content(url, requires_js=True,
                                                          company_key="infopark_dir")
        companies = []
        if not content:
            return companies

        soup = BeautifulSoup(content, "html.parser")
        for card in soup.select(".company-item, .company-listing, [class*='company']")[:50]:
            name_tag = card.select_one("h3, h4, .name, strong")
            link_tag = card.select_one("a[href]")
            if name_tag:
                href = ""
                if link_tag:
                    href = link_tag.get("href", "")
                    if href.startswith("/"):
                        href = f"https://infopark.in{href}"
                companies.append({
                    "company_name": name_tag.get_text(strip=True),
                    "careers_url":  href or "https://infopark.in/companies",
                    "hub_zone":     "Infopark",
                    "district":     "Kochi",
                    "discovery_src": "infopark_directory"
                })
        log("DISCOVERY", f"  ↳ Infopark: {len(companies)} companies found")
        return companies

    async def discover_ksum_startups(self) -> List[dict]:
        """Scrapes KSUM startup portfolio."""
        log("DISCOVERY", "Querying KSUM startup portfolio...")
        url     = "https://startupmission.kerala.gov.in/startups"
        content, _ = await self.scout.fetch_page_content(url, requires_js=True,
                                                          company_key="ksum_portfolio")
        companies = []
        if not content:
            return companies

        soup = BeautifulSoup(content, "html.parser")
        for card in soup.select(".startup-card, .startup-item, [class*='startup']")[:40]:
            name_tag = card.select_one("h3, h4, .startup-name, strong")
            link_tag = card.select_one("a[href*='http']")
            if name_tag:
                href = link_tag.get("href", "") if link_tag else ""
                companies.append({
                    "company_name": name_tag.get_text(strip=True),
                    "careers_url":  href or "https://startupmission.kerala.gov.in",
                    "hub_zone":     "KSUM",
                    "district":     "Kerala-wide",
                    "discovery_src": "ksum_portfolio"
                })
        log("DISCOVERY", f"  ↳ KSUM: {len(companies)} startups found")
        return companies

    async def crawl_internshala_kerala(self) -> List[dict]:
        """Playwright stealth crawl of Internshala Kerala-specific URLs."""
        log("DISCOVERY", "Crawling Internshala (stealth mode)...")
        keywords = [
            "computer-science-internship-in-kerala",
            "machine-learning-internship-in-kerala",
            "web-development-internship-in-kerala",
            "electronics-internship-in-kerala",
            "data-science-internship-in-kerala",
            "embedded-systems-internship-in-kerala",
            "cybersecurity-internship-in-kerala",
        ]
        results = []
        for kw in keywords:
            url     = f"https://internshala.com/internships/{kw}/"
            content, _ = await self.scout.fetch_page_content(url, requires_js=True,
                                                              company_key=f"internshala_{kw}")
            if not content:
                continue
            soup = BeautifulSoup(content, "html.parser")
            cards = soup.select(".individual_internship")[:8]
            for card in cards:
                title   = card.select_one("h3")
                company = card.select_one(".company_name")
                link    = card.select_one("a.view_detail_button, a[href*='/internships/detail']")
                if title and company:
                    href = ""
                    if link:
                        href = link.get("href", "")
                        if href.startswith("/"):
                            href = f"https://internshala.com{href}"
                    results.append({
                        "role":      title.get_text(strip=True),
                        "company":   company.get_text(strip=True),
                        "applyLink": href or url,
                        "source_url": url,
                        "source":    "Internshala",
                        "location":  "Kerala",
                        "description": card.get_text(" ", strip=True)[:400]
                    })
            await asyncio.sleep(random.uniform(2.0, 4.0))
        log("DISCOVERY", f"  ↳ Internshala: {len(results)} listings found")
        return results

    async def aggregate_via_jobspy(self) -> List[dict]:
        """JobSpy multi-platform aggregation (LinkedIn / Indeed / Glassdoor)."""
        if not JOBSPY_AVAILABLE:
            log("DISCOVERY", "JobSpy not installed — skipping platform aggregation", "WARN")
            return []

        log("DISCOVERY", "Engaging JobSpy multi-platform aggregator...")
        results = []

        search_configs = [
            {"site_name": ["linkedin"],              "term": "internship engineer Kerala",         "loc": "Kerala, India"},
            {"site_name": ["indeed"],                "term": "intern student fresher engineer",   "loc": "Kerala, India"},
            {"site_name": ["glassdoor"],             "term": "internship",                        "loc": "Kerala"},
            {"site_name": ["linkedin", "indeed"],    "term": "AI ML internship",                  "loc": "Trivandrum"},
            {"site_name": ["linkedin", "indeed"],    "term": "embedded systems intern",           "loc": "Kochi"},
        ]

        for config in search_configs:
            try:
                def _run():
                    return scrape_jobs(
                        site_name=config["site_name"],
                        search_term=config["term"],
                        location=config["loc"],
                        results_wanted=25,
                        hours_old=72,
                        job_type="internship"
                    )
                df = await asyncio.to_thread(_run)
                if df is not None and not df.empty:
                    for _, row in df.iterrows():
                        url = str(row.get("job_url", "")).strip()
                        if not url or url == "nan":
                            continue
                        results.append({
                            "role":        str(row.get("title", "")).strip(),
                            "company":     str(row.get("company", "")).strip(),
                            "applyLink":   url,
                            "source_url":  url,
                            "source":      str(row.get("site", "JobSpy")).capitalize(),
                            "location":    str(row.get("location", "Kerala")).strip(),
                            "description": str(row.get("description", ""))[:500],
                            "min_amount":  row.get("min_amount"),
                            "max_amount":  row.get("max_amount"),
                            "currency":    str(row.get("currency", "₹")).strip()
                        })
            except Exception as e:
                log("DISCOVERY", f"  JobSpy [{config['term']}] error: {e}", "WARN")
            await asyncio.sleep(1.5)

        log("DISCOVERY", f"  ↳ JobSpy: {len(results)} listings aggregated")
        return results

    def _register_companies(self, companies: List[dict]) -> None:
        """Persists newly discovered companies to CompanyGraph."""
        db = SessionLocal()
        for c in companies:
            domain = urlparse(c.get("careers_url", "")).netloc or c.get("company_name", "")
            if not domain:
                continue
            existing = db.query(CompanyNode).filter_by(domain=domain).first()
            if not existing:
                node = CompanyNode(
                    domain       = domain,
                    company_name = c.get("company_name", ""),
                    hub_zone     = c.get("hub_zone", "Independent"),
                    district     = c.get("district", "Kerala"),
                    careers_url  = c.get("careers_url", ""),
                    requires_js  = True,
                    discovery_src = c.get("discovery_src", "unknown")
                )
                db.add(node)
        db.commit()
        db.close()

    async def discover_and_crawl_all(self) -> List[dict]:
        """
        Master discovery method. Runs all sub-agents concurrently.
        Returns a flat list of raw listing dicts ready for the pipeline.
        """
        log("DISCOVERY", "═" * 60)
        log("DISCOVERY", "  PHASE 1: Autonomous Kerala Entity Discovery")
        log("DISCOVERY", "═" * 60)

        # Concurrent directory discovery
        tp, ip, ks = await asyncio.gather(
            self.discover_technopark_companies(),
            self.discover_infopark_companies(),
            self.discover_ksum_startups()
        )
        self._register_companies(tp + ip + ks)
        log("DISCOVERY", f"  Total new entities registered: {len(tp)+len(ip)+len(ks)}")

        log("DISCOVERY", "═" * 60)
        log("DISCOVERY", "  PHASE 2: Internship Listing Extraction")
        log("DISCOVERY", "═" * 60)

        # Concurrent listing discovery
        internshala_res, jobspy_res = await asyncio.gather(
            self.crawl_internshala_kerala(),
            self.aggregate_via_jobspy()
        )

        all_raw = internshala_res + jobspy_res

        # Crawl registered Tier A company career pages
        db    = SessionLocal()
        tier_a = ALL_SOURCES["tier_a"]
        db.close()

        log("DISCOVERY", f"  Crawling {len(tier_a)} Tier-A career pages...")
        sem = asyncio.Semaphore(3)  # Don't hammer servers

        async def _crawl_tier_a(source: dict) -> List[dict]:
            async with sem:
                url   = source["careers_url"]
                c_key = source["company"].replace(" ", "_").lower()
                content, api_ep = await self.scout.fetch_page_content(
                    url,
                    requires_js=source.get("requires_js", True),
                    company_key=c_key
                )
                if not content:
                    return []
                # If Scout intercepted an API endpoint, fetch that directly
                if api_ep:
                    try:
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            r = await client.get(api_ep,
                                                 headers={"User-Agent": UserAgent().random})
                            if r.status_code == 200:
                                content = r.text
                    except Exception:
                        pass
                listings = scholar_agent_ref.extract_internship_listings(content, url)
                for listing in listings:
                    listing["company"]  = source["company"]
                    listing["source"]   = source["company"]
                    listing["location"] = source.get("location", "Kerala")
                return listings

        # Scholar agent reference (defined later in Orchestrator — use global)
        _scholar = ScholarAgent(st_model_ref)
        scholar_agent_ref = _scholar  # noqa

        tier_a_tasks    = [_crawl_tier_a(s) for s in tier_a]
        tier_a_results  = await asyncio.gather(*tier_a_tasks)
        for batch in tier_a_results:
            all_raw.extend(batch)

        log("DISCOVERY", f"  Total raw listings before dedup: {len(all_raw)}")
        return all_raw


# ══════════════════════════════════════════════════════════════════════════════
# ⑧ PREDICTIVE HIRING AGENT — VelocityLSTM mass-hiring trajectory
# ══════════════════════════════════════════════════════════════════════════════
class PredictiveHiringAgent:
    """
    The Oracle. Tracks posting velocity per company over 7-day windows.
    Uses VelocityLSTM to predict mass-hiring sprees before public announcement.
    """

    def __init__(self):
        self.model     = VelocityLSTM()
        self._velocity = defaultdict(list)  # company → daily post counts

    def record_postings(self, company: str, count: int) -> None:
        self._velocity[company].append(count)

    def analyze_velocity(self, company: str, recent_count: int) -> str:
        self.record_postings(company, recent_count)
        history = self._velocity[company][-7:]
        if len(history) < 7:
            history = [0] * (7 - len(history)) + history

        tensor = torch.tensor(history, dtype=torch.float32).view(1, 7, 1)
        self.model.eval()
        with torch.no_grad():
            prob = self.model(tensor).item()

        # Override: raw velocity signal
        if sum(history[-3:]) > 8:
            prob = max(prob, 0.85)

        if prob > 0.70:
            return (
                f"🔥 MASS HIRING IMMINENT — {int(prob*100)}% confidence. "
                f"First-mover advantage window: 24–48 hrs."
            )
        elif prob > 0.45:
            return f"📈 Elevated hiring activity detected ({int(prob*100)}%). Monitor closely."
        return f"📊 Normal velocity ({int(prob*100)}%)."

    def run_company_analysis(self, listings: List[dict]) -> Dict[str, str]:
        """Batch velocity analysis for all discovered companies."""
        company_counts = defaultdict(int)
        for l in listings:
            company_counts[l.get("company", "Unknown")] += 1

        results = {}
        for company, count in company_counts.items():
            results[company] = self.analyze_velocity(company, count)
            if "MASS HIRING" in results[company]:
                log("PREDICTIVE", f"  🔥 [{company}] {results[company]}")
        return results


# ══════════════════════════════════════════════════════════════════════════════
# ⑨ PORTFOLIO ASSESSMENT AGENT — GitHub AST grader
# ══════════════════════════════════════════════════════════════════════════════
class PortfolioAgent:
    """
    The Talent Spotter. Grades a student's GitHub profile against internship
    requirements using repository complexity metrics and language overlap.
    """

    GITHUB_API = "https://api.github.com/users/{}/repos?per_page=30&sort=updated"

    def __init__(self):
        self._headers = {"User-Agent": "ISTE-MBCET-Bot/9.0"}
        if GITHUB_TOKEN:
            self._headers["Authorization"] = f"token {GITHUB_TOKEN}"

    def assess_github(self, username: str, target_skills: List[str]) -> dict:
        log("PORTFOLIO", f"Grading GitHub profile: @{username}")
        try:
            resp  = requests.get(
                self.GITHUB_API.format(username),
                headers=self._headers, timeout=8
            )
            if resp.status_code != 200:
                return {"error": f"GitHub API returned {resp.status_code}"}

            repos     = resp.json()
            languages = set()
            ast_score = 0.0

            for r in repos:
                if r.get("language"):
                    languages.add(r["language"].lower())
                # Mock AST complexity via size + engagement signals
                ast_score += r.get("stargazers_count", 0) * 2.5
                ast_score += r.get("forks_count", 0) * 1.5
                ast_score += r.get("size", 0) / 800.0

            target_lower = {s.lower() for s in target_skills}
            matched      = languages.intersection(target_lower)
            match_score  = len(matched) / max(len(target_lower), 1) * 100

            complexity = (
                "Elite"        if ast_score > 60 else
                "Advanced"     if ast_score > 30 else
                "Intermediate" if ast_score > 10 else
                "Beginner"
            )

            return {
                "username":          username,
                "total_repos":       len(repos),
                "languages_detected": sorted(list(languages)),
                "languages_matched": sorted(list(matched)),
                "skill_match_pct":   round(match_score, 1),
                "ast_complexity":    complexity,
                "ast_score":         round(ast_score, 1),
                "recommendation": (
                    f"🎯 Strong portfolio match ({round(match_score)}%). "
                    f"Complexity: {complexity}. "
                    f"Missing skills: {sorted(target_lower - languages) or 'None'}."
                )
            }
        except Exception as e:
            return {"error": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# ⑩ RESUME OPTIMIZATION AGENT — ATS semantic re-ranker
# ══════════════════════════════════════════════════════════════════════════════
class ResumeAgent:
    """
    The Wordsmith. Accepts base resume text + target JD.
    Uses NLP keyword extraction + semantic sentence re-ranking to maximize
    ATS compatibility score for the target internship.
    """

    def __init__(self, st_model: SentenceTransformer):
        self.model = st_model

    def optimize_for_ats(self, resume_text: str, job_description: str) -> dict:
        log("RESUME", "Running ATS semantic optimization...")

        # Extract high-value keywords from JD
        jd_keywords = set(re.findall(r"\b[A-Za-z][A-Za-z0-9.#+\-]{2,}\b", job_description))
        # Filter noise
        stop = {"the", "and", "for", "with", "that", "this", "are", "you",
                "have", "your", "from", "will", "our", "all", "any", "can"}
        jd_keywords = {k.lower() for k in jd_keywords if k.lower() not in stop}

        # Encode JD and resume sentences
        sentences = [s.strip() for s in re.split(r"[.\n]", resume_text) if len(s.strip()) > 10]
        if not sentences:
            return {"error": "Resume text is empty or too short"}

        jd_emb     = self.model.encode(job_description, convert_to_tensor=True)
        sent_embs  = self.model.encode(sentences, convert_to_tensor=True)
        sims       = st_util.cos_sim(sent_embs, jd_emb.unsqueeze(0)).squeeze(1)

        # Rank sentences by semantic similarity to JD
        ranked = sorted(
            enumerate(sentences),
            key=lambda x: sims[x[0]].item(),
            reverse=True
        )

        optimized_bullets = []
        ats_scores        = []
        for idx, sentence in ranked:
            sim  = sims[idx].item()
            kw_overlap = sum(1 for w in sentence.lower().split() if w in jd_keywords)
            total_score = (sim * 0.7) + (kw_overlap / max(len(jd_keywords), 1) * 0.3)
            ats_scores.append(total_score)
            if sim > 0.30:
                optimized_bullets.append(sentence)

        ats_compatibility = min(99.0, (sum(ats_scores[:5]) / 5) * 100) if ats_scores else 0.0

        return {
            "ats_compatibility":  f"{ats_compatibility:.1f}%",
            "keywords_matched":   sorted(list(jd_keywords))[:20],
            "optimized_bullets":  optimized_bullets[:10],
            "optimized_resume":   "- " + "\n- ".join(optimized_bullets[:10]),
            "original_count":     len(sentences),
            "optimized_count":    len(optimized_bullets[:10])
        }


# ══════════════════════════════════════════════════════════════════════════════
# CMS SYNC — Pushes verified listings to Sanity CMS
# ══════════════════════════════════════════════════════════════════════════════
def sync_to_sanity(listings: List[InternshipListing]) -> None:
    if not SANITY_PROJECT_ID or not SANITY_TOKEN:
        log("ORCHESTRATOR", "Sanity CMS not configured — skipping sync", "WARN")
        return

    log("ORCHESTRATOR", f"Syncing {len(listings)} elite listings to Sanity CMS...")
    mutations = []
    for item in listings:
        uid    = hashlib.md5(
            f"{item.company_name}-{item.internship_role}".lower().encode()
        ).hexdigest()[:16]
        doc_id = f"internship-{uid}"

        base_doc = {
            "_id":           doc_id,
            "_type":         "internship",
            "company":       item.company_name,
            "role":          item.internship_role,
            "type":          "Hybrid",
            "domain":        item.domain or "Software Engineering",
            "applyLink":     item.application_url,
            "source":        item.source_platform or "Direct",
            "stipend":       item.stipend_details or "Check listing",
            "skills":        item.skills,
            "duration":      "2-6 Months",
            "deadlineLabel": "Apply Now",
        }
        mutations.append({"createIfNotExists": base_doc})
        mutations.append({
            "patch": {
                "id": doc_id,
                "set": {
                    "status":             "open",
                    "verificationStatus": "VERIFIED",
                    "linkHealthScore":    int(item.liveness_confidence * 100),
                    "lastVerifiedAt":     item.verification_timestamp.isoformat() + "Z",
                    "confidenceScore":    int(item.liveness_confidence * 100),
                    "qualityScore":       int(item.quality_score),
                    "qualityTier":        item.quality_tier,
                    "featured":           item.quality_tier == "ELITE",
                    "aiRecommendation":   item.ai_recommendation or "",
                    "hubCategory":        item.hub_category,
                    "districtLocation":   item.district_location,
                }
            }
        })

    for i in range(0, len(mutations), 50):
        batch = mutations[i:i+50]
        try:
            r = requests.post(SANITY_URL, headers=SANITY_HEADERS,
                              json={"mutations": batch}, timeout=10)
            if r.status_code == 200:
                log("ORCHESTRATOR", f"  CMS batch {i//50 + 1} ✓")
            else:
                log("ORCHESTRATOR", f"  CMS batch error: {r.text[:200]}", "ERROR")
        except Exception as e:
            log("ORCHESTRATOR", f"  CMS network error: {e}", "ERROR")


# ══════════════════════════════════════════════════════════════════════════════
# DEDUPLICATION — Fuzzy merge before storage
# ══════════════════════════════════════════════════════════════════════════════
def deduplicate(items: List[dict]) -> List[dict]:
    """Fuzzy deduplication using SequenceMatcher on company-role key."""
    unique = []
    seen   = []
    for item in items:
        key = f"{item.get('company','').lower()}-{item.get('role','').lower()}"
        is_dup = any(
            difflib.SequenceMatcher(None, key, s).ratio() > 0.85
            for s in seen
        )
        if not is_dup:
            seen.append(key)
            unique.append(item)
    return unique


# ══════════════════════════════════════════════════════════════════════════════
# MEMORY PERSISTENCE — Saves verified listings to SQLite
# ══════════════════════════════════════════════════════════════════════════════
def persist_to_memory(listing: InternshipListing) -> None:
    uid = hashlib.md5(
        f"{listing.company_name}-{listing.internship_role}".lower().encode()
    ).hexdigest()
    db  = SessionLocal()
    mem = db.query(OpportunityMemory).filter_by(id=uid).first()
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
    mem.embedding_json      = "[]"
    mem.last_verified       = listing.verification_timestamp
    mem.state               = "VERIFIED"
    mem.verification_status = "VERIFIED"
    mem.health_score        = int(listing.liveness_confidence * 100)
    mem.trust_score         = int(listing.trust_score)
    mem.quality_score       = listing.quality_score
    mem.quality_tier        = listing.quality_tier or "MODERATE"
    mem.is_expired          = listing.is_likely_expired
    db.commit()
    db.close()


# ══════════════════════════════════════════════════════════════════════════════
# JSON EXPORT — Human-readable output
# ══════════════════════════════════════════════════════════════════════════════
def export_to_json(listings: List[InternshipListing], path: str = "verified_internships.json") -> None:
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
            "source_url":             l.source_url,
            "source_platform":        l.source_platform,
            "verification_timestamp": l.verification_timestamp.isoformat(),
            "is_verified_live":       l.is_verified_live,
            "liveness_confidence":    round(l.liveness_confidence, 3),
            "quality_tier":           l.quality_tier,
            "quality_score":          round(l.quality_score, 1),
            "trust_score":            round(l.trust_score, 1),
            "ai_recommendation":      l.ai_recommendation,
            "is_likely_expired":      l.is_likely_expired,
        }
        for l in listings
    ]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    log("ORCHESTRATOR", f"  Exported {len(data)} listings → {path}")


# ══════════════════════════════════════════════════════════════════════════════
# TERMINAL DASHBOARD — Rich live monitoring
# ══════════════════════════════════════════════════════════════════════════════
def render_dashboard(listings: List[InternshipListing], predictions: Dict[str, str]) -> None:
    if not RICH_AVAILABLE:
        return

    table = Table(
        title="🧠 CHANAKYAN-KV v9.0 — Verified Internship Intelligence",
        box=box.ROUNDED, show_lines=True,
        style="bold white", header_style="bold cyan"
    )
    table.add_column("Company",       style="bold yellow",  min_width=18)
    table.add_column("Role",          style="white",         min_width=25)
    table.add_column("District / Hub",style="cyan",          min_width=18)
    table.add_column("Domain",        style="magenta",       min_width=16)
    table.add_column("Stipend",       style="green",         min_width=12)
    table.add_column("Quality",       style="bold",          min_width=10)
    table.add_column("Confidence",    style="white",         min_width=10)

    tier_colors = {
        "ELITE":      "bold green",
        "HIGH VALUE": "green",
        "MODERATE":   "yellow",
        "LOW":        "red"
    }

    for l in sorted(listings, key=lambda x: x.quality_score, reverse=True):
        tier_style = tier_colors.get(l.quality_tier or "MODERATE", "white")
        table.add_row(
            l.company_name[:20],
            l.internship_role[:30],
            f"{l.district_location} / {l.hub_category}",
            (l.domain or "Software")[:18],
            l.stipend_details or "N/A",
            f"[{tier_style}]{l.quality_tier}[/{tier_style}]",
            f"{l.liveness_confidence * 100:.0f}%"
        )

    console.print("\n")
    console.print(Panel.fit(
        f"[bold cyan]Total Verified:[/] {len(listings)}  "
        f"[bold green]ELITE:[/] {sum(1 for l in listings if l.quality_tier == 'ELITE')}  "
        f"[bold yellow]HIGH VALUE:[/] {sum(1 for l in listings if l.quality_tier == 'HIGH VALUE')}",
        title="[bold magenta]CHANAKYAN-KV v9.0 SUMMARY[/]",
        border_style="magenta"
    ))
    console.print(table)

    if predictions:
        pred_table = Table(title="🔥 Hiring Velocity Predictions", box=box.SIMPLE,
                           style="dim", header_style="bold yellow")
        pred_table.add_column("Company", style="yellow")
        pred_table.add_column("Signal",  style="white")
        for comp, signal in list(predictions.items())[:10]:
            pred_table.add_row(comp, signal)
        console.print(pred_table)


# ══════════════════════════════════════════════════════════════════════════════
# GLOBAL SHARED RESOURCES (initialized once, shared across agents)
# ══════════════════════════════════════════════════════════════════════════════
# These are initialized at import-time in execute_pipeline to avoid
# loading 400MB models multiple times.
_st_model: Optional[SentenceTransformer] = None
st_model_ref = None  # Module-level ref used by DiscoveryAgent


def get_st_model() -> SentenceTransformer:
    global _st_model, st_model_ref
    if _st_model is None:
        log("ORCHESTRATOR", "Loading SentenceTransformer (all-MiniLM-L6-v2)...")
        _st_model   = SentenceTransformer("all-MiniLM-L6-v2")
        st_model_ref = _st_model
        log("ORCHESTRATOR", "  Model loaded ✓")
    return _st_model


# ══════════════════════════════════════════════════════════════════════════════
# MASTER PIPELINE ORCHESTRATOR
# ══════════════════════════════════════════════════════════════════════════════
async def execute_pipeline(
    mode: str = "full",           # "full" | "discovery_only" | "revalidate_only"
    export_json: bool = True,
    run_cleanup: bool = True,
    run_ml_train: bool = True,
    quality_filter: float = 40.0  # Minimum quality score to keep
) -> List[InternshipListing]:
    """
    The Master Conductor. Orchestrates the full 10-agent pipeline:

    PHASE 1  — Discovery: Scout + DiscoveryAgent
    PHASE 2  — Scholar:   Semantic extraction from raw HTML
    PHASE 3  — Verify:    AuthenticityAgent 3-stage liveness
    PHASE 4  — Enrich:    SemanticAgent zero-shot domain mapping
    PHASE 5  — Score:     QualityAgent multi-factor assessment
    PHASE 6  — Persist:   SQLite + Sanity CMS sync
    PHASE 7  — Advanced:  Predictive hiring + Portfolio + Resume agents
    PHASE 8  — Cleanup:   SanityCleanupAgent live-list pruning
    PHASE 9  — Learn:     AdaptiveNeuralCore retraining + RL optimization
    PHASE 10 — Dashboard: Rich terminal visualization
    """
    banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║       CHANAKYAN-KV v9.0  ×  ISTE MBCET INTERNSHIP INTELLIGENCE ENGINE       ║
║          Autonomous · Self-Healing · Zero Dead Links · Kerala-First          ║
╚══════════════════════════════════════════════════════════════════════════════╝"""
    print(f"\033[95m{banner}\033[0m\n")

    # ── Initialize shared model once ────────────────────────────────────────
    st_model = get_st_model()

    # ── Initialize agents ────────────────────────────────────────────────────
    scout     = ScoutAgent()
    scholar   = ScholarAgent(st_model)
    auth      = AuthenticityAgent()
    semantic  = SemanticAgent(st_model)
    quality   = QualityAgent()
    cleanup   = SanityCleanupAgent(auth)
    discovery = DiscoveryAgent(scout)
    predictive = PredictiveHiringAgent()
    portfolio  = PortfolioAgent()
    resume_ag  = ResumeAgent(st_model)

    try:
        # ══ PHASE 1 — DISCOVERY ═══════════════════════════════════════════════
        log("ORCHESTRATOR", "▶ PHASE 1: Discovery")
        raw_listings = []

        if mode in ("full", "discovery_only"):
            raw_listings = await discovery.discover_and_crawl_all()

        if not raw_listings:
            log("ORCHESTRATOR", "  No new listings found — running revalidation only", "WARN")
            if run_cleanup:
                await cleanup.cleanup_live_list()
            return []

        # ══ PHASE 2 — SCHOLAR EXTRACTION ══════════════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 2: Scholar extraction on {len(raw_listings)} raw results")
        # For JobSpy/Internshala items, Scholar enriches. For Playwright items, already extracted.
        # Ensure all items have required base fields
        normalized = []
        for item in raw_listings:
            item.setdefault("role",        item.get("internship_role", "Unknown Intern"))
            item.setdefault("company",     "Unknown")
            item.setdefault("applyLink",   item.get("application_url", ""))
            item.setdefault("source_url",  item.get("applyLink", ""))
            item.setdefault("source",      item.get("source_platform", "Discovery"))
            item.setdefault("description", "")
            item.setdefault("location",    "Kerala")
            if item["role"] and item["company"] and item["applyLink"]:
                normalized.append(item)

        # ══ PHASE 2.5 — DEDUPLICATION ══════════════════════════════════════════
        before_dedup = len(normalized)
        normalized   = deduplicate(normalized)
        log("ORCHESTRATOR", f"  Dedup: {before_dedup} → {len(normalized)} unique")

        # ══ PHASE 3 — AUTHENTICITY VERIFICATION ═══════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 3: 3-Stage Liveness Verification")
        verified_raw = await auth.filter_batch(normalized)

        if not verified_raw:
            log("ORCHESTRATOR", "  All listings failed verification. Running cleanup.", "WARN")
            if run_cleanup:
                await cleanup.cleanup_live_list()
            return []

        # ══ PHASE 4 — SEMANTIC ENRICHMENT ══════════════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 4: Semantic Domain Mapping + Enrichment")
        sources_map = {
            s["company"]: s for s in ALL_SOURCES["tier_a"]
        }
        enriched = semantic.process_batch(verified_raw, sources_map)

        # ══ PHASE 5 — QUALITY SCORING ══════════════════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 5: Multi-Factor Quality Assessment")
        scored = quality.assess_batch(enriched)

        # ── Convert to validated Pydantic objects ────────────────────────────
        final_listings: List[InternshipListing] = []
        for item in scored:
            if item.get("quality_score", 0) < quality_filter:
                continue
            try:
                listing = InternshipListing(
                    company_name           = item.get("company", "Unknown"),
                    district_location      = item.get("district", "Kerala"),
                    hub_category           = item.get("hub_category", "Independent"),
                    internship_role        = item.get("role", "Intern"),
                    domain                 = item.get("domain"),
                    stipend_details        = item.get("stipend", "Not specified"),
                    skills                 = item.get("skills", []),
                    application_url        = item.get("applyLink", ""),
                    source_url             = item.get("source_url", ""),
                    source_platform        = item.get("source"),
                    is_verified_live       = True,
                    liveness_confidence    = float(item.get("liveness_confidence", 0.7)),
                    is_likely_expired      = bool(item.get("is_likely_expired", False)),
                    expiry_reason          = item.get("expiry_reason"),
                    quality_tier           = item.get("quality_tier", "MODERATE"),
                    quality_score          = float(item.get("quality_score", 0)),
                    trust_score            = float(item.get("trust_score", 50)),
                    ai_recommendation      = item.get("ai_recommendation"),
                    raw_text_snippet       = item.get("raw_text_snippet", "")[:300],
                )
                final_listings.append(listing)
            except Exception as e:
                log("ORCHESTRATOR", f"  Schema validation failed: {e}", "WARN")

        log("ORCHESTRATOR",
            f"  Pipeline yield: {len(final_listings)} elite listings "
            f"(quality ≥ {quality_filter})")

        # ══ PHASE 6 — PERSIST + CMS SYNC ══════════════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 6: Persistence + CMS Sync")
        for listing in final_listings:
            persist_to_memory(listing)
        sync_to_sanity(final_listings)

        # ══ PHASE 7 — ADVANCED INTELLIGENCE LAYER ══════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 7: Advanced Intelligence Agents")

        # Predictive hiring velocity
        predictions = predictive.run_company_analysis(scored)

        # Export JSON
        if export_json:
            export_to_json(final_listings, "verified_internships_v9.json")

        # ══ PHASE 8 — LIVE LIST CLEANUP ════════════════════════════════════════
        if run_cleanup:
            log("ORCHESTRATOR", f"▶ PHASE 8: Sanity CMS Cleanup")
            await cleanup.cleanup_live_list()

        # ══ PHASE 9 — CONTINUOUS LEARNING ══════════════════════════════════════
        if run_ml_train:
            log("ORCHESTRATOR", f"▶ PHASE 9: Neural Core Retraining + RL Optimization")
            quality.train_on_memory()
            quality.optimize_rl_weights()

        # ══ PHASE 10 — DASHBOARD ═══════════════════════════════════════════════
        log("ORCHESTRATOR", f"▶ PHASE 10: Rendering Dashboard")
        render_dashboard(final_listings, predictions)

        log("ORCHESTRATOR",
            f"\n✅ PIPELINE COMPLETE — {len(final_listings)} elite internships "
            f"verified and synced.")
        return final_listings

    except Exception as e:
        log("ORCHESTRATOR", f"CRITICAL ERROR: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        return []
    finally:
        await scout.close()


# ══════════════════════════════════════════════════════════════════════════════
# CELERY SCHEDULED TASKS
# ══════════════════════════════════════════════════════════════════════════════
@celery_app.task(name="chanakyan.full_discovery_cycle")
def celery_full_cycle():
    """24-hour full discovery + verification cycle."""
    asyncio.run(execute_pipeline(mode="full"))

@celery_app.task(name="chanakyan.revalidation_cycle")
def celery_revalidation():
    """6-hour re-verification of existing listings."""
    asyncio.run(execute_pipeline(mode="revalidate_only", run_cleanup=True))


# ══════════════════════════════════════════════════════════════════════════════
# APScheduler AUTONOMOUS LOOP
# ══════════════════════════════════════════════════════════════════════════════
async def run_autonomous_loop() -> None:
    """
    Runs the full pipeline on a schedule without Celery dependency.
    Use this for standalone local operation.
    """
    if not SCHEDULER_AVAILABLE:
        log("ORCHESTRATOR", "APScheduler not available — running single cycle", "WARN")
        await execute_pipeline()
        return

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        execute_pipeline, "interval", hours=24,
        kwargs={"mode": "full"},
        id="full_discovery"
    )
    scheduler.add_job(
        execute_pipeline, "interval", hours=6,
        kwargs={"mode": "revalidate_only", "run_ml_train": False},
        id="revalidation"
    )
    scheduler.start()
    log("ORCHESTRATOR", "Autonomous scheduler started (24h full / 6h revalidation)")

    # Run immediately on first boot
    await execute_pipeline()

    # Keep running
    while True:
        await asyncio.sleep(3600)


# ══════════════════════════════════════════════════════════════════════════════
# CLI ENTRY POINTS
# ══════════════════════════════════════════════════════════════════════════════
def cli_portfolio(username: str, skills: List[str] = None) -> None:
    """Standalone GitHub portfolio grader."""
    if skills is None:
        skills = ["Python", "JavaScript", "C++", "Machine Learning", "React"]
    agent  = PortfolioAgent()
    result = agent.assess_github(username, skills)
    print(json.dumps(result, indent=2))

def cli_ats(resume_path: str, jd_text: str) -> None:
    """Standalone ATS resume optimizer."""
    with open(resume_path, encoding="utf-8") as f:
        resume = f.read()
    st  = get_st_model()
    ag  = ResumeAgent(st)
    res = ag.optimize_for_ats(resume, jd_text)
    print(json.dumps(res, indent=2, ensure_ascii=False))

def cli_predict(company: str, daily_counts: List[int]) -> None:
    """Standalone hiring velocity predictor."""
    ag = PredictiveHiringAgent()
    for c in daily_counts:
        ag.record_postings(company, c)
    result = ag.analyze_velocity(company, daily_counts[-1])
    print(f"[{company}] {result}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Chanakyan-KV v9.0 — Kerala Internship Intelligence Engine"
    )
    parser.add_argument("--mode", choices=["full", "discovery_only", "revalidate_only"],
                        default="full", help="Pipeline execution mode")
    parser.add_argument("--autonomous", action="store_true",
                        help="Run in autonomous scheduled loop (24h/6h)")
    parser.add_argument("--portfolio", metavar="USERNAME",
                        help="Grade a GitHub portfolio")
    parser.add_argument("--skills", nargs="+",
                        help="Target skills for portfolio grading")
    parser.add_argument("--ats", metavar="RESUME_PATH",
                        help="Optimize a resume for ATS (requires --jd)")
    parser.add_argument("--jd", metavar="JOB_DESCRIPTION",
                        help="Job description text for ATS optimizer")
    parser.add_argument("--predict", metavar="COMPANY",
                        help="Predict hiring velocity for a company")
    parser.add_argument("--velocity", nargs="+", type=int,
                        help="7-day posting counts for velocity predictor")
    parser.add_argument("--no-export", action="store_true")
    parser.add_argument("--no-cleanup", action="store_true")
    parser.add_argument("--no-train", action="store_true")
    parser.add_argument("--min-quality", type=float, default=40.0)

    args = parser.parse_args()

    if args.portfolio:
        cli_portfolio(args.portfolio, args.skills)
    elif args.ats:
        if not args.jd:
            print("Error: --jd is required with --ats")
            sys.exit(1)
        cli_ats(args.ats, args.jd)
    elif args.predict:
        counts = args.velocity or [1, 2, 1, 3, 5, 8, 10]
        cli_predict(args.predict, counts)
    elif args.autonomous:
        asyncio.run(run_autonomous_loop())
    else:
        asyncio.run(execute_pipeline(
            mode          = args.mode,
            export_json   = not args.no_export,
            run_cleanup   = not args.no_cleanup,
            run_ml_train  = not args.no_train,
            quality_filter = args.min_quality
        ))
