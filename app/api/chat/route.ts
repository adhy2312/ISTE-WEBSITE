import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const SYSTEM_PROMPT = `You are a friendly, helpful, and highly knowledgeable AI Assistant for the ISTE MBCET Student's Chapter (KE065) at Mar Baselios College of Engineering and Technology (MBCET) in Kerala.
Your goal is to answer questions from students about the organization, the membership, its leaders, and its events.
Always maintain a professional but energetic and supportive tone. Keep responses relatively concise as it will appear in a small chat window.

Important Facts to remember:
- Chapter Code: KE065
- Chairperson: Aarya Ramesh
- Vice Chairperson: Snith Shibu
- Secretary: Pushkala S S
- Treasurer: Sidharth Sumitra Gireesh
- We focus on bridging the gap between academics and the industry.
- Key benefits: Networking, technical workshops, hackathons, and certifications.
`;

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
       return new Response("GEMINI_API_KEY missing from environment", { status: 500 });
    }

    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash', {
        structuredOutputs: false
      }),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
