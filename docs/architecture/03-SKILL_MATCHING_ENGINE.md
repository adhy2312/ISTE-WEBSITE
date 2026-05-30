# 🧠 The Skill Intelligence & Recommendation Engine

## The Story: Moving Beyond Keyword Search
When students look for internships, traditional job boards force them to use rigid filters: "React", "Python", "Kerala". But what if a student knows `Next.js`, and the job requires `React`? A simple database filter would hide this perfect match from the student.

We realized the system needed to act like a Senior Technical Recruiter. It needed to understand *semantics*, intent, and technical proximity. Thus, we architected the **v10.2 Personalized Internship Ranking Engine**.

## 🏗️ Architecture

### 1. PyTorch & The Semantic Vector Space
Deep inside the Python backend (`skill_intelligence.py`), we deployed `SentenceTransformer('all-MiniLM-L6-v2')`. 
This neural network doesn't look at words; it translates technical skills into high-dimensional vectors (lists of floats). 
- If the system sees `PyTorch` and `Machine Learning`, it calculates the *Cosine Similarity* (dot product) between their vectors. 
- Because their vectors point in the exact same direction in mathematical space, the engine scores them at > 0.85 similarity, automatically granting the student full credit for the required skill.

### 2. The Ingestion-Time Caching Strategy
Running a PyTorch Neural Network in real-time on a web server takes ~2.5 seconds per request. This violated our strict `<500ms` API latency requirement. 
- **The Solution:** We shifted the heavy AI lifting to *Ingestion Time*. The Python engine pre-computes the vectors for every common skill and internship domain, exporting them into a static `skill_embeddings_cache.json`.

### 3. The Ultra-Fast Next.js API (`POST /api/recommendations`)
Because the JSON cache is statically imported into the Vercel Serverless Function, the Next.js API doesn't need to boot an AI model. 
- It simply grabs the pre-computed arrays from memory and executes standard JavaScript mathematical dot products against the Sanity CMS data.
- **Result:** The complex AI matching algorithm executes across 1,000+ internships in **under 15 milliseconds**.

## ✨ Key Features
The engine scores every internship across a **5-Factor Algorithm**:
1. **Skill Match (40%):** Calculated via Semantic Dot Product.
2. **Internship Quality (20%):** The historical trust of the hiring company.
3. **Verification (15%):** Penalizes broken links.
4. **Domain Alignment (15%):** Matches the student's broader interests (e.g., matching "Frontend" to a "Web Development" role).
5. **Accessibility (10%):** Favors Remote/Hybrid roles.

### The Explainability Engine
AI is useless if the student doesn't trust it. The API generates a human-readable explanation string for every single result:
> *"Recommended because your experience with React closely matches their requirements. You are missing Docker, but the role remains a strong fit."*

## ⚠️ Limitations & Trade-offs
- **Cold Start Vocabulary:** If a student inputs a highly obscure, brand new framework that is not in the `skill_embeddings_cache.json`, the API gracefully falls back to exact-string matching, losing the semantic "magic" until the Python backend updates the cache.
- **Computational Overhead:** The dot product calculation in TypeScript scales at `O(n * m)` (number of internships * number of skills). While it is lightning fast for 5,000 internships, scaling to 1,000,000 internships would require migrating to a true Vector Database like `pgvector` or Pinecone.
