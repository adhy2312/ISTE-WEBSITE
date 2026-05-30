import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

class SkillIntelligenceEngine:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Initializes the Semantic Skill Engine.
        Uses SentenceTransformers for dense vector embeddings to understand intent and conceptual proximity.
        """
        print(f"[SKILL_ENGINE] Loading neural semantic model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        
        # Canonical Normalization Map (can be expanded dynamically or loaded from DB)
        self.canonical_map = {
            "reactjs": "React", "react.js": "React", "react": "React",
            "node.js": "Node.js", "nodejs": "Node.js",
            "vuejs": "Vue", "vue.js": "Vue",
            "ml": "Machine Learning", "ai": "Artificial Intelligence",
            "tf": "TensorFlow", "k8s": "Kubernetes"
        }

    def normalize_skill(self, skill: str) -> str:
        s_lower = skill.strip().lower()
        return self.canonical_map.get(s_lower, skill.strip().title())

    def _get_similarity_matrix(self, student_skills, job_skills):
        """Calculates cosine similarity between all student skills and job skills."""
        if not student_skills or not job_skills:
            return np.zeros((len(student_skills), len(job_skills)))
        
        student_emb = self.model.encode(student_skills, convert_to_tensor=True)
        job_emb = self.model.encode(job_skills, convert_to_tensor=True)
        
        # Returns a matrix of shape (len(student_skills), len(job_skills))
        cosine_scores = util.cos_sim(student_emb, job_emb).cpu().numpy()
        return cosine_scores

    def match_profile_to_internship(self, student_profile: dict, internship: dict, similarity_threshold=0.65) -> dict:
        """
        Matches a student profile against an internship.
        student_profile: {"skills": ["Python", "React", "Git"], "interests": ["frontend"]}
        internship: {"requiredSkills": [...], "preferredSkills": [...], "qualityScore": 85, ...}
        """
        raw_student_skills = student_profile.get("skills", [])
        student_skills = [self.normalize_skill(s) for s in raw_student_skills]
        
        req_skills = [self.normalize_skill(s) for s in internship.get("requiredSkills", [])]
        pref_skills = [self.normalize_skill(s) for s in internship.get("preferredSkills", [])]
        all_job_skills = list(set(req_skills + pref_skills))

        # Handle edge case where no skills are specified
        if not all_job_skills:
            return {
                "match_score": 50,
                "matched_skills": [],
                "missing_skills": [],
                "category": "Stretch Opportunity",
                "explanation": "This internship did not specify exact skills. It might be a general or introductory role.",
                "estimated_prep_time": "Unknown"
            }

        # Calculate semantic similarities
        similarity_matrix = self._get_similarity_matrix(student_skills, all_job_skills)
        
        matched_skills = []
        missing_skills = []
        
        # For each job skill, find the best matching student skill
        score_accumulator = 0.0
        weight_total = 0.0
        
        for j_idx, j_skill in enumerate(all_job_skills):
            weight = 1.0 if j_skill in req_skills else 0.5
            weight_total += weight
            
            if len(student_skills) > 0:
                best_match_idx = np.argmax(similarity_matrix[:, j_idx])
                best_score = similarity_matrix[best_match_idx, j_idx]
            else:
                best_score = 0.0
                
            if best_score >= similarity_threshold:
                # Semantic match found (e.g. Next.js ≈ React score > 0.65)
                matched_skills.append({
                    "job_skill": j_skill,
                    "student_skill": student_skills[best_match_idx],
                    "confidence": float(best_score)
                })
                score_accumulator += (best_score * weight)
            else:
                missing_skills.append(j_skill)
                # Apply partial credit if there's a weak relation (e.g. score 0.4)
                if best_score > 0.3:
                    score_accumulator += (best_score * 0.5 * weight)

    def compute_personalized_score(self, student_profile: dict, internship: dict) -> dict:
        """
        v10.2 Ranking Factors
        1. Skill Match Score (40%)
        2. Internship Quality Score (20%)
        3. Verification Confidence (15%)
        4. Domain Alignment (15%)
        5. Opportunity Accessibility (10%)
        """
        # 1. Skill Match (40%)
        base_match = self.match_profile_to_internship(student_profile, internship, similarity_threshold=0.65)
        skill_score = base_match["match_score"]
        
        # 2. Quality Score (20%)
        quality_score = internship.get("qualityScore", 50)
        
        # 3. Verification Confidence (15%)
        # linkHealthScore, verificationStatus, sourceReputation
        health = internship.get("linkHealthScore", 0)
        status = internship.get("verificationStatus", "UNVERIFIED")
        status_score = 100 if status == "VERIFIED" else (50 if status == "SUSPECT" else 0)
        verification_score = (health * 0.7) + (status_score * 0.3)
        
        # 4. Domain Alignment (15%)
        domain = internship.get("domain", "")
        interests = student_profile.get("interests", [])
        preferred = student_profile.get("preferredDomains", [])
        combined_interests = list(set(interests + preferred))
        
        domain_score = 0
        if domain and combined_interests:
            domain_sim = self._get_similarity_matrix(combined_interests, [domain])
            domain_score = float(np.max(domain_sim) * 100)
            
        # 5. Opportunity Accessibility (10%)
        # Remote = 100, Hybrid = 75, On-Site = 50 (if location matches, but we simplify for now)
        work_type = internship.get("type", "Remote").lower()
        if "remote" in work_type:
            access_score = 100
        elif "hybrid" in work_type:
            access_score = 75
        else:
            access_score = 50
            
        # Final Weighted Calculation
        final_score = (
            (skill_score * 0.40) +
            (quality_score * 0.20) +
            (verification_score * 0.15) +
            (domain_score * 0.15) +
            (access_score * 0.10)
        )
        final_score = min(100, max(0, final_score))
        
        # Categorization Buckets
        if final_score >= 85:
            bucket = "Top Matches"
        elif final_score >= 70:
            bucket = "Near Matches"
        elif final_score >= 50:
            bucket = "Growth Opportunities"
        else:
            bucket = "Not Recommended"
            
        # Explainability Engine Update
        explanation = []
        if base_match.get("matched_skills"):
            explanation.append(f"Your experience with {', '.join(base_match['matched_skills'][:2])} closely matches their requirements.")
        if base_match.get("missing_skills"):
            explanation.append(f"You are missing {', '.join(base_match['missing_skills'][:2])}, but the role remains a strong fit.")
        if domain_score > 75:
            explanation.append(f"High domain alignment with your interest in {combined_interests[0] if combined_interests else 'this field'}.")
        
        return {
            "internship_id": internship.get("_id"),
            "personalized_score": final_score,
            "bucket": bucket,
            "skill_match_score": skill_score,
            "quality_score": quality_score,
            "verification_score": verification_score,
            "domain_score": domain_score,
            "accessibility_score": access_score,
            "matched_skills": base_match.get("matched_skills", []),
            "missing_skills": base_match.get("missing_skills", []),
            "explanation": " ".join(explanation)
        }

    def rank_internships(self, student_profile: dict, internships: list) -> dict:
        """
        Ranks internships and groups into the requested API response buckets.
        """
        response = {
            "topMatches": [],
            "nearMatches": [],
            "growthOpportunities": [],
            "notRecommended": [] # Internal use
        }
        
        for opp in internships:
            # Enforce Verification Gate at Ranking Layer
            if opp.get("verificationStatus") != "VERIFIED":
                continue
                
            analysis = self.compute_personalized_score(student_profile, opp)
            item = {"internship": opp, "analysis": analysis}
            
            if analysis["bucket"] == "Top Matches":
                response["topMatches"].append(item)
            elif analysis["bucket"] == "Near Matches":
                response["nearMatches"].append(item)
            elif analysis["bucket"] == "Growth Opportunities":
                response["growthOpportunities"].append(item)
            else:
                response["notRecommended"].append(item)
                
        # Sort each bucket
        for key in response:
            response[key].sort(key=lambda x: x["analysis"]["personalized_score"], reverse=True)
            
        return response

    def generate_global_skill_embeddings(self, common_skills_list, output_path="skill_embeddings_cache.json"):
        """
        Pre-computes embeddings for low-latency Next.js API usage.
        Prevents loading PyTorch at request time.
        """
        print("[SKILL_ENGINE] Generating static embedding cache...")
        cache = {}
        for skill in common_skills_list:
            emb = self.model.encode(skill).tolist()
            cache[self.normalize_skill(skill)] = emb
            
        with open(output_path, 'w') as f:
            json.dump(cache, f)
        print(f"[SKILL_ENGINE] Exported {len(cache)} embeddings to {output_path}")

# Pre-compute common skills for Next.js API
if __name__ == "__main__":
    engine = SkillIntelligenceEngine()
    common_skills = [
        "Python", "React", "Git", "Tailwind", "Next.js", "Docker", "AWS", 
        "Machine Learning", "AI", "Frontend", "Backend", "Web Development",
        "Embedded", "IoT", "C++", "Java", "SQL", "PostgreSQL"
    ]
    engine.generate_global_skill_embeddings(common_skills, "skill_embeddings_cache.json")
