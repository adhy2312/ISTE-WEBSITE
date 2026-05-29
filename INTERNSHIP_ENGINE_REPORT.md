# ISTE MBCET Elite Internship Intelligence Ecosystem (v7.0)

## Overview
The **ISTE MBCET Internship Engine** is a fully autonomous, multi-agent AI infrastructure designed to scrape, analyze, filter, and publish elite engineering internships across Kerala. It is powered by a robust stack including Playwright, PyTorch (Sentence-Transformers), SQLAlchemy, Celery, and Sanity CMS.

With the latest v7.0 update, the ecosystem operates as a self-learning organism, capable of deeply analyzing semantic data, predicting hiring sprees, and maintaining a flawless, scam-free database.

---

## Core Agents & Architecture

### 1. `DiscoveryAgent` (The Hunter)
The primary extraction unit responsible for scouring the web for high-quality opportunities.
*   **Playwright Stealth Integration**: Uses `playwright-stealth` with randomized user agents and viewports to silently crawl Internshala without triggering bot-defense networks.
*   **JobSpy Multi-Platform Integration**: Concurrently aggregates real-time data from LinkedIn, Indeed, and Glassdoor, completely bypassing the need for heavy browser automation.
*   **Fuzzy Deduplication**: Implements `difflib.SequenceMatcher` to prevent duplicate listings. If "Software Engineer Intern" and "Software Engineering Intern" appear from the same company, they are intelligently merged.

### 2. `AuthenticityAgent` (The Guardian)
Responsible for eliminating toxic, predatory, or generic postings before they enter the ecosystem.
*   **Advanced Counterfeit Detection**: Scans listings for an extensive matrix of red flags, including *"training fee"*, *"laptop deposit"*, *"guaranteed placement fee"*, and *"investment required"*.
*   **Link Rot Prevention**: Uses asynchronous HTTPX requests to ensure application links are valid and active (eliminating 403/404 dead ends).

### 3. `SemanticIntelligenceAgent` (The Brain)
Leverages deep learning to enrich and understand raw internship data.
*   **Zero-Shot NLP Domain Mapping**: Uses a PyTorch `SentenceTransformer` (`all-MiniLM-L6-v2`) to encode job roles into high-dimensional vectors, mapping them strictly to core domains like *AI/ML*, *Robotics*, or *Cybersecurity*.
*   **NLP Stipend Extraction**: Dynamically parses the job description using advanced Regex to pull exact compensation numbers (e.g., `₹10,000 - ₹15,000`).
*   **Skill-Gap Analyzer**: Cross-references the required skills in the job description against a standard baseline of Kerala engineering skills (Python, C++, Git), outputting exactly what the student is missing.

### 4. `QualityAssessmentAgent` (The Judge)
The continuous learning core that ranks and evaluates the internships.
*   **Geographic Proximity Scoring**: Prioritizes opportunities in *Trivandrum (+30)* and *Kochi (+15)* to ensure practicality and low commute times for MBCET students.
*   **Adaptive Neural Core (Continuous ML)**: A self-hosted PyTorch Neural Network that trains continuously. It learns which internships survive the CMS cleanup and dynamically predicts a "Survival Probability" for new internships, multiplying their base score.
*   **Supreme Judge Integration**: For "borderline" cases (40%-60% confidence), a heavy-weight HuggingFace Zero-Shot Classification model (`facebook/bart-large-mnli`) acts as the final arbitrator.

### 5. `SanityCleanupAgent` (The Janitor)
The autonomous live-list maintenance system.
*   **Live CMS Pruning**: Directly queries the production Sanity CMS database, scans all active listings for link rot and late-stage counterfeit flags, and immediately deletes toxic entries.
*   **Failure Registration**: When an internship is deleted, it updates the local `EvolutionMemory` SQLite database, flagging it as a "failure" so the `AdaptiveNeuralCore` learns to avoid similar semantic patterns in the future.

---

## The "Endgame" Upgrades (Advanced Agentic Module)

To push the ecosystem into absolute bleeding-edge territory, we have decoupled three highly advanced AI components into `advanced_agents.py`:

### A. Predictive Hiring Trajectory (Time-Series AI)
Powered by a local `VelocityLSTM` PyTorch model, this agent analyzes the *velocity* of postings from a specific company (e.g., Nissan posting 10 roles in 3 days). It predicts upcoming mass-hiring sprees *before* they are publicly announced, granting ISTE students a massive first-mover advantage.

### B. GitHub / Portfolio Auto-Grader
The `PortfolioAssessmentAgent` allows a student to input their GitHub username. The agent scrapes their public repositories, runs a mock Abstract Syntax Tree (AST) analysis (calculating code size, languages, and repo complexity), and matches their exact coding style to the elite internships that demand it.

### C. Autonomous ATS Resume Rewriter
The `ResumeOptimizationAgent` accepts a student's base resume and the target elite internship description. Using NLP, it dynamically scores, re-orders, and re-writes the student's bullet points to perfectly align with the semantic embedding of the job description, effectively bypassing corporate ATS filters.

---

### Conclusion
The ISTE MBCET Internship Intelligence Ecosystem is no longer just a scraper. It is a highly resilient, constantly evolving digital organism that guarantees exclusive, high-tier career opportunities for students without any manual intervention.
