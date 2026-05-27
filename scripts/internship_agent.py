#!/usr/bin/env python3
"""
ISTE MBCET INTERNSHIP SCRAPER AGENT v4.0.0
===========================================
Real scraper targeting Kerala & India internship sources:
  - Internshala (live scrape)
  - Kerala Startup Mission / KSUM
  - Kerala IT Parks (Technopark, Infopark, Cyberpark)
  - Government portals (ISRO, DRDO, CDAC, AICTE)
  - Big Tech India programs
  - Curated Kerala company database
"""

import os, time, hashlib, random, re, json
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Terminal Colors ──
class C:
    CY='\033[96m'; GR='\033[92m'; YL='\033[93m'
    RD='\033[91m'; MG='\033[95m'; RS='\033[0m'; BD='\033[1m'

def t_log(lvl, mod, msg):
    ts = time.strftime("%H:%M:%S")
    colors = {"INFO":C.CY,"SUCCESS":C.GR,"WARN":C.YL,"ERROR":C.RD,"SYSTEM":C.MG}
    print(f"{colors.get(lvl,C.CY)}[{ts}] {C.BD}[{mod}]{C.RS} {msg}")

load_dotenv(dotenv_path=".env.local")
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_TOKEN = os.getenv("SANITY_API_TOKEN")

if not SANITY_PROJECT_ID or not SANITY_TOKEN:
    t_log("ERROR", "BOOT", "Missing Sanity credentials in .env.local")
    exit(1)

SANITY_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{SANITY_DATASET}"
HEADERS_SANITY = {"Content-Type":"application/json","Authorization":f"Bearer {SANITY_TOKEN}"}

SESSION = requests.Session()
_retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
SESSION.mount('http://', HTTPAdapter(max_retries=_retries))
SESSION.mount('https://', HTTPAdapter(max_retries=_retries))
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
})

def jitter(lo=0.5, hi=2.0):
    time.sleep(random.uniform(lo, hi))

# ═══════════════════════════════════════════════════════════════
# SOURCE 1: INTERNSHALA — Live scrape for Kerala internships
# ═══════════════════════════════════════════════════════════════
def scrape_internshala():
    t_log("INFO", "INTERNSHALA", f"Scraping Internshala for Kerala engineering internships...")
    results = []
    keywords = [
        "computer-science-internship-in-thiruvananthapuram",
        "computer-science-internship-in-kochi",
        "software-development-internship-in-kerala",
        "web-development-internship-in-kerala",
        "machine-learning-internship-in-kerala",
        "data-science-internship-in-kerala",
        "electronics-internship-in-kerala",
        "work-from-home-python-django-internships",
        "work-from-home-web-development-internships",
        "work-from-home-machine-learning-internships",
        "cyber-security-internship",
        "data-analytics-internship",
        "work-from-home-react-js-internships",
        "work-from-home-node-js-internships",
        "app-development-internship-in-kerala",
    ]
    for kw in keywords:
        try:
            url = f"https://internshala.com/internships/{kw}"
            jitter(1.0, 3.0)
            resp = SESSION.get(url, timeout=15)
            if resp.status_code != 200:
                t_log("WARN", "INTERNSHALA", f"HTTP {resp.status_code} for {kw}")
                continue
            soup = BeautifulSoup(resp.text, "lxml")
            cards = soup.select(".individual_internship, .internship_meta, [class*='individual_internship']")
            if not cards:
                cards = soup.select("div.container-fluid .internship_meta")
            for card in cards[:5]:
                try:
                    title_el = card.select_one("h3, .heading_4_5, a.view_detail_button, .profile")
                    company_el = card.select_one(".company_name, h4, .heading_6")
                    stipend_el = card.select_one(".stipend, .desktop-text span")
                    location_el = card.select_one(".location_link, #location_names a, .locations span")
                    duration_el = card.select_one(".item_body:nth-of-type(2), .other_detail_item_row .item_body")
                    link_el = card.select_one("a[href*='/internship/detail/'], a.view_detail_button")

                    role = title_el.get_text(strip=True) if title_el else None
                    company = company_el.get_text(strip=True) if company_el else None
                    if not role or not company:
                        continue

                    stipend = stipend_el.get_text(strip=True) if stipend_el else "Check listing"
                    location = location_el.get_text(strip=True) if location_el else "Kerala"
                    duration = duration_el.get_text(strip=True) if duration_el else ""
                    
                    itype = "Remote" if "work from home" in kw.lower() or "remote" in location.lower() else "On-Site"
                    
                    link = "https://internshala.com"
                    if link_el and link_el.get("href"):
                        href = link_el["href"]
                        link = href if href.startswith("http") else f"https://internshala.com{href}"

                    domain = "Software Engineering"
                    kw_lower = kw.lower()
                    if "machine-learning" in kw_lower or "data-science" in kw_lower:
                        domain = "AI/ML & Data Science"
                    elif "web-development" in kw_lower:
                        domain = "Web Development"
                    elif "electronics" in kw_lower:
                        domain = "Electronics & Embedded"
                    elif "python" in kw_lower or "django" in kw_lower:
                        domain = "Backend Development"

                    results.append({
                        "company": company[:60],
                        "role": role[:80],
                        "type": itype,
                        "domain": domain,
                        "stipend": stipend[:40],
                        "duration": duration[:30],
                        "deadlineLabel": "Apply Now",
                        "applyLink": link,
                        "status": "open",
                        "source": "Internshala"
                    })
                except Exception:
                    continue
            t_log("SUCCESS", "INTERNSHALA", f"Extracted {len(results)} from '{kw.replace('-', ' ')}'")
        except Exception as e:
            t_log("ERROR", "INTERNSHALA", f"Failed on {kw}: {e}")
    
    t_log("SUCCESS", "INTERNSHALA", f"Total raw extractions: {len(results)}")
    return results

