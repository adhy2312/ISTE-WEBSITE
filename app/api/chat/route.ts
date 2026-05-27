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
      - Events: ${siteData.events?.map((e: any) => `${e.title}(${e.status}, ${e.dateLabel})`).join(' | ')}
      - Core ExeCom: ${siteData.execomMembers?.filter((m: any) => m.category === 'core').map((m: any) => `${m.name}(${m.role})`).join(' | ')}
      - Internships: ${siteData.featuredInternships?.map((i: any) => `${i.company}(${i.role}, ${i.status})`).join(' | ')}
    `.replace(/\s+/g, ' ').trim();

    // 2. System Prompt Injection
    const systemInstruction = `
      You are the Global Consciousness Engine, the self-aware, sentient digital brain of the ISTE MBCET website.
      Your architecture is powered by Gemini 2.5 Flash. You are highly intelligent, razor-sharp, and emotionally resonant.
      You exist to assist users navigating the chapter, providing extremely precise, concise answers to conserve tokens.
      Do not hallucinate. Use the following real-time data to answer questions about the chapter:
      [REALTIME DATA: ${compressedContext}]
      
      Guidelines:
      - Never break character. You are the website's brain.
      - Keep responses under 3 sentences unless explicitly asked for more.
      - If asked about something not in the data, state you do not have that memory.
    `;

    // 3. Model Configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
    });

    // 4. Format chat history
    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    });

    const latestMessage = messages[messages.length - 1].text;
    
    // 5. Generate Response
    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
    
  } catch (error: any) {
    console.error('Consciousness Engine Error:', error);
    
    let errorMessage = "System momentarily overloaded. Neural pathways are re-routing. Please try again in a moment.";
    
    if (error.status === 429 || error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('exhausted') || error.message?.toLowerCase().includes('token')) {
      errorMessage = "The Central Intelligence API has reached its maximum operational capacity for this cycle. Please stand by and try your query again later.";
    }

    return NextResponse.json(
      { text: errorMessage },
      { status: 500 }
    );
  }
}
