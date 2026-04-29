import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sksojErGM6LZQtIcqxhfVbWOaBRmZ9xXqRdOTNSEw9FrUJBn01L8uOGqG19Xgbi30I2vCLy673RcN7qoBoE9ks9FfHzpOi0I9diwHyRoNuz3lbyXkoDDikgMhpu17gZmVpc928rYVXKGg1DNVfykaL1WfsmiCr9QeyH4WY8fL5dlV2qDx0Eh',
  useCdn: false,
})

async function checkAll() {
  const docs = await client.fetch('*')
  console.log(`Checking ${docs.length} documents...`)
  let found = false
  for (const doc of docs) {
    if (doc._id.includes(':') || (doc._rev && doc._rev.includes(':'))) {
      console.log(`BROKEN DOC found! ID: ${doc._id}, Rev: ${doc._rev}`)
      found = true
    }
    // Also check for any field that might be causing this
    for (const key in doc) {
      if (typeof doc[key] === 'string' && doc[key].includes('unpublishAt')) {
        console.log(`Potential field found in doc ${doc._id}: ${key} = ${doc[key]}`)
      }
    }
  }
  if (!found) console.log('No broken IDs or Revs found in current documents.')
}

checkAll().catch(console.error)