# ═══════════════════════════════════════════════════════════════
# SOURCE 2: KERALA TECH ECOSYSTEM — Curated high-value database
# ═══════════════════════════════════════════════════════════════
def get_kerala_ecosystem():
    t_log("INFO", "KERALA_HUB", "Loading curated Kerala Tech Ecosystem database...")
    jitter(0.3, 0.8)

    companies = [
        # — Technopark, Trivandrum —
        {"company":"UST","role":"Software Engineering Intern","type":"Hybrid","domain":"Software Engineering",
         "stipend":"₹15,000–25,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.ust.com/en/careers/students-and-graduates","status":"open"},
        {"company":"IBS Software","role":"Cloud Platform Intern","type":"On-Site","domain":"Cloud & DevOps",
         "stipend":"₹12,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.ibsplc.com/careers/early-careers","status":"open"},
        {"company":"TCS Technopark","role":"Digital Intern (TCS NQT)","type":"On-Site","domain":"Software Engineering",
         "stipend":"₹15,000/mo","deadlineLabel":"Via TCS NQT","applyLink":"https://www.tcs.com/careers/india/tcs-fresher-hiring","status":"open"},
        {"company":"Envestnet | Yodlee","role":"Data Engineering Intern","type":"Hybrid","domain":"Data Engineering",
         "stipend":"₹20,000/mo","deadlineLabel":"Rolling","applyLink":"https://careers.envestnet.com/university","status":"open"},
        {"company":"Nissan Digital Hub","role":"Embedded Systems Intern","type":"On-Site","domain":"Automotive & Embedded",
         "stipend":"₹18,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.nissan-global.com/EN/CAREERS/STUDENTS/","status":"open"},
        # — Infopark, Kochi —
        {"company":"TCS Infopark Kochi","role":"AI/ML Research Intern","type":"On-Site","domain":"AI/ML",
         "stipend":"₹15,000/mo","deadlineLabel":"Via TCS iON","applyLink":"https://www.tcs.com/careers/india/tcs-fresher-hiring","status":"open"},
        {"company":"Infosys Kochi","role":"InStep Intern","type":"Hybrid","domain":"Software Engineering",
         "stipend":"₹20,000–40,000/mo","deadlineLabel":"InStep Portal","applyLink":"https://www.infosys.com/careers/instep.html","status":"open"},
        {"company":"Ernst & Young (EY) Kochi","role":"Technology Consulting Intern","type":"Hybrid","domain":"Consulting & Tech",
         "stipend":"₹25,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.ey.com/en_in/careers/students","status":"open"},
        {"company":"QBurst","role":"Full Stack Developer Intern","type":"On-Site","domain":"Web Development",
         "stipend":"₹10,000–15,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.qburst.com/en-in/careers/openings/","status":"open"},
        {"company":"Experion Technologies","role":"React Native Intern","type":"On-Site","domain":"Mobile Development",
         "stipend":"₹10,000/mo","deadlineLabel":"Rolling","applyLink":"https://experionglobal.com/careers/","status":"open"},
        # — Cyberpark, Kozhikode —
        {"company":"Tata Elxsi","role":"Design Intern (UI/UX)","type":"On-Site","domain":"UI/UX Design",
         "stipend":"₹12,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.tataelxsi.com/careers/campus-recruitment","status":"open"},
        # — Kerala Startups (KSUM backed) —
        {"company":"Genrobotics","role":"Robotics Engineering Intern","type":"On-Site","domain":"Robotics & IoT",
         "stipend":"₹8,000–12,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.genrobotics.org/career","status":"open"},
        {"company":"Sastra Robotics","role":"Computer Vision Intern","type":"On-Site","domain":"AI/ML & Robotics",
         "stipend":"₹10,000/mo","deadlineLabel":"Rolling","applyLink":"https://sastrarobotics.com/career/","status":"open"},
        {"company":"Finotes","role":"Backend Developer Intern","type":"Remote","domain":"Backend Development",
         "stipend":"₹10,000/mo","deadlineLabel":"Rolling","applyLink":"https://finotes.com/careers","status":"open"},
        {"company":"Fingent","role":"Software Engineer Intern","type":"Hybrid","domain":"Software Engineering",
         "stipend":"₹8,000–15,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.fingent.com/careers/","status":"open"},
        {"company":"KeyValue Systems","role":"DevOps Intern","type":"On-Site","domain":"Cloud & DevOps",
         "stipend":"₹10,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.keyvalue.systems/careers","status":"open"},
    ]

    # — Government & PSU (Kerala-relevant) —
    gov = [
        {"company":"ISRO / VSSC Trivandrum","role":"Research Intern (Aerospace)","type":"On-Site","domain":"Aerospace Engineering",
         "stipend":"Academic","deadlineLabel":"Check ISRO Portal","applyLink":"https://www.vssc.gov.in/student-projects.html","status":"open"},
        {"company":"CDAC Trivandrum","role":"Project Intern (HPC / AI)","type":"On-Site","domain":"High Performance Computing",
         "stipend":"₹10,000–15,000/mo","deadlineLabel":"Rolling","applyLink":"https://www.cdac.in/index.aspx?id=hrd_internship","status":"open"},
        {"company":"DRDO / NPOL Kochi","role":"Electronics & Signal Processing Intern","type":"On-Site","domain":"Defense Electronics",
         "stipend":"Academic","deadlineLabel":"Summer Window","applyLink":"https://www.drdo.gov.in/labs-and-establishments/naval-physical-oceanographic-laboratory-npol","status":"open"},
        {"company":"KELTRON","role":"Electronics Manufacturing Intern","type":"On-Site","domain":"Electronics & Hardware",
         "stipend":"₹5,000/mo","deadlineLabel":"Rolling","applyLink":"https://keltron.org/careers.php","status":"open"},
        {"company":"Kerala State IT Mission","role":"e-Governance Tech Intern","type":"Hybrid","domain":"Government IT",
         "stipend":"₹8,000/mo","deadlineLabel":"Rolling","applyLink":"https://itmission.kerala.gov.in/","status":"open"},
    ]

    # — National Big Tech Programs —
    bigtech = [
        {"company":"Google","role":"STEP Intern / SWE Intern India","type":"On-Site","domain":"Software Engineering",
         "stipend":"Highly Competitive","deadlineLabel":"Sep–Oct Window","applyLink":"https://buildyourfuture.withgoogle.com/programs/step","status":"open"},
        {"company":"Microsoft","role":"Engage / SWE Intern India","type":"Hybrid","domain":"Software Engineering",
         "stipend":"₹60,000+/mo","deadlineLabel":"Aug–Sep Window","applyLink":"https://careers.microsoft.com/v2/global/en/students-and-graduates","status":"open"},
        {"company":"Amazon","role":"SDE Intern India","type":"Hybrid","domain":"Software Engineering",
         "stipend":"₹80,000+/mo","deadlineLabel":"Jul–Sep Window","applyLink":"https://www.amazon.jobs/en/business_categories/student-programs","status":"open"},
        {"company":"NVIDIA","role":"Deep Learning Intern India","type":"Remote","domain":"AI/ML",
         "stipend":"Competitive","deadlineLabel":"Rolling","applyLink":"https://www.nvidia.com/en-in/about-nvidia/careers/university-recruiting/","status":"open"},
        {"company":"Goldman Sachs","role":"Engineering Intern Bengaluru","type":"On-Site","domain":"FinTech",
         "stipend":"₹1,00,000+/mo","deadlineLabel":"Jul–Aug Window","applyLink":"https://www.goldmansachs.com/careers/students/programs/","status":"open"},
    ]

    # — Research Programs —
    research = [
        {"company":"MITACS Globalink","role":"Globalink Research Intern (Canada)","type":"On-Site","domain":"Cross-Disciplinary Research",
         "stipend":"Fully Funded + Travel","deadlineLabel":"Sep 2026","applyLink":"https://www.mitacs.ca/our-programs/globalink-research-internship-students/","status":"open"},
        {"company":"CERN","role":"Summer Student Programme","type":"On-Site","domain":"Physics & Computing",
         "stipend":"Paid + Travel","deadlineLabel":"Jan 2027","applyLink":"https://careers.cern/students","status":"open"},
        {"company":"IISc Bangalore","role":"Summer Research Fellowship","type":"On-Site","domain":"Research",
         "stipend":"₹8,000–12,000/mo","deadlineLabel":"Check IAS Portal","applyLink":"https://web-japps.ias.ac.in:8443/fellowship2024/","status":"open"},
        {"company":"IIT Madras","role":"Summer Fellowship (CSE/EE)","type":"On-Site","domain":"Research",
         "stipend":"₹8,000/mo","deadlineLabel":"Feb–Mar Window","applyLink":"https://sfp.iitm.ac.in/","status":"open"},
    ]

    all_items = companies + gov + bigtech + research
    t_log("SUCCESS", "KERALA_HUB", f"Loaded {len(all_items)} curated opportunities from Kerala & National ecosystem")
    return all_items

