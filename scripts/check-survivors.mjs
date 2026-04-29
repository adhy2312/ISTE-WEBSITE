import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sksojErGM6LZQtIcqxhfVbWOaBRmZ9xXqRdOTNSEw9FrUJBn01L8uOGqG19Xgbi30I2vCLy673RcN7qoBoE9ks9FfHzpOi0I9diwHyRoNuz3lbyXkoDDikgMhpu17gZmVpc928rYVXKGg1DNVfykaL1WfsmiCr9QeyH4WY8fL5dlV2qDx0Eh',
  useCdn: false,
})

async function check() {
  const assets = await client.fetch('*[_type == "sanity.imageAsset"]')
  console.log(`Image Assets found: ${assets.length}`)
  
  const drafts = await client.fetch('*[_id in path("drafts.**")]')
  console.log(`Drafts found: ${drafts.length}`)
  for (const draft of drafts) {
    console.log(`\n--- Draft ID: ${draft._id} ---`)
    console.log(JSON.stringify(draft, null, 2))
  }
}

check().catch(console.error)
