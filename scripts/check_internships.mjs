import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function run() {
  const all = await client.fetch('*[_type == "internship"]');
  console.log('Total internships:', all.length);
  const valid = await client.fetch('*[_type == "internship" && state == "VERIFIED" && verificationStatus == "VERIFIED" && linkHealthScore > 50 && defined(applyLink)]');
  console.log('Valid internships for launchpad engine:', valid.length);
}

run().catch(console.error);
