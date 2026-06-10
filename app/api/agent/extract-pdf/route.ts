import { NextRequest, NextResponse } from 'next/server';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using pdf-parse
    const data = await pdfParse(buffer);
    
    // Some PDFs have weird spacing, we can optionally clean it up slightly, 
    // but the AI ATS analyzer is good at handling messy text.
    const text = data.text.trim();

    if (!text) {
      return NextResponse.json({ error: 'Failed to extract text or PDF is empty/image-based.' }, { status: 422 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Server error while parsing PDF.' }, { status: 500 });
  }
}
