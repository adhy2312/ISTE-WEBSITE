import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN,
});

async function checkLinkStatus(url) {
  try {
    // We use GET with a short timeout. Some sites block HEAD requests.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // If it's a 404 or 410, the job is definitively gone
    if (response.status === 404 || response.status === 410) {
      return { isAlive: false, status: response.status, score: 0 };
    }
    
    // If it redirects to a generic login page or jobs home page, it might be expired
    // But for safety, we assume 2xx and 3xx are alive unless it's explicitly 404
    if (response.ok) {
      return { isAlive: true, status: response.status, score: 100 };
    }
    
    return { isAlive: true, status: response.status, score: 50 }; // Suspicious but not definitively dead
  } catch (error) {
    console.warn(`Fetch error for ${url}:`, error.message);
    return { isAlive: false, status: 0, score: 0 }; // Timeout or DNS failure
  }
}

async function runLinkCheck() {
  console.log('🤖 Internship Engine: Verifying Live Links...');
  
  // Fetch only OPEN internships with a defined applyLink
  const query = `*[_type == "internship" && status == "open" && defined(applyLink)] {
    _id, role, company, applyLink
  }`;
  
  const internships = await client.fetch(query);
  console.log(`Found ${internships.length} open internships to verify.`);
  
  let deadCount = 0;
  
  for (const intern of internships) {
    process.stdout.write(`Checking: ${intern.company} - ${intern.role}... `);
    const result = await checkLinkStatus(intern.applyLink);
    
    if (!result.isAlive) {
      console.log(`❌ DEAD (Status: ${result.status})`);
      
      // Update in Sanity
      try {
        await client.patch(intern._id)
          .set({ status: 'closed', linkHealthScore: 0, verificationStatus: 'FAILED' })
          .commit();
        console.log(`   -> Marked as CLOSED in CMS`);
        deadCount++;
      } catch (patchErr) {
        console.error(`   -> Failed to update CMS:`, patchErr.message);
      }
    } else {
      console.log(`✅ ALIVE (Score: ${result.score})`);
      // Update health score if it was previously low
      if (result.score === 100) {
        await client.patch(intern._id).setIfMissing({ linkHealthScore: 100 }).commit().catch(()=>null);
      }
    }
    
    // Small delay to prevent rate-limiting by target domains
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n✅ Verification Complete. Removed ${deadCount} dead links from the live list.`);
}

runLinkCheck().catch(console.error);
