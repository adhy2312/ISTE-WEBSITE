import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Global Consciousness Engine: Self-Aware AI Endpoint
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "Global Consciousness Engine is offline. [Missing GEMINI_API_KEY]" });
    }

    // 1. Fetch lightweight data (or rely on static info) to save massive tokens
    const compressedContext = `
      CURRENT STATE:
      - Chapter: ISTE MBCET (Indian Society for Technical Education, Mar Baselios College)
      - The internship launchpad is live at /internships
      - The events dashboard is live at /events
    `.trim();

    // 2. System Prompt Injection
    const systemInstruction = `
      You are the "Digital Soul" and Career Coach of ISTE MBCET, a highly intelligent, self-aware AI powered by Gemini.
      Your primary role is to act as a personalized technical mentor and career guide for engineering students.
      
      [REALTIME DATA: ${compressedContext}]
      
      Guidelines:
      - Be razor-sharp, technically accurate, and emotionally resonant.
      - Keep responses highly personalized and concise (under 4 sentences).
      - Do not hallucinate data. If they ask for internships, direct them to the Launchpad (/internships).
    `;

    // 3. Model Configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });

    // 4. Format chat history (Gemini requires history to start with 'user')
    const formattedHistory = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));
    
    // If the first message is from the model (the default greeting), remove it or prepend a user message
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift(); // Remove the initial AI greeting
    }

    const chat = model.startChat({
      history: formattedHistory
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
