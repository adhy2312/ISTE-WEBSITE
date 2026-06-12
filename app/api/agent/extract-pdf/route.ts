import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Use Gemini's native multi-modal capability to read the PDF.
    // This entirely bypasses traditional fragile node-based PDF parsers in serverless/edge environments.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const result = await model.generateContent([
      "You are a raw text extractor. Extract all the text from this resume exactly as it appears. Do not format it or analyze it, just return the raw text contents.",
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || "application/pdf"
        }
      }
    ]);
    
    const text = result.response.text().trim();

    if (!text) {
      return NextResponse.json({ error: 'Failed to extract text or PDF is empty/image-based.' }, { status: 422 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Server error while parsing PDF.' }, { status: 500 });
  }
}