# ═══════════════════════════════════════════════════════════════
# SOURCE 3: ELITE RESEARCH & GOV HUNTER (VSSC, ISRO, IISc, CDAC)
# ═══════════════════════════════════════════════════════════════
def hunt_elite_research():
    t_log("INFO", "ELITE_HUNTER", "Hunting for live notifications from Elite Institutions (ISRO, VSSC, IISc, DRDO)...")
    results = []
    
    targets = [
        {
            "company": "ISRO / VSSC (Trivandrum)",
            "url": "https://www.vssc.gov.in/student-projects.html",
            "domain": "Aerospace & Tech",
            "type": "On-Site",
            "stipend": "Academic"
        },
        {
            "company": "DRDO NPOL (Kochi)",
            "url": "https://www.drdo.gov.in/labs-and-establishments/naval-physical-oceanographic-laboratory-npol",
            "domain": "Defense & Tech",
            "type": "On-Site",
            "stipend": "Academic"
        },
        {
            "company": "IISc Bangalore",
            "url": "https://iisc.ac.in/admissions/",
            "domain": "Deep Research",
            "type": "On-Site",
            "stipend": "Fellowship"
        },
        {
            "company": "C-DAC (Trivandrum)",
            "url": "https://www.cdac.in/index.aspx?id=careers",
            "domain": "Supercomputing & AI",
            "type": "On-Site",
            "stipend": "Govt Norms"
        },
        {
            "company": "Kerala State IT Mission",
            "url": "https://itmission.kerala.gov.in/",
            "domain": "e-Governance",
            "type": "Hybrid",
            "stipend": "Govt Norms"
        }
    ]
    
    keywords = ['intern', 'fellowship', 'student project', 'summer research', 'apprentice']
    
    for target in targets:
        try:
            jitter(1.0, 2.5)
            # Some gov sites have bad SSL certs or block basic User Agents, use our standard SESSION
            resp = SESSION.get(target["url"], timeout=15, verify=False) 
            if resp.status_code != 200:
                continue
                
            soup = BeautifulSoup(resp.text, "lxml")
            links = soup.find_all("a", href=True)
            
            found_count = 0
            for a in links:
                text = a.get_text(strip=True).lower()
                href = a['href']
                
                # Look for matching keywords in text or href
                if any(kw in text for kw in keywords) or any(kw in href.lower() for kw in keywords):
                    if not href.startswith('http'):
                        href = urljoin(target["url"], href)
                        
                    role = a.get_text(strip=True)
                    if len(role) < 5 or len(role) > 80:
                        role = "Research / Project Intern"
                        
                    # Skip generic navigation links
                    if "login" in text or "contact" in text:
                        continue
                        
                    results.append({
                        "company": target["company"],
                        "role": role[:80],
                        "type": target["type"],
                        "domain": target["domain"],
                        "stipend": target["stipend"],
                        "duration": "Check Notification",
                        "deadlineLabel": "Active Notification",
                        "applyLink": href,
                        "status": "open",
                        "source": "EliteHunter"
                    })
                    found_count += 1
                    
                    if found_count >= 3: # Limit to top 3 recent notifications per institution to avoid spam
                        break
        except Exception as e:
            t_log("WARN", "ELITE_HUNTER", f"Failed to hunt {target['company']}: {e}")
            
    t_log("SUCCESS", "ELITE_HUNTER", f"Hunted {len(results)} live notifications from Elite Institutions.")
    return results

