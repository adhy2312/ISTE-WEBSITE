import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'resume_ml_knowledge.json');

// Initialize ML Knowledge Base if it doesn't exist
if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
  fs.writeFileSync(KNOWLEDGE_BASE_PATH, JSON.stringify({ commonFlaws: [], totalAnalyzed: 0 }));
}

export async function POST(req: Request) {
  try {
    const { resumeText, liveInternships } = await req.json();

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ success: false, error: 'Resume text too short.' }, { status: 400 });
    }

    // Load ML Knowledge Base
    const mlData = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8'));
    const topFlaws = mlData.commonFlaws.slice(0, 5).join(', ');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const prompt = `
      You are an elite, highly accurate ATS (Applicant Tracking System) and a Senior Technical Recruiter at a FAANG company.
      Your task is to analyze the provided resume text with 1000% accuracy, extreme strictness, and zero hallucination.
      
      [MACHINE LEARNING CONTEXT]
      Over time, you have analyzed ${mlData.totalAnalyzed} resumes from this college.
      The most frequent critical flaws candidates make are: ${topFlaws || "None yet. Be highly vigilant."}.
      Use this historical data to be exceptionally strict if this resume makes these same mistakes.
      
      Evaluate the resume based on:
      1. Impact & Metrics (Are there quantifiable results?)
      2. Action Verbs (Does it start with strong verbs?)
      3. Keyword Optimization (Are standard technical terms used correctly?)
      4. Formatting & Conciseness (Is the text rambling or focused?)
      5. Relevance to modern engineering/tech internships.

      [LIVE INTERNSHIP MATCHING]
      I am providing you an array of currently open internships. You must evaluate the candidate's resume against EACH of these specific roles.
      For each role, calculate a "matchScore" (0-100) representing how likely their resume is to pass an ATS scan for that exact role.
      
      Live Internships Data:
      ${liveInternships ? JSON.stringify(liveInternships) : '[]'}

      Return ONLY a raw JSON string (no markdown, no backticks, no comments) matching exactly this schema:
      {
        "score": number (0-100, be brutally honest. Average resumes should score 40-60. Only elite resumes get 80+),
        "verdict": "string (One sentence brutal summary of the resume's quality)",
        "strengths": ["string", "string"],
        "criticalFlaws": ["string", "string"],
        "lineByLineImprovements": [
          {
            "original_issue": "string (e.g. 'Responsible for fixing bugs')",
            "suggested_fix": "string (e.g. 'Resolved 40+ critical bugs leading to 15% increase in uptime')",
            "reason": "string"
          }
        ],
        "atsKeywordsMissing": ["string", "string"],
        "internshipMatches": [
          {
            "internshipId": "string (from the provided Live Internships Data _id)",
            "company": "string",
            "role": "string",
            "matchScore": number (0-100),
            "recommendation": "string (Short sentence on why they are/aren't a fit and what to improve for this role)"
          }
        ]
      }

      RESUME TEXT TO ANALYZE:
      """
      ${resumeText.substring(0, 15000)}
      """
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(cleanJson);

    // Update ML Knowledge Base with new learnings
    mlData.totalAnalyzed += 1;
    analysis.criticalFlaws.forEach((flaw: string) => {
      // Simple frequency map for common flaws (simplified for brevity)
      if (!mlData.commonFlaws.includes(flaw)) {
        mlData.commonFlaws.unshift(flaw); // Add to recent flaws
      }
    });
    // Keep only the 20 most recent/relevant flaws to prevent context bloat
    mlData.commonFlaws = mlData.commonFlaws.slice(0, 20);
    fs.writeFileSync(KNOWLEDGE_BASE_PATH, JSON.stringify(mlData, null, 2));

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('[Resume Analyzer] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
