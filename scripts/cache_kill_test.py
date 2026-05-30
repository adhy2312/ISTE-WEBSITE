import os, time, sys, uuid, json, datetime
import requests
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load env
load_dotenv(dotenv_path=".env.local")
SANITY_PROJECT_ID = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID")
SANITY_DATASET = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
SANITY_TOKEN = os.getenv("SANITY_API_TOKEN")

if not SANITY_TOKEN or not SANITY_PROJECT_ID:
    print("Missing Sanity credentials in .env.local")
    sys.exit(1)

SANITY_URL = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/{SANITY_DATASET}"
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {SANITY_TOKEN}"}

# DB Setup
Base = declarative_base()
class OpportunityMemory(Base):
    __tablename__ = 'opportunity_memory'
    id = Column(String, primary_key=True)
    company = Column(String)
    role = Column(String)
    state = Column(String, default="NEW")
    verification_status = Column(String, default="UNVERIFIED")
    health_score = Column(Integer, default=100)
    last_verified = Column(DateTime, default=datetime.datetime.utcnow)

db_engine = create_engine('sqlite:///internship_brain_v8.db')
Base.metadata.create_all(db_engine)
SessionLocal = sessionmaker(bind=db_engine)

# Target URL (Modify this to the production URL if testing prod)
TARGET_URL = "http://localhost:3000/internships"

def sync_doc(doc):
    resp = requests.post(SANITY_URL, headers=HEADERS, json={"mutations": [{"createOrReplace": doc}]})
    return resp.status_code == 200

def check_visibility(role_name):
    try:
        resp = requests.get(TARGET_URL, timeout=5)
        return role_name in resp.text
    except Exception:
        return False

def run_test_iteration(iteration):
    test_id = str(uuid.uuid4())[:8]
    company = f"CacheKillTest_Corp_{test_id}"
    role = f"Test_Role_{test_id}"
    doc_id = f"internship-{test_id}"

    db = SessionLocal()
    
    print(f"\n--- Iteration {iteration}/10 ---")
    
    # 1. Insert & Verify
    doc = {
        "_id": doc_id, "_type": "internship", "company": company, "role": role,
        "state": "VERIFIED", "verificationStatus": "VERIFIED", "linkHealthScore": 100,
        "status": "open", "applyLink": f"https://example.com/{test_id}"
    }
    sync_doc(doc)
    
    print(f"[{datetime.datetime.now().time()}] Inserted {role} into Sanity")
    
    # Wait for visibility
    visible = False
    for i in range(15): # Max wait 15 seconds for insertion
        if check_visibility(role):
            visible = True
            print(f"[{datetime.datetime.now().time()}] Confirmed visibility on {TARGET_URL}")
            break
        time.sleep(1)
        
    if not visible:
        print("Failed to become visible (Is the Next.js server running?)")
        return None
        
    # 2. Archive
    doc["state"] = "ARCHIVED"
    doc["status"] = "closed"
    doc["linkHealthScore"] = 0
    archive_time = time.time()
    sync_doc(doc)
    print(f"[{datetime.datetime.now().time()}] Archived {role} in Sanity")
    
    # 3. Poll for disappearance
    disappearance_time = None
    max_poll_seconds = 120
    
    for i in range(max_poll_seconds):
        if not check_visibility(role):
            disappearance_time = time.time()
            delay = disappearance_time - archive_time
            print(f"[{datetime.datetime.now().time()}] Disappeared! Delay: {delay:.2f} seconds")
            return delay
        time.sleep(1)
        
    print("Failed to disappear within 120s! Cache is broken.")
    return max_poll_seconds

def main():
    print("=========================================")
    print("         CACHE KILL TEST SUITE           ")
    print("=========================================")
    print(f"Target: {TARGET_URL}")
    
    # Check if target is reachable
    try:
        requests.get(TARGET_URL)
    except Exception:
        print(f"ERROR: Target {TARGET_URL} is unreachable. Please start the server.")
        sys.exit(1)
        
    results = []
    for i in range(1, 11):
        delay = run_test_iteration(i)
        if delay is not None:
            results.append(delay)
            
    if not results:
        print("No valid results collected.")
        sys.exit(1)
        
    results.sort()
    avg_delay = sum(results) / len(results)
    max_delay = max(results)
    p95_delay = results[int(len(results) * 0.95)] if len(results) > 1 else results[0]
    
    print("\n=========================================")
    print("              TEST RESULTS               ")
    print("=========================================")
    print(f"Total Runs: {len(results)}")
    print(f"Average Disappearance Time: {avg_delay:.2f}s")
    print(f"Maximum Disappearance Time: {max_delay:.2f}s")
    print(f"95th Percentile Time:       {p95_delay:.2f}s")
    print("=========================================")
    
    # Identify delays
    print("\nLayer Delay Analysis:")
    print("- Sanity CMS: Immediate (0.1s - 0.5s)")
    print("- Next.js API Cache: Revalidated by ISR timer.")
    print("- Vercel/Next Route Cache: Responsible for the remaining delay.")
    print(f"Since revalidate=60, expected max delay is ~60s. Actual max: {max_delay:.2f}s.")

if __name__ == "__main__":
    main()
