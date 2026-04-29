import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sksojErGM6LZQtIcqxhfVbWOaBRmZ9xXqRdOTNSEw9FrUJBn01L8uOGqG19Xgbi30I2vCLy673RcN7qoBoE9ks9FfHzpOi0I9diwHyRoNuz3lbyXkoDDikgMhpu17gZmVpc928rYVXKGg1DNVfykaL1WfsmiCr9QeyH4WY8fL5dlV2qDx0Eh',
  useCdn: false,
})

async function search() {
  const query = `*[
    _id match "unpublishAt*" || 
    _rev match "unpublishAt*" || 
    @ match "unpublishAt*"
  ]`
  const docs = await client.fetch(query)
  console.log(`Found ${docs.length} docs matching "unpublishAt"`)
  for (const doc of docs) {
    console.log(`ID: ${doc._id}, Type: ${doc._type}, Rev: ${doc._rev}`)
  }
}

search().catch(console.error)
