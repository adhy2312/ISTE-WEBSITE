import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import embeddingsCache from '@/skill_embeddings_cache.json';

// Observability metrics stored internally in memory
const internalMetrics = {
  requests: 0,
  averageMatchScore: 0,
  domainCounts: {} as Record<string, number>,
  missingSkills: {} as Record<string, number>,
  latencies: [] as number[],
};

// Calculate dot product (cosine similarity since SentenceTransformer vectors are L2 normalized)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const studentProfile = await req.json();
    internalMetrics.requests++;

    // 1. Load Pre-computed Embeddings Cache statically to support Vercel Serverless
    // The JSON is bundled by Webpack/Turbopack automatically.

    const normalize = (s: string) => {
      const canonical: Record<string, string> = { "reactjs": "React", "react.js": "React", "ml": "Machine Learning", "ai": "AI" };
      const low = s.toLowerCase().trim();
      return canonical[low] || s.trim();
    };

    // 2. Fetch Active, Verified Internships from Sanity
    // Only verified internships are eligible (Hard Verification Gate)
    const internships = await client.fetch(`
      *[_type == "internship" && state == "VERIFIED" && verificationStatus == "VERIFIED"] {
        _id, company, role, domain, type, qualityScore, linkHealthScore, verificationStatus,
        requiredSkills, preferredSkills, bonusSkills
      }
    `);

    const studentSkills = (studentProfile.skills || []).map(normalize);
    const interests = [...(studentProfile.interests || []), ...(studentProfile.preferredDomains || [])].map(normalize);

    const results = {
      topMatches: [] as any[],
      nearMatches: [] as any[],
      growthOpportunities: [] as any[],
      notRecommended: [] as any[]
    };

    let totalScoreAccumulator = 0;

    for (const opp of internships) {
      const reqSkills = (opp.requiredSkills || []).map(normalize);
      const prefSkills = (opp.preferredSkills || []).map(normalize);
      const allJobSkills = [...new Set([...reqSkills, ...prefSkills])];

      let scoreAccumulator = 0;
      let weightTotal = 0;
      const matched = [];
      const missing = [];

      // A. Skill Match Score (40%)
      for (const jSkill of allJobSkills) {
        const weight = reqSkills.includes(jSkill) ? 1.0 : 0.5;
        weightTotal += weight;

        let bestScore = 0;
        let bestStudentSkill = "";

        for (const sSkill of studentSkills) {
          let sim = 0;
          if (sSkill.toLowerCase() === jSkill.toLowerCase()) {
            sim = 1.0; // Exact match
          } else if (embeddingsCache[sSkill] && embeddingsCache[jSkill]) {
            sim = cosineSimilarity(embeddingsCache[sSkill], embeddingsCache[jSkill]);
          }
          
          if (sim > bestScore) {
            bestScore = sim;
            bestStudentSkill = sSkill;
          }
        }

        if (bestScore >= 0.65) {
          matched.push({ jobSkill: jSkill, studentSkill: bestStudentSkill });
          scoreAccumulator += (bestScore * weight);
        } else {
          missing.push(jSkill);
          internalMetrics.missingSkills[jSkill] = (internalMetrics.missingSkills[jSkill] || 0) + 1;
          if (bestScore > 0.3) {
            scoreAccumulator += (bestScore * 0.5 * weight); // Partial semantic credit
          }
        }
      }

      const skillMatchScore = weightTotal > 0 ? (scoreAccumulator / weightTotal) * 100 : 50;

      // B. Internship Quality Score (20%)
      const qualityScore = opp.qualityScore || 50;

      // C. Verification Confidence (15%)
      const health = opp.linkHealthScore || 0;
      const statusScore = opp.verificationStatus === "VERIFIED" ? 100 : 0;
      const verificationScore = (health * 0.7) + (statusScore * 0.3);

      // D. Domain Alignment (15%)
      let domainScore = 0;
      if (opp.domain && interests.length > 0) {
        for (const interest of interests) {
          if (interest.toLowerCase() === opp.domain.toLowerCase()) {
            domainScore = 100;
            break;
          } else if (embeddingsCache[interest] && embeddingsCache[opp.domain]) {
            const sim = cosineSimilarity(embeddingsCache[interest], embeddingsCache[opp.domain]);
            if (sim * 100 > domainScore) domainScore = sim * 100;
          }
        }
      }
      if (domainScore > 0) {
        internalMetrics.domainCounts[opp.domain] = (internalMetrics.domainCounts[opp.domain] || 0) + 1;
      }

      // E. Opportunity Accessibility (10%)
      let accessScore = 50;
      const wType = (opp.type || "Remote").toLowerCase();
      if (wType.includes("remote")) accessScore = 100;
      else if (wType.includes("hybrid")) accessScore = 75;

      // Final 5-Factor Calculation
      let finalScore = (
        (skillMatchScore * 0.40) +
        (qualityScore * 0.20) +
        (verificationScore * 0.15) +
        (domainScore * 0.15) +
        (accessScore * 0.10)
      );
      finalScore = Math.min(100, Math.max(0, finalScore));
      totalScoreAccumulator += finalScore;

      // Categorization
      let bucket = "notRecommended";
      if (finalScore >= 85) bucket = "topMatches";
      else if (finalScore >= 70) bucket = "nearMatches";
      else if (finalScore >= 50) bucket = "growthOpportunities";

      // Explainability Engine
      const explanation = [];
      if (matched.length > 0) {
        explanation.push(`Recommended because your experience with ${matched[0].studentSkill} closely matches their requirements.`);
      }
      if (missing.length > 0) {
        explanation.push(`You are missing ${missing.slice(0, 2).join(", ")}, but the role remains a strong fit.`);
      }
      if (domainScore > 75) {
        explanation.push(`High domain alignment with your interest in this field.`);
      }

      const item = {
        internship: opp,
        analysis: {
          personalizedScore: Math.round(finalScore),
          skillMatchScore: Math.round(skillMatchScore),
          matchedSkills: matched.map(m => m.jobSkill),
          missingSkills: missing,
          explanation: explanation.join(" ") || "General match based on quality and verification."
        }
      };

      (results as any)[bucket].push(item);
    }

    // Sort buckets
    results.topMatches.sort((a, b) => b.analysis.personalizedScore - a.analysis.personalizedScore);
    results.nearMatches.sort((a, b) => b.analysis.personalizedScore - a.analysis.personalizedScore);
    results.growthOpportunities.sort((a, b) => b.analysis.personalizedScore - a.analysis.personalizedScore);

    // Update Internal Metrics
    const latency = Date.now() - startTime;
    internalMetrics.latencies.push(latency);
    internalMetrics.averageMatchScore = totalScoreAccumulator / (internships.length || 1);

    // Return exact API schema required by v10.2 directive
    return NextResponse.json({
      topMatches: results.topMatches,
      nearMatches: results.nearMatches,
      growthOpportunities: results.growthOpportunities
    }, {
      headers: { "X-Response-Time-Ms": latency.toString() }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Recommendation Error" }, { status: 500 });
  }
}
