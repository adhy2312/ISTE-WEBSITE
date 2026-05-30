# 🚀 The Autonomous Internship Intelligence Ecosystem

## The Story: From Manual Scraper to Living Organism
The ISTE MBCET internship portal began as a passive, manually curated job board. We quickly realized that internship listings decay rapidly—links break, roles fill up, and stale data frustrates students. To solve this, we embarked on a multi-version architectural journey that culminated in the **v10.2 Autonomous Intelligence Ecosystem**. 

We didn't just build a scraper; we built a "living digital organism" that hunts, verifies, scores, and purges its own data without human intervention.

## 🏗️ Architecture
The ecosystem spans a highly decoupled Python backend and a Next.js frontend, mediated by SQLite and Sanity CMS.

### 1. The Python Engine (`internship_engine_v8.py`)
This is the beating heart of the system. It runs via Celery and Redis as a continuous background process.
- **Discovery (Multi-Agent Scraping):** It utilizes `jobspy` (Infinite Aggregator) and direct Playwright crawlers to hunt for roles across Tier A tech companies, LinkedIn, Glassdoor, and Indeed.
- **SQLite Brain (`internship_brain_v8.db`):** Acts as the absolute source of truth. Every URL hash, timestamp, and verification strike is logged here.
- **The State Machine:** Internships are born as `NEW`, promoted to `ACTIVE`, and verified as `VERIFIED`. If a link fails, it decays to `SUSPECT` and eventually `ARCHIVED`. Stale data is never deleted entirely (preserving history for ML models) but is cryptographically hidden from students.

### 2. The Verification Gate & Sanity CMS
Instead of blasting unfiltered data to the frontend, the Python engine acts as a strict border patrol.
- It performs HTTP status checks and NLP-based expiry phrase detection (e.g., looking for "This position has been filled" in the HTML).
- It computes a `linkHealthScore`.
- Finally, it uses a non-destructive `"patch"` mutation to sync the verified state into the Sanity CMS, explicitly protecting any manual edits made by human admins (like adding a company logo).

### 3. The Next.js Presentation Layer
The Next.js 16 App Router queries Sanity using a strict GROQ Verification Gate:
`*[_type == "internship" && state == "VERIFIED" && verificationStatus == "VERIFIED"]`
- **Time-Based ISR:** We utilize Incremental Static Regeneration (`export const revalidate = 60;`) to guarantee that any decayed or archived internship is completely wiped from the global CDN within 60 seconds.

## ✨ Key Features
- **Scam Detection Engine:** Uses keyword heuristics (`SCAM_SIGNALS`) to flag suspicious "pay-to-work" internships.
- **Reinforcement Learning:** The engine dynamically adjusts the trust scores of different hiring platforms based on historical link reliability.
- **Sub-Minute Ghost Record Purging:** Stale listings disappear almost instantly.

## ⚠️ Limitations & Trade-offs
- **Infrastructure Cost:** Running a headless Chromium instance (Playwright) via Python is memory-intensive. It requires a persistent server, unlike stateless edge functions.
- **Scraper Evasion:** High-security sites (like LinkedIn) frequently block the headless browsers, requiring constant IP rotation and JobSpy library updates.
- **Decoupled Complexity:** Because the Source of Truth is SQLite, but the Presentation Layer is Sanity, state desynchronization can occur if the Python engine crashes mid-sync.
