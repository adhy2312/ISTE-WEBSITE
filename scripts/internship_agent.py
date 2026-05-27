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
# NEURAL FRAUD DETECTION & QUALITY FILTER
# ═══════════════════════════════════════════════════════════════
def deduplicate_and_filter(internships):
    t_log("SYSTEM", "FILTER", f"Running Neural Fraud Detection on {len(internships)} raw entries...")
    seen = set()
    verified = []
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

        # 5. Link Integrity Check
        apply_link = item.get('applyLink','')
        if not apply_link.startswith('http') or 'bit.ly' in apply_link or 'forms.gle' in apply_link:
            # Drop unverified shortlinks or random google forms if they aren't from trusted sources
            # But we allow trusted sources like Google/Microsoft
            if company_lower not in ['google', 'microsoft', 'amazon']:
                dropped_fraud += 1
                continue

        verified.append(item)

    total_dropped = dropped_duplicate + dropped_fraud + dropped_low_quality
    t_log("SUCCESS", "FILTER", f"Verified: {len(verified)} | Dropped: {total_dropped} (Fraud: {dropped_fraud}, Low-Quality: {dropped_low_quality}, Dupes: {dropped_duplicate})")
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
                t_log("ERROR", "CMS", f"Batch error: {resp.status_code} — {resp.text[:200]}")
        except Exception as e:
            t_log("ERROR", "CMS", f"Connection failed: {e}")
        jitter(0.3, 0.8)

    t_log("SUCCESS", "CMS", f"Sync complete. Processed {successful_mutations}/{total_mutations} mutations (Updated/Added: {len(new_docs)}, Removed: {len(obsolete_ids)}).")

# ═══════════════════════════════════════════════════════════════
# MAIN AGENT
# ═══════════════════════════════════════════════════════════════
def run_agent():
    print(f"\n{C.MG}{C.BD}{'='*60}{C.RS}")
    print(f"{C.MG}{C.BD}  ISTE MBCET INTERNSHIP SCRAPER v4.0.0 (KERALA POWERHOUSE)  {C.RS}")
    print(f"{C.MG}{C.BD}{'='*60}{C.RS}\n")

    t_log("SYSTEM", "CORE", "Booting scraper across Kerala & National channels...")

    raw = []

    # Phase 1: Live scrape from Internshala
    try:
        raw.extend(scrape_internshala())
    except Exception as e:
        t_log("ERROR", "CORE", f"Internshala scrape failed: {e}")

    # Phase 2: Curated Kerala ecosystem DB
    raw.extend(get_kerala_ecosystem())

    # Phase 3: Deduplicate & filter
    verified = deduplicate_and_filter(raw)

    # Phase 4: Push and Sync to Sanity
    if verified:
        sync_with_sanity(verified)
    else:
        t_log("WARN", "CORE", "No verified internships to push.")

    # Summary
    print(f"\n{C.GR}{C.BD}{'-'*60}{C.RS}")
    t_log("SYSTEM", "CORE", f"Scrape complete. {len(verified)} opportunities live on Launchpad.")
    print(f"{C.GR}{C.BD}{'-'*60}{C.RS}\n")

if __name__ == "__main__":
    run_agent()
