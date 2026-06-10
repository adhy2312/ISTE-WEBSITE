import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log('Fetching junk internships...');
  
  // Find all internships. The user approved deleting anything that isn't completely pristine
  // So we delete anything that isn't VERIFIED, or has a linkHealthScore <= 40, or is closed/expired.
  const query = `*[_type == "internship" && (verificationStatus != "VERIFIED" || linkHealthScore <= 40 || status != "open" || state in ["SUSPECT", "EXPIRED", "DELETED", "ARCHIVED"])]`;
  
  const junkInternships = await client.fetch(query);
  
  console.log(`Found ${junkInternships.length} junk internships to delete.`);
  
  let deletedCount = 0;
  for (const doc of junkInternships) {
    try {
      console.log(`Deleting [${doc._id}] ${doc.company} - ${doc.role} (Status: ${doc.verificationStatus}, Score: ${doc.linkHealthScore})`);
      await client.delete(doc._id);
      deletedCount++;
    } catch (err) {
      console.error(`Failed to delete ${doc._id}:`, err.message);
    }
  }
  
  console.log(`Cleanup complete! Deleted ${deletedCount} internships.`);
}

main().catch(console.error);
