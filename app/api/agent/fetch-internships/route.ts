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
  token: process.env.SANITY_API_TOKEN, // Requires Write Token
  useCdn: false,
});

// A simulated target for the demo (since real job boards block scraping aggressively)
const MOCK_TARGET_HTML = `
  <html>
    <body>
      <div class="job-listing">
        <h2>Software Development Intern</h2>
        <div class="company">TCS Trivandrum</div>
        <div class="details">
          We are looking for a passionate software engineering intern to join our TCS Trivandrum team for 3 months. 
          Stipend: ₹15,000/month. You will work on cutting-edge AI and Next.js applications. 
          Apply at https://tcs.com/careers/intern
        </div>
      </div>
      <div class="job-listing">
        <h2>UI/UX Design Intern</h2>
        <div class="company">Cognizant Kochi</div>
        <div class="details">
          Join our creative team at Infopark Kochi. We need a design intern for 6 months to craft beautiful interfaces.
          Unpaid for the first month, then ₹10,000. Apply at https://cognizant.com/design-intern
        </div>
      </div>
      <div class="job-listing">
        <h2>Senior Backend Engineer</h2>
        <div class="company">Wipro</div>
        <div class="details">
          Full-time role for 5+ years experience. 
        </div>
      </div>
    </body>
  </html>
`;

export async function GET(req: Request) {
  try {
    console.log('[AI Agent] Booting up Internship Scraper...');
    
    // In a real scenario, this would be: 
    // const res = await fetch('https://some-job-board.com/kerala');
    // const html = await res.text();
    const html = MOCK_TARGET_HTML;
    
    const $ = cheerio.load(html);
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();

    console.log('[AI Agent] HTML Extracted. Sending to Gemini for analysis...');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an expert tech recruiter AI agent for a college in Kerala. 
      Read the following text extracted from a job board. Find all INTERNSHIPS. Ignore full-time or senior roles.
      
      For each internship found, extract:
      - company (string)
      - role (string)
      - domain (string, e.g., "Software Engineering", "UI/UX Design")
      - stipend (string, e.g., "₹15,000/month")
      - duration (string)
      - applyLink (string)
      
      Return the result strictly as a JSON array of objects. Do not include markdown formatting or backticks.
      
      Text:
      ${rawText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean JSON (remove markdown if any)
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const internships = JSON.parse(jsonString);

    console.log('[AI Agent] Gemini found', internships.length, 'internships.');

    // Push to Sanity CMS
    const createdIds = [];
    for (const intern of internships) {
      console.log(`[AI Agent] Pushing ${intern.role} at ${intern.company} to Sanity...`);
      const doc = {
        _type: 'internship',
        company: intern.company,
        role: intern.role,
        domain: intern.domain,
        stipend: intern.stipend,
        duration: intern.duration,
        applyLink: intern.applyLink,
        status: 'pending_review', // Requires human approval to go live
        featured: false,
        order: 99, // push to bottom
      };
      
      const created = await sanityClient.create(doc);
      createdIds.push(created._id);
    }

    return NextResponse.json({
      success: true,
      message: `AI Agent successfully fetched and processed ${internships.length} internships.`,
      data: internships,
      sanityIds: createdIds
    });

  } catch (error: any) {
    console.error('[AI Agent] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