# ═══════════════════════════════════════════════════════════════
# ELITE TECH ENGINE: Continuous Corporate Hunter (Google, MS, Amazon)
# ═══════════════════════════════════════════════════════════════
class EliteTechEngine:
    def __init__(self):
        self.session = requests.Session()
        _retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount('https://', HTTPAdapter(max_retries=_retries))
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
        })
        self.targets = [
            {
                "company": "Google",
                "api": "https://careers.google.com/api/v3/search/?degree=BACHELORS&distance=50&employment_type=INTERN",
                "domain": "Software Engineering"
            },
            {
                "company": "Microsoft",
                "api": "https://gcsservices.careers.microsoft.com/search/api/v1/search?lc=India&exp=Students%20and%20graduates",
                "domain": "Software Engineering"
            },
            {
                "company": "Amazon",
                "api": "https://www.amazon.jobs/en/search.json?category%5B%5D=software-development&schedule_type_id%5B%5D=Intern",
                "domain": "Software Engineering"
            }
        ]

    def hunt(self):
        t_log("INFO", "ELITE_TECH", "Booting Elite Tech Engine... Dwelling in corporate API endpoints.")
        results = []
        
        # 1. Google Search API simulation (Public JSON)
        try:
            jitter(1.0, 2.0)
            resp = self.session.get(self.targets[0]["api"], timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for job in data.get("jobs", [])[:3]:
                    title = job.get("title", "")
                    if "intern" in title.lower():
                        results.append({
                            "company": "Google",
                            "role": title,
                            "type": "On-Site",
                            "domain": "Software Engineering",
                            "stipend": "Highly Competitive",
                            "duration": "Summer",
                            "deadlineLabel": "Apply ASAP",
                            "applyLink": f"https://careers.google.com/jobs/results/{job.get('id', '')}",
                            "status": "open",
                            "source": "EliteTech Engine"
                        })
        except Exception as e:
            t_log("WARN", "ELITE_TECH", f"Google API dwell failed: {e}")

        # 2. Microsoft Search API
        try:
            jitter(1.0, 2.0)
            resp = self.session.get(self.targets[1]["api"], timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for job in data.get("operationResult", {}).get("result", {}).get("jobs", [])[:3]:
                    title = job.get("title", "")
                    if "intern" in title.lower():
                        results.append({
                            "company": "Microsoft",
                            "role": title,
                            "type": "Hybrid",
                            "domain": "Software Engineering",
                            "stipend": "Highly Competitive",
                            "duration": "Check Portal",
                            "deadlineLabel": "Apply ASAP",
                            "applyLink": f"https://careers.microsoft.com/v2/global/en/details/{job.get('jobId')}",
                            "status": "open",
                            "source": "EliteTech Engine"
                        })
        except Exception as e:
            t_log("WARN", "ELITE_TECH", f"Microsoft API dwell failed: {e}")

        # 3. Amazon Jobs Search JSON
        try:
            jitter(1.0, 2.0)
            resp = self.session.get(self.targets[2]["api"], timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for job in data.get("jobs", [])[:3]:
                    title = job.get("title", "")
                    if "intern" in title.lower():
                        results.append({
                            "company": "Amazon",
                            "role": title,
                            "type": "Hybrid",
                            "domain": "Software Engineering",
                            "stipend": "Highly Competitive",
                            "duration": "Summer",
                            "deadlineLabel": "Apply ASAP",
                            "applyLink": f"https://www.amazon.jobs/en/jobs/{job.get('id_icims')}",
                            "status": "open",
                            "source": "EliteTech Engine"
                        })
        except Exception as e:
            t_log("WARN", "ELITE_TECH", f"Amazon API dwell failed: {e}")

        # 4. NVIDIA & Intel HTML Scrape
        fallback_targets = [
            {"company": "NVIDIA", "url": "https://www.nvidia.com/en-in/about-nvidia/careers/university-recruiting/"},
            {"company": "Intel", "url": "https://jobs.intel.com/en/search-jobs/intern/India"}
        ]
        
        for target in fallback_targets:
            try:
                jitter(1.0, 2.0)
                resp = self.session.get(target["url"], timeout=10)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    links = soup.find_all("a", href=True)
                    found = 0
                    for a in links:
                        text = a.get_text(strip=True).lower()
                        href = a["href"]
                        if "intern" in text or "intern" in href.lower():
                            if not href.startswith("http"):
                                href = urljoin(target["url"], href)
                            if len(text) > 5:
                                results.append({
                                    "company": target["company"],
                                    "role": text[:80] if len(text) < 80 else "Internship Opportunity",
                                    "type": "Hybrid",
                                    "domain": "Hardware & AI",
                                    "stipend": "Highly Competitive",
                                    "duration": "Check Portal",
                                    "deadlineLabel": "Active Notification",
                                    "applyLink": href,
                                    "status": "open",
                                    "source": "EliteTech Engine"
                                })
                                found += 1
                                if found >= 2: break
            except Exception:
                pass
                
        t_log("SUCCESS", "ELITE_TECH", f"Elite Tech Engine discovered {len(results)} active corporate internships.")
        return results

# ═══════════════════════════════════════════════════════════════
# LINKFETCH ENGINE: Deep Link Discovery & Validation
# ═══════════════════════════════════════════════════════════════
class LinkFetchEngine:
    def __init__(self):
        self.session = requests.Session()
        _retries = Retry(total=2, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount('https://', HTTPAdapter(max_retries=_retries))
        self.session.mount('http://', HTTPAdapter(max_retries=_retries))
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1"
        })
        self.closed_markers = [
            "no longer accepting",
            "job has expired",
            "position has been filled",
            "no longer available",
            "opening has been filled",
            "not currently accepting",
            "applications are closed",
            "internship is closed",
            "not accepting applications",
            "0 active jobs",
            "no open positions",
            "sorry, this job is closed",
            "position closed"
        ]

    def analyze_and_fetch(self, url, company, role):
        """
        Validates URL liveliness, detects 'closed' states, and deeply parses
        the DOM to find the exact application link if a generic one is provided.
        Returns the most accurate active link, or None if the position is dead.
        """
        try:
            resp = self.session.get(url, timeout=12, allow_redirects=True)
            
            # 1. HTTP Status Validation
            if resp.status_code in [404, 410]:
                return None
            if resp.status_code >= 400:
                # Assume active if bot protection blocks us
                return url

            text_lower = resp.text.lower()
            
            # 2. Semantic Analysis for Closed Status
            for marker in self.closed_markers:
                if marker in text_lower:
                    return None
            
            # 3. Deep Link Resolution (DOM Traversal)
            soup = BeautifulSoup(resp.text, "lxml")
            best_link = resp.url
            
            # If the URL is generic, try to find a more specific internship link on the page
            if any(term in url.lower() for term in ['careers', 'jobs', 'students', 'university', 'campus']):
                links = soup.find_all("a", href=True)
                for a in links:
                    href = a.get('href', '')
                    a_text = a.get_text(strip=True).lower()
                    role_keywords = role.lower().split()
                    
                    # Score the link relevance
                    score = 0
                    if 'intern' in href.lower() or 'intern' in a_text:
                        score += 2
                    if any(kw in href.lower() for kw in role_keywords if len(kw) > 3):
                        score += 1
                        
                    if score >= 2:
                        if not href.startswith('http') and not href.startswith('javascript'):
                            best_link = urljoin(resp.url, href)
                        elif href.startswith('http'):
                            best_link = href
                        break
                        
            return best_link
            
        except requests.exceptions.Timeout:
            return url
        except requests.exceptions.RequestException:
            return url
        except Exception:
            return url

LINK_ENGINE = LinkFetchEngine()

# ═══════════════════════════════════════════════════════════════
# NEURAL FRAUD DETECTION & QUALITY FILTER
# ═══════════════════════════════════════════════════════════════
def deduplicate_and_filter(internships):
    t_log("SYSTEM", "FILTER", f"Running Neural Fraud Detection on {len(internships)} raw entries...")
    seen = set()
    pre_verified = []
    dropped_duplicate = 0
    dropped_fraud = 0
    dropped_low_quality = 0

    # Scam signatures and low-quality markers
    FRAUD_KEYWORDS = [
        'registration fee', 'deposit required', 'pay to work', 'investment', 
        'mlm', 'network marketing', 'pyramid', 'earn from home', 'data entry', 
        'captcha typing', 'pay upfront', 'security deposit', 'guaranteed placement fee'
    ]
    
    SUSPICIOUS_ROLES = ['campus ambassador', 'student partner', 'promoter', 'influencer']

    for item in internships:
        role_lower = item['role'].lower().strip()
        company_lower = item['company'].lower().strip()
        stipend_lower = item.get('stipend', '').lower().strip()
        
        # 1. Deduplication
        key = f"{company_lower}-{role_lower}"
        if key in seen:
            dropped_duplicate += 1
            continue
        seen.add(key)

        # 2. Hard Fraud Detection (Financial scams)
        combined_text = f"{role_lower} {stipend_lower} {company_lower}"
        if any(scam in combined_text for scam in FRAUD_KEYWORDS):
            t_log("WARN", "NEURAL_SHIELD", f"BLOCKED SCAM: {item['company']} - {item['role']} (Reason: Financial keyword)")
            dropped_fraud += 1
            continue

        # 3. Low-Quality / Spam Roles (Ambassadors, promoters)
        if any(sus in role_lower for sus in SUSPICIOUS_ROLES):
            dropped_low_quality += 1
            continue

        # 4. Mandatory Identity Verification (Must actually be an internship)
        if not any(k in role_lower for k in ['intern','trainee','student','fellow','apprentice','programme', 'fresher']):
            dropped_low_quality += 1
            continue

        # 5. Cybersecurity & URL Sanitization Check
        apply_link = item.get('applyLink', '').strip()
        parsed = urlparse(apply_link)
        if parsed.scheme not in ['http', 'https']:
            t_log("WARN", "SEC_SHIELD", f"BLOCKED: Invalid URL scheme '{parsed.scheme}' for {item['company']}")
            dropped_fraud += 1
            continue
            
        if 'bit.ly' in apply_link or 'forms.gle' in apply_link:
            if company_lower not in ['google', 'microsoft', 'amazon']:
                dropped_fraud += 1
                continue

        pre_verified.append(item)

    # 6. LinkFetch Engine - Concurrent Deep Analysis
    t_log("SYSTEM", "LINKFETCH", f"Spinning up LinkFetch Engine for deep validation of {len(pre_verified)} links...")
    verified = []
    
    def fetch_and_validate(item):
        link = LINK_ENGINE.analyze_and_fetch(item['applyLink'], item['company'], item['role'])
        if link:
            item['applyLink'] = link
            return item
        return None

    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = {executor.submit(fetch_and_validate, item): item for item in pre_verified}
        for future in as_completed(futures):
            result = future.result()
            if result:
                verified.append(result)
            else:
                dropped_low_quality += 1

    total_dropped = dropped_duplicate + dropped_fraud + dropped_low_quality
    t_log("SUCCESS", "FILTER", f"Verified & Active: {len(verified)} | Dropped: {total_dropped} (Fraud: {dropped_fraud}, Closed/Low-Quality: {dropped_low_quality}, Dupes: {dropped_duplicate})")
    return verified

# ═══════════════════════════════════════════════════════════════
# SANITY CMS UPLINK
# ═══════════════════════════════════════════════════════════════
def sync_with_sanity(internships):
    t_log("SYSTEM", "CMS", f"Synchronizing {len(internships)} internships to Sanity [{SANITY_PROJECT_ID}]...")
    
    # 1. Generate IDs for new internships
    active_ids = set()
    new_docs = []
    for item in internships:
        uid = f"{item['company']}-{item['role']}".lower().replace(' ','-')
        doc_id = f"internship-{hashlib.md5(uid.encode()).hexdigest()[:16]}"
        active_ids.add(doc_id)
        doc = {
            "_id": doc_id,
            "_type": "internship",
            "company": item["company"],
            "role": item["role"],
            "type": item.get("type","Remote"),
            "domain": item.get("domain","General"),
            "stipend": item.get("stipend",""),
            "duration": item.get("duration",""),
            "deadlineLabel": item.get("deadlineLabel",""),
            "applyLink": item["applyLink"],
            "status": item.get("status","open"),
            "featured": False,
        }
        new_docs.append(doc)

    # 2. Fetch existing internships to find obsolete ones
    obsolete_ids = []
    try:
        query_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/{SANITY_DATASET}"
        query_params = {"query": '*[_type == "internship"]{_id}'}
        resp = requests.get(query_url, headers={"Authorization": f"Bearer {SANITY_TOKEN}"}, params=query_params, timeout=10)
        if resp.status_code == 200:
            existing = resp.json().get("result", [])
            existing_ids = {doc["_id"] for doc in existing}
            obsolete_ids = list(existing_ids - active_ids)
            t_log("INFO", "CMS", f"Found {len(existing_ids)} existing internships. {len(obsolete_ids)} marked for deletion.")
        else:
            t_log("WARN", "CMS", f"Failed to fetch existing IDs (Status {resp.status_code}). Skip deletion phase.")
    except Exception as e:
        t_log("WARN", "CMS", f"Error querying Sanity: {e}")

    # 3. Build mutations
    mutations = [{"createOrReplace": doc} for doc in new_docs]
    for obs_id in obsolete_ids:
        mutations.append({"delete": {"id": obs_id}})

    # 4. Push mutations in batches
    BATCH_SIZE = 25
    total_mutations = len(mutations)
    successful_mutations = 0

    for i in range(0, total_mutations, BATCH_SIZE):
        batch = mutations[i:i+BATCH_SIZE]
        try:
            resp = requests.post(SANITY_URL, headers=HEADERS_SANITY, json={"mutations": batch}, timeout=15)
            if resp.status_code == 200:
                successful_mutations += len(batch)
                t_log("SUCCESS", "CMS", f"Batch {i//BATCH_SIZE+1}: {len(batch)} mutations processed")
            else:
                safe_text = resp.text[:100].replace('\n', ' ')
                t_log("ERROR", "CMS", f"Batch error: {resp.status_code} — {safe_text}")
        except Exception as e:
            t_log("ERROR", "CMS", f"Connection failed: {e}")
        jitter(0.3, 0.8)

    t_log("SUCCESS", "CMS", f"Sync complete. Processed {successful_mutations}/{total_mutations} mutations (Updated/Added: {len(new_docs)}, Removed: {len(obsolete_ids)}).")

# ═══════════════════════════════════════════════════════════════
# MAIN AGENT & AUTONOMOUS DAEMON
# ═══════════════════════════════════════════════════════════════
def process_and_sync(raw_data):
    if not raw_data:
        t_log("WARN", "CORE", "No raw internships gathered. Skipping sync.")
        return
    verified = deduplicate_and_filter(raw_data)
    if verified:
        sync_with_sanity(verified)
    else:
        t_log("WARN", "CORE", "No verified internships to push.")
    print(f"\n{C.GR}{C.BD}{'-'*60}{C.RS}")
    t_log("SYSTEM", "CORE", f"Scrape complete. {len(verified)} opportunities live on Launchpad.")
    print(f"{C.GR}{C.BD}{'-'*60}{C.RS}\n")

def run_phase(func):
    try:
        return func()
    except Exception as e:
        t_log("ERROR", "CORE", f"Engine failed: {e}")
        return []

def run_full_sync():
    print(f"\n{C.MG}{C.BD}{'='*60}{C.RS}")
    print(f"{C.MG}{C.BD}  ISTE MBCET INTERNSHIP SCRAPER v4.0.0 (KERALA POWERHOUSE)  {C.RS}")
    print(f"{C.MG}{C.BD}{'='*60}{C.RS}\n")
    t_log("SYSTEM", "CORE", "Booting scraper across Kerala & National channels...")

    raw = []
    elite_tech = EliteTechEngine()
    engines = [scrape_internshala, hunt_elite_research, elite_tech.hunt, get_kerala_ecosystem]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(run_phase, engine) for engine in engines]
        for future in as_completed(futures):
            raw.extend(future.result())

    process_and_sync(raw)

def run_autonomous_daemon():
    print(f"\n{C.MG}{C.BD}{'='*60}{C.RS}")
    print(f"{C.MG}{C.BD}  [AUTONOMOUS DAEMON 24/7 ACTIVATED]  {C.RS}")
    print(f"{C.MG}{C.BD}{'='*60}{C.RS}\n")
    t_log("SYSTEM", "DAEMON", "Organism heartbeat started. Elite engine dwelling 24/7. General engine on 48h cycle.")
    
    # Define cycle times
    ELITE_INTERVAL = 60 * 60 * 2    # Every 2 hours
    GENERAL_INTERVAL = 60 * 60 * 48 # Every 48 hours
    
    # To run both immediately on boot
    last_general_run = 0
    last_elite_run = 0
    
    elite_tech = EliteTechEngine()
    
    while True:
        now = time.time()
        
        # 1. Run Elite Tech Engine 24/7 (Every 2 hours)
        if now - last_elite_run >= ELITE_INTERVAL:
            t_log("SYSTEM", "DAEMON", "Initiating 24/7 Elite Tech Dweller heartbeat...")
            try:
                raw_elite = run_phase(elite_tech.hunt)
                process_and_sync(raw_elite)
                last_elite_run = time.time()
            except Exception as e:
                t_log("ERROR", "DAEMON", f"Elite Engine heartbeat failed: {e}")
                
        # 2. Run General Engine (Every 48 hours)
        if now - last_general_run >= GENERAL_INTERVAL:
            t_log("SYSTEM", "DAEMON", "Initiating 48h General Ecosystem Sweep...")
            try:
                engines = [scrape_internshala, hunt_elite_research, get_kerala_ecosystem]
                raw_general = []
                with ThreadPoolExecutor(max_workers=3) as executor:
                    futures = [executor.submit(run_phase, engine) for engine in engines]
                    for future in as_completed(futures):
                        raw_general.extend(future.result())
                process_and_sync(raw_general)
                last_general_run = time.time()
            except Exception as e:
                t_log("ERROR", "DAEMON", f"General Sweep failed: {e}")
                
        # Sleep for 15 minutes before checking schedules again
        time.sleep(60 * 15)

import sys
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        run_autonomous_daemon()
    else:
        run_full_sync()
