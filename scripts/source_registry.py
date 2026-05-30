#!/usr/bin/env python3
"""
ISTE MBCET INTERNSHIP INTELLIGENCE ECOSYSTEM v8.0
==================================================
SOURCE REGISTRY — Curated Tier A / B / C source intelligence.

Tier A: Official company career pages, Technopark/Infopark companies, KSUM startups
Tier B: Job aggregators (LinkedIn, Wellfound, Internshala)
Tier C: Community, regional portals, public listings

Every source has:
  - base_trust_score: 0-100 (affects ranking)
  - crawl_frequency_hours: how often to re-crawl
  - requires_js: True = Playwright fallback, False = httpx first
  - selector_hints: CSS hints for career page parsing
  - tags: domain/tech tags for filtering
"""

# ==============================================================================
# TIER A — OFFICIAL COMPANY CAREER PAGES (Highest Trust, Deep Crawl)
# ==============================================================================
TIER_A_SOURCES = [
    # ─── Technopark Trivandrum ───────────────────────────────────────────────
    {
        "company": "TCS",
        "careers_url": "https://www.tcs.com/careers/india/freshers",
        "base_trust_score": 99,
        "crawl_frequency_hours": 12,
        "requires_js": False,
        "tags": ["Software", "AI/ML", "Full Stack"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "Infosys",
        "careers_url": "https://www.infosys.com/careers/india/students.html",
        "base_trust_score": 99,
        "crawl_frequency_hours": 12,
        "requires_js": False,
        "tags": ["Software", "Cloud", "Data Science"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "UST",
        "careers_url": "https://www.ust.com/en/careers",
        "base_trust_score": 97,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "Cloud", "AI/ML"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "Nissan Digital",
        "careers_url": "https://careers.nissanmotor.jobs/api/jobs?country=india",
        "base_trust_score": 96,
        "crawl_frequency_hours": 24,
        "requires_js": False,
        "tags": ["Embedded Systems", "AI/ML", "Software"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "IBS Software",
        "careers_url": "https://ibsplc.com/careers",
        "base_trust_score": 95,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "Aviation Tech"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "Cognizant",
        "careers_url": "https://careers.cognizant.com/in/en/fresher-jobs",
        "base_trust_score": 97,
        "crawl_frequency_hours": 12,
        "requires_js": True,
        "tags": ["Software", "AI/ML", "Cloud"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "Ernst & Young (EY)",
        "careers_url": "https://careers.ey.com/ey/search/#q=intern&t=Jobs&l=india",
        "base_trust_score": 96,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Data Science", "Consulting", "Technology"],
        "location": "Kochi",
        "zone": "Infopark"
    },
    {
        "company": "Wipro",
        "careers_url": "https://careers.wipro.com/careers-home/jobs?q=intern",
        "base_trust_score": 97,
        "crawl_frequency_hours": 12,
        "requires_js": True,
        "tags": ["Software", "Cloud", "AI/ML"],
        "location": "Kochi",
        "zone": "Infopark"
    },
    {
        "company": "HCL Technologies",
        "careers_url": "https://www.hcltech.com/careers",
        "base_trust_score": 96,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "DevOps", "Cloud"],
        "location": "Kochi",
        "zone": "Infopark"
    },
    {
        "company": "Envestnet | Yodlee",
        "careers_url": "https://www.envestnet.com/careers",
        "base_trust_score": 92,
        "crawl_frequency_hours": 48,
        "requires_js": True,
        "tags": ["Fintech", "AI/ML", "Software"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "Allianz Technology",
        "careers_url": "https://careers.allianz.com/allianz/jobs?country=India&company_location=Trivandrum",
        "base_trust_score": 95,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Fintech", "Software", "Cloud"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    {
        "company": "UST Global",
        "careers_url": "https://www.ust.com/en/careers/explore-jobs",
        "base_trust_score": 96,
        "crawl_frequency_hours": 12,
        "requires_js": True,
        "tags": ["Software", "Digital", "AI/ML"],
        "location": "Trivandrum",
        "zone": "Technopark"
    },
    # ─── KSUM (Kerala Startup Mission) Ecosystem ────────────────────────────
    {
        "company": "Kerala Startup Mission (KSUM)",
        "careers_url": "https://startupmission.kerala.gov.in/jobs",
        "base_trust_score": 95,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Startup", "AI/ML", "IoT", "Hardware"],
        "location": "Kerala-wide",
        "zone": "KSUM"
    },
    {
        "company": "Scaler (KSUM Partner)",
        "careers_url": "https://scaler.com/internship",
        "base_trust_score": 88,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "AI/ML", "Education Tech"],
        "location": "Remote / Bangalore",
        "zone": "Partner"
    },
    # ─── Research Labs / Innovation Hubs ────────────────────────────────────
    {
        "company": "CDAC Trivandrum",
        "careers_url": "https://www.cdac.in/index.aspx?id=jobs",
        "base_trust_score": 95,
        "crawl_frequency_hours": 48,
        "requires_js": False,
        "tags": ["AI/ML", "Embedded", "Cybersecurity", "HPC"],
        "location": "Trivandrum",
        "zone": "Research"
    },
    {
        "company": "ISRO VSSC / LPSC",
        "careers_url": "https://www.isro.gov.in/opportunities.html",
        "base_trust_score": 99,
        "crawl_frequency_hours": 48,
        "requires_js": False,
        "tags": ["Embedded Systems", "Robotics", "VLSI", "Research"],
        "location": "Trivandrum",
        "zone": "Research"
    },
    {
        "company": "IIST Trivandrum",
        "careers_url": "https://www.iist.ac.in/placements/internships",
        "base_trust_score": 96,
        "crawl_frequency_hours": 48,
        "requires_js": False,
        "tags": ["Aerospace", "Embedded", "Research"],
        "location": "Trivandrum",
        "zone": "Research"
    },
    {
        "company": "NIT Calicut Research",
        "careers_url": "https://nitc.ac.in/department/placements/internship",
        "base_trust_score": 92,
        "crawl_frequency_hours": 72,
        "requires_js": False,
        "tags": ["Research", "AI/ML", "Embedded"],
        "location": "Calicut",
        "zone": "Research"
    },
    {
        "company": "IIT Palakkad",
        "careers_url": "https://iitpkd.ac.in/careers",
        "base_trust_score": 96,
        "crawl_frequency_hours": 48,
        "requires_js": False,
        "tags": ["Research", "AI/ML", "VLSI", "Robotics"],
        "location": "Palakkad",
        "zone": "Research"
    },
    # ─── Fast-Growing Kerala Startups ────────────────────────────────────────
    {
        "company": "Genrobotics",
        "careers_url": "https://genrobotics.org/careers",
        "base_trust_score": 90,
        "crawl_frequency_hours": 48,
        "requires_js": True,
        "tags": ["Robotics", "IoT", "AI/ML"],
        "location": "Trivandrum",
        "zone": "Startup"
    },
    {
        "company": "WowMomos",
        "careers_url": "https://wowmomos.com/careers",
        "base_trust_score": 80,
        "crawl_frequency_hours": 72,
        "requires_js": True,
        "tags": ["Software", "Operations", "Marketing"],
        "location": "Kerala",
        "zone": "Startup"
    },
    {
        "company": "Excelus Learning",
        "careers_url": "https://excelus.in/careers",
        "base_trust_score": 82,
        "crawl_frequency_hours": 72,
        "requires_js": True,
        "tags": ["EdTech", "AI/ML", "Software"],
        "location": "Kochi",
        "zone": "Startup"
    },
    {
        "company": "BoTree Technologies",
        "careers_url": "https://www.bootreeindia.com/careers",
        "base_trust_score": 83,
        "crawl_frequency_hours": 72,
        "requires_js": True,
        "tags": ["Software", "Full Stack", "AI"],
        "location": "Kochi",
        "zone": "Startup"
    },
]

# ==============================================================================
# TIER B — AGGREGATORS (Medium Trust, Broad Discovery)
# ==============================================================================
TIER_B_SOURCES = [
    {
        "platform": "Internshala",
        "search_urls": [
            "https://internshala.com/internships/computer-science-internship-in-kerala/",
            "https://internshala.com/internships/machine-learning-internship-in-kerala/",
            "https://internshala.com/internships/web-development-internship-in-kerala/",
            "https://internshala.com/internships/electronics-internship-in-kerala/",
            "https://internshala.com/internships/embedded-systems-internship-in-kerala/",
            "https://internshala.com/internships/data-science-internship-in-kerala/",
            "https://internshala.com/internships/cybersecurity-internship-in-kerala/",
        ],
        "base_trust_score": 80,
        "crawl_frequency_hours": 12,
        "requires_js": True,  # Playwright required for Internshala
        "selector_hints": {
            "card": ".individual_internship",
            "title": "h3.job-internship-name",
            "company": ".company_name",
            "link": "a.view_detail_button"
        },
        "tags": ["All Domains"]
    },
    {
        "platform": "LinkedIn",
        "search_query": "internship Kerala site:linkedin.com/jobs",
        "jobspy_params": {
            "site_name": ["linkedin"],
            "search_term": "intern OR internship",
            "location": "Kerala, India",
            "results_wanted": 50,
            "hours_old": 72,
            "job_type": "internship"
        },
        "base_trust_score": 85,
        "crawl_frequency_hours": 6,
        "requires_js": False,  # JobSpy handles
        "tags": ["All Domains"]
    },
    {
        "platform": "Wellfound (AngelList)",
        "search_urls": [
            "https://wellfound.com/jobs?role=internship&location=Kerala",
            "https://wellfound.com/jobs?role=internship&location=Trivandrum",
            "https://wellfound.com/jobs?role=internship&location=Kochi"
        ],
        "base_trust_score": 83,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Startup", "Software", "AI/ML"]
    },
    {
        "platform": "Indeed",
        "jobspy_params": {
            "site_name": ["indeed"],
            "search_term": "internship engineer student",
            "location": "Kerala, India",
            "results_wanted": 30,
            "hours_old": 72,
            "job_type": "internship"
        },
        "base_trust_score": 75,
        "crawl_frequency_hours": 24,
        "requires_js": False,
        "tags": ["All Domains"]
    },
    {
        "platform": "Glassdoor",
        "jobspy_params": {
            "site_name": ["glassdoor"],
            "search_term": "intern OR internship",
            "location": "Kerala",
            "results_wanted": 20,
            "hours_old": 72,
            "job_type": "internship"
        },
        "base_trust_score": 78,
        "crawl_frequency_hours": 24,
        "requires_js": False,
        "tags": ["All Domains"]
    },
]

# ==============================================================================
# TIER C — COMMUNITY / REGIONAL PORTALS (Lower Trust, Supplemental)
# ==============================================================================
TIER_C_SOURCES = [
    {
        "platform": "Technopark Jobs Portal",
        "careers_url": "https://www.technopark.org/job-listing",
        "base_trust_score": 90,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "All Domains"]
    },
    {
        "platform": "Infopark Jobs",
        "careers_url": "https://infopark.in/jobs",
        "base_trust_score": 88,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["Software", "All Domains"]
    },
    {
        "platform": "Kerala IT Jobs",
        "careers_url": "https://www.keralaitjobs.com/internships",
        "base_trust_score": 65,
        "crawl_frequency_hours": 48,
        "requires_js": False,
        "tags": ["Software", "IT"]
    },
    {
        "platform": "MBCET Placement Cell",
        "careers_url": "https://mbcet.ac.in/placements",
        "base_trust_score": 98,
        "crawl_frequency_hours": 24,
        "requires_js": True,
        "tags": ["All Domains"]
    },
]

# ==============================================================================
# SOURCE TRUST OVERRIDES (Company-specific trust scores)
# ==============================================================================
COMPANY_TRUST_OVERRIDES = {
    "google": 99,
    "microsoft": 99,
    "amazon": 99,
    "meta": 98,
    "apple": 99,
    "nvidia": 98,
    "tcs": 97,
    "infosys": 97,
    "wipro": 97,
    "cognizant": 97,
    "hcl": 96,
    "isro": 99,
    "cdac": 95,
    "ksum": 95,
    "iit": 96,
    "nit": 93,
    "ust": 96,
    "nissan": 96,
    "ernst & young": 96,
    "ey": 96,
    "ibs": 92,
    "allianz": 95,
    "technopark": 90,
    "infopark": 88,
    "internshala": 80,
    "linkedin": 85,
    "wellfound": 83,
    "angellist": 83,
}

# ==============================================================================
# SCAM SIGNAL DICTIONARY (Engine 9 — Scam Detection)
# ==============================================================================
SCAM_SIGNALS = {
    # Hard blockers (auto-reject)
    "hard": [
        "registration fee", "deposit required", "pay to work", "processing fee",
        "security deposit", "pay us", "unpaid with fee", "training fee",
        "laptop deposit", "investment required", "starter kit cost",
        "onboarding fee", "guaranteed placement fee", "buy our course",
        "purchase kit", "pay registration", "refundable deposit",
        "multi level marketing", "mlm", "network marketing",
        "recruit your friends", "commission only", "pyramid",
    ],
    # Soft warnings (reduce score, flag for review)
    "soft": [
        "guaranteed job", "100% placement", "earn from home", "work from home without skills",
        "no experience needed make money", "immediate joining bonus",
        "secret opportunity", "limited seats hurry", "apply within 24 hours",
        "pay after placement", "revenue sharing only",
    ]
}

# ==============================================================================
# EXPIRY DETECTION PHRASES (Engine 5 — Link Health)
# ==============================================================================
EXPIRY_PHRASES = [
    "position closed", "applications closed", "no longer accepting",
    "job not found", "expired", "archived", "vacancy filled",
    "position filled", "role closed", "not available", "link expired",
    "404", "page not found", "internship closed", "deadline passed",
    "application deadline has passed", "this job is no longer available",
    "opening has been closed", "posting removed",
]

# ==============================================================================
# KERALA GEOGRAPHY CONFIG (Engine 4 — Normalization + Quality Assessment)
# ==============================================================================
KERALA_ZONES = {
    "trivandrum": {"aliases": ["thiruvananthapuram", "technopark", "kazhakoottam"], "proximity_score": 30},
    "kochi": {"aliases": ["ernakulam", "infopark", "cochin"], "proximity_score": 20},
    "kozhikode": {"aliases": ["calicut", "cyberpark"], "proximity_score": 12},
    "thrissur": {"aliases": ["thrissur"], "proximity_score": 10},
    "palakkad": {"aliases": ["palakkad"], "proximity_score": 8},
    "kollam": {"aliases": ["kollam", "quilon"], "proximity_score": 15},
    "remote": {"aliases": ["remote", "work from home", "wfh", "hybrid"], "proximity_score": 18},
    "kerala": {"aliases": ["kerala"], "proximity_score": 5},
}

# ==============================================================================
# DOMAIN CLASSIFICATION MAP (Engine 11 — AI Classification)
# ==============================================================================
DOMAIN_KEYWORDS = {
    "AI/ML & Data Science": [
        "machine learning", "deep learning", "tensorflow", "pytorch", "nlp",
        "computer vision", "data science", "artificial intelligence", "llm",
        "neural network", "huggingface", "scikit", "pandas", "numpy",
    ],
    "Embedded Systems & IoT": [
        "embedded", "microcontroller", "arduino", "raspberry pi", "stm32",
        "rtos", "firmware", "pcb", "iot", "sensor", "fpga", "verilog", "hdl",
        "hardware", "circuit", "kicad", "altium",
    ],
    "Web Development": [
        "react", "next.js", "vue", "angular", "node", "express", "django",
        "flask", "frontend", "backend", "full stack", "html", "css",
        "javascript", "typescript", "rest api", "graphql", "web",
    ],
    "Cybersecurity": [
        "cybersecurity", "penetration testing", "ethical hacking", "network security",
        "ctf", "malware analysis", "soc", "wireshark", "kali", "owasp",
        "vulnerability", "exploit", "security audit",
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "kubernetes", "docker", "ci/cd", "devops",
        "terraform", "ansible", "jenkins", "linux", "bash", "cloud",
        "microservices", "serverless",
    ],
    "Mobile Development": [
        "android", "ios", "flutter", "react native", "swift", "kotlin",
        "mobile app", "xcode", "android studio",
    ],
    "VLSI & Semiconductor": [
        "vlsi", "rtl", "synthesis", "timing analysis", "verilog", "vhdl",
        "asic", "fpga", "semiconductor", "cadence", "synopsys",
    ],
    "Robotics & Automation": [
        "robotics", "ros", "automation", "mechatronics", "drone",
        "autonomous", "servo", "pid controller", "motion planning",
    ],
    "UI/UX Design": [
        "figma", "ui/ux", "user interface", "user experience", "design",
        "prototype", "wireframe", "adobe xd", "sketch", "interaction design",
    ],
    "Data Engineering": [
        "data pipeline", "spark", "kafka", "airflow", "etl", "data warehouse",
        "bigquery", "snowflake", "dbt", "data engineering",
    ],
}

ALL_SOURCES = {
    "tier_a": TIER_A_SOURCES,
    "tier_b": TIER_B_SOURCES,
    "tier_c": TIER_C_SOURCES,
}
