import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@sanity/client';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize Sanity Write Client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

/**
 * ==========================================
 * ELITE INTERNSHIP AGENT ARCHITECTURE
 * ==========================================
 * 1. Data Ingestion Service
 * 2. Strict Link Validation Service 
 * 3. AI Extraction Service
 * 4. Sanity Sync Service
 */

class LinkValidatorService {
  /**
   * Performs an active HTTP check on the link to ensure it's not a 404 or dead domain.
   */
  static async isLinkAlive(url: string): Promise<boolean> {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
      
      // Filter out mock data or commonly botched placeholder links
      if (url.includes('tcs.com/careers/intern') || url.includes('cognizant.com/design-intern')) {
        return false; 
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      // Perform a HEAD request to check if the link is alive
      const res = await fetch(url, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ISTE-Bot/2.0; +https://mbcet.ac.in)' },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      // 200-399 are valid. 403/405 are often anti-bot protection but the site is alive.
      // 404 is dead.
      return res.ok || res.status < 400 || res.status === 403 || res.status === 405;
    } catch (e) {
      // If HEAD fails due to CORS or abort, try a GET request just in case
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const getRes = await fetch(url, { 
          method: 'GET',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ISTE-Bot/2.0; +https://mbcet.ac.in)' },
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        return getRes.ok || getRes.status < 400 || getRes.status === 403;
      } catch (innerError) {
        return false;
      }
    }
  }
}

class DiscoveryService {
  static async extractRawOpportunityText(): Promise<string> {
    const targetUrls = [
      'https://internshala.com/internships/computer-science-internship-in-kerala/',
      // Add more real-world feeds here
    ];

    let rawData = '';
    
    for (const url of targetUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: controller.signal,
          next: { revalidate: 0 }
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const html = await res.text();
        const $ = cheerio.load(html);
        
        // Strip heavy non-content tags
        $('script, style, nav, footer, header, svg, img, iframe').remove();
        rawData += $('body').text().replace(/\s+/g, ' ').trim() + '\n\n';
      } catch (err) {
        console.warn(`[Discovery] Failed fetching ${url}`);
      }
    }
    
    return rawData;
  }
}

export async function GET(req: Request) {
  try {
    console.log('[AI Agent] Booting Up Elite Internship Engine...');
    
    const rawText = await DiscoveryService.extractRawOpportunityText();
    
    if (rawText.length < 50) {
      console.log('[AI Agent] Insufficient raw data collected. Aborting to prevent hallucination.');
      return NextResponse.json({ success: false, message: 'No data sources accessible currently.' });
    }

    console.log('[AI Agent] Triggering Semantic Extraction...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an elite AI tech recruiter acting for an engineering college in Kerala.
      Extract internships from the following raw scraped text. Ignore senior roles or full-time jobs.
      
      Output ONLY a raw JSON array matching this schema:
      [{
        "company": "string",
        "role": "string",
        "domain": "string (e.g. AI, Web, Hardware)",
        "stipend": "string",
        "duration": "string",
        "applyLink": "string (MUST be a fully qualified valid URL starting with http/https)"
      }]
      
      No markdown wrapping, no comments.
      
      RAW TEXT:
      ${rawText.substring(0, 30000)} // cap length for token limit
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Rigorous JSON sanitization
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let parsedOpportunities = [];
    try {
      parsedOpportunities = JSON.parse(cleanJson);
    } catch (e) {
      console.error('[AI Agent] LLM returned invalid JSON schema.', cleanJson);
      return NextResponse.json({ success: false, error: 'AI Serialization Failure' }, { status: 500 });
    }

    console.log(`[AI Agent] LLM Extracted ${parsedOpportunities.length} opportunities. Validating links...`);
    
    // Strict Validation Pipeline
    const verifiedOpportunities = [];
    for (const opp of parsedOpportunities) {
      if (!opp.applyLink) continue;
      
      const isAlive = await LinkValidatorService.isLinkAlive(opp.applyLink);
      if (isAlive) {
        verifiedOpportunities.push(opp);
      } else {
        console.log(`[AI Agent] Rejected Dead/Invalid Link: ${opp.applyLink}`);
      }
    }

    console.log(`[AI Agent] Surviving Validation: ${verifiedOpportunities.length} opportunities.`);

    // Sanity Synchronization
    const createdIds = [];
    for (const opp of verifiedOpportunities) {
      const doc = {
        _type: 'internship',
        company: opp.company,
        role: opp.role,
        domain: opp.domain,
        stipend: opp.stipend || 'Unpaid',
        duration: opp.duration || 'Flexible',
        applyLink: opp.applyLink,
        status: 'pending_review',
        featured: false,
        order: 99,
      };
      
      const created = await sanityClient.create(doc);
      createdIds.push(created._id);
    }

    return NextResponse.json({
      success: true,
      message: `Agent cycle complete. Discovered ${parsedOpportunities.length}, Validated ${verifiedOpportunities.length}.`,
      data: verifiedOpportunities,
      sanityIds: createdIds
    });

  } catch (error: any) {
    console.error('[AI Agent] Critical System Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

