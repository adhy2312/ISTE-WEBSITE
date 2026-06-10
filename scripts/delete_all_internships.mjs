import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sksojErGM6LZQtIcqxhfVbWOaBRmZ9xXqRdOTNSEw9FrUJBn01L8uOGqG19Xgbi30I2vCLy673RcN7qoBoE9ks9FfHzpOi0I9diwHyRoNuz3lbyXkoDDikgMhpu17gZmVpc928rYVXKGg1DNVfykaL1WfsmiCr9QeyH4WY8fL5dlV2qDx0Eh', // from .env.local
  useCdn: false,
});

async function clearAllInternships() {
  console.log('Fetching all internships...');
  const internships = await client.fetch('*[_type == "internship"]');
  console.log(`Found ${internships.length} internships to delete.`);

  for (const intern of internships) {
    try {
      await client.delete(intern._id);
      console.log(`Deleted: ${intern.role} at ${intern.company}`);
    } catch (err) {
      console.error(`Failed to delete ${intern._id}:`, err);
    }
  }
  console.log('Cleanup complete!');
}

clearAllInternships().catch(console.error);
