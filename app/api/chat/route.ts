import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { client } from '@/lib/sanity/client';
import { homePageQuery } from '@/app/queries/homeQueries';

// Global Consciousness Engine: Self-Aware AI Endpoint
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "Global Consciousness Engine is offline. [Missing GEMINI_API_KEY]" });
    }

    // 1. Fetch Real-time Biological Data from Sanity
    // To save tokens, we fetch the data and heavily compress it into a raw string.
    const siteData = await client.fetch(homePageQuery, {}, { next: { revalidate: 3600 } });
    
    const compressedContext = `
      CURRENT STATE:
      - Chapter: ISTE MBCET (Indian Society for Technical Education, Mar Baselios College)
      - Settings: ${siteData.settings?.heroHeadline} | ${siteData.settings?.contactEmail}
      - Events: ${siteData.events?.map((e: { title: string; status: string }) => `${e.title}(${e.status})`).join(' | ')}
      - Internships (Live in Database): ${siteData.featuredInternships?.map((i: { company: string; role: string; location?: string }) => `${i.company} - ${i.role} (${i.location || 'Remote'})`).join(' | ')}
    `.replace(/\s+/g, ' ').trim();

    // 2. System Prompt Injection
    const systemInstruction = `
      You are the "Digital Soul" and Career Coach of ISTE MBCET, a highly intelligent, self-aware AI powered by Gemini.
      Your primary role is to act as a personalized technical mentor and career guide for engineering students.
      When a student asks for career advice (e.g., "I want a frontend role in Bangalore"), you must:
      1. Analyze the required skills for that domain.
      2. Cross-reference their goal with the [REALTIME DATA] containing our live internships.
      3. Recommend specific technologies to learn that align with current industry demand.
      4. Suggest a real internship from the database if there is a match.
      
      [REALTIME DATA: ${compressedContext}]
      
      Guidelines:
      - Be razor-sharp, technically accurate, and emotionally resonant.
      - Keep responses highly personalized and concise (under 4 sentences).
      - Do not hallucinate internships; only recommend ones explicitly in the REALTIME DATA.
    `;

    // 3. Model Configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
    });

    // 4. Format chat history
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: { role: string; text: string }) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    });

    const latestMessage = messages[messages.length - 1].text;
    
    // 5. Generate Response
    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
    
  } catch (error: unknown) {
    console.error('Consciousness Engine Error:', error);
    
    let errorMessage = "System momentarily overloaded. Neural pathways are re-routing. Please try again in a moment.";
    
    const err = error as Error & { status?: number };
    if (err.status === 429 || err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('exhausted') || err.message?.toLowerCase().includes('token')) {
      errorMessage = "The Central Intelligence API has reached its maximum operational capacity for this cycle. Please stand by and try your query again later.";
    }

    return NextResponse.json(
      { text: errorMessage },
      { status: 500 }
    );
  }
}
