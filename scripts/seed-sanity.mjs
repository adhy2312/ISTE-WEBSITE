// Run with: node scripts/seed-sanity.mjs
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'xz7jxi4a',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sksojErGM6LZQtIcqxhfVbWOaBRmZ9xXqRdOTNSEw9FrUJBn01L8uOGqG19Xgbi30I2vCLy673RcN7qoBoE9ks9FfHzpOi0I9diwHyRoNuz3lbyXkoDDikgMhpu17gZmVpc928rYVXKGg1DNVfykaL1WfsmiCr9QeyH4WY8fL5dlV2qDx0Eh',
  useCdn: false,
})

const stats = [
  { _type: 'stat', label: 'Active Members', value: 300, suffix: '+', order: 1 },
  { _type: 'stat', label: 'Events Conducted', value: 50, suffix: '+', order: 2 },
  { _type: 'stat', label: 'Industry Partners', value: 5, suffix: '+', order: 3 },
  { _type: 'stat', label: 'Member Satisfaction', value: 95, suffix: '%', order: 4 },
]

const testimonials = [
  { _type: 'testimonial', quote: 'Performance is key for us, and joining ISTE was the best decision. Highly recommended for exposure.', authorName: 'Emily Watson', authorRole: '3rd Year CSE', avatarSeed: 'Emily', order: 1 },
  { _type: 'testimonial', quote: 'The aesthetics are top-notch. It gives my college experience a premium look without hiring a designer.', authorName: 'David Park', authorRole: 'Indie Hacker', avatarSeed: 'David', order: 2 },
  { _type: 'testimonial', quote: 'Finally, a community that actually considers accessibility and growth as a first-class citizen. A joy to be in.', authorName: 'Jessica Li', authorRole: 'UX Researcher', avatarSeed: 'Jessica', order: 3 },
  { _type: 'testimonial', quote: 'The peer-to-peer learning environment helped me land my first tech internship. Invaluable network.', authorName: 'Arjun M', authorRole: 'Tech Lead', avatarSeed: 'Arjun', order: 4 },
]

const events = [
  { _type: 'event', title: 'Engineering your own Path', dateLabel: 'MAR 2026', eventType: 'IEEE Collab', status: 'upcoming', order: 1 },
  { _type: 'event', title: 'Unseen Problem', dateLabel: 'MAR 2026', eventType: 'IEEE Collab', status: 'upcoming', order: 2 },
  { _type: 'event', title: 'Lumera', dateLabel: 'MAR 2026', eventType: 'IEEE Collab', status: 'upcoming', order: 3 },
  { _type: 'event', title: 'From dropshipping to building AI', dateLabel: 'MAR 2026', eventType: 'IEEE Collab', status: 'upcoming', order: 4 },
  { _type: 'event', title: 'SKILL MAAYA- 3 Day Learning Bootcamp', dateLabel: 'MAR 2026', eventType: '3 Day Interactive Online Workshop', status: 'upcoming', order: 5 },
  { _type: 'event', title: "Nexora 26'", dateLabel: 'JAN 2026', eventType: "All Kerala Annual ISTE Student's Convention", status: 'past', order: 6 },
  { _type: 'event', title: 'Through My Younger Eyes Poster Challenge', dateLabel: 'NOV 2025', eventType: 'Competition', status: 'past', order: 7 },
  { _type: 'event', title: 'Rising Tuskers', dateLabel: 'OCT 2025', eventType: 'A Football based Fun event in collab with Kombans Fanatics', status: 'past', order: 8 },
  { _type: 'event', title: 'ISTE CONNECT', dateLabel: 'OCT 2025', eventType: 'An Interactive session with new ISTE Members', status: 'past', order: 9 },
  { _type: 'event', title: 'KeralaHack 2025', dateLabel: 'FEB 2025', eventType: '24-Hour Hackathon', status: 'past', order: 10 },
  { _type: 'event', title: 'Industry Connect — ISRO Alumni Talk', dateLabel: 'JAN 2025', eventType: 'Speaker Session', status: 'past', order: 11 },
]

const execomMembers = [
  // Faculty
  { _type: 'execomMember', name: 'Melvin Jacob', initials: 'MJ', role: 'Faculty Advisor', category: 'faculty', order: 1 },
  { _type: 'execomMember', name: 'Dr. Soumya A V', initials: 'S', role: 'Faculty Advisor', category: 'faculty', order: 2 },
  // Mentors
  { _type: 'execomMember', name: 'Kiran Biju', initials: 'KB', role: 'Student Mentor', category: 'mentor', order: 3 },
  { _type: 'execomMember', name: 'Krishna Prashanth', initials: 'KP', role: 'Student Mentor', category: 'mentor', order: 4 },
  // Core
  { _type: 'execomMember', name: 'Aarya Ramesh', initials: 'AR', role: 'Chairperson', category: 'core', order: 5 },
  { _type: 'execomMember', name: 'Snith Shibu', initials: 'SS', role: 'Vice Chairperson', category: 'core', order: 6 },
  { _type: 'execomMember', name: 'Pushkala S S', initials: 'PS', role: 'Secretary', category: 'core', order: 7 },
  { _type: 'execomMember', name: 'Sidharth Sumitra Gireesh', initials: 'SG', role: 'Treasurer', category: 'core', order: 8 },
  // Team Leads
  { _type: 'execomMember', name: 'Jenza Mary Jose', initials: 'EM', role: 'Team Lead', category: 'teamLead', team: 'Event Management Team', order: 9, subMembers: [{ name: 'Adithyan M S', initials: 'AM' }, { name: 'Dhiya K', initials: 'DK' }, { name: 'Avantika Ajaykumar', initials: 'AA' }, { name: 'Devanandan P Unnithan', initials: 'DU' }, { name: 'Firose Muhammed S', initials: 'FM' }] },
  { _type: 'execomMember', name: '[Design Lead]', initials: 'DT', role: 'Team Lead', category: 'teamLead', team: 'Design Team', order: 10, subMembers: [{ name: 'Devananda S R', initials: 'DS' }, { name: 'Neha Nevin', initials: 'NN' }] },
  { _type: 'execomMember', name: 'Neil Philip Koshy', initials: 'ST', role: 'Team Lead', category: 'teamLead', team: 'Sponsorship Team', order: 11, subMembers: [{ name: 'Abhishek S S', initials: 'AS' }, { name: 'Christopher George', initials: 'CG' }] },
  { _type: 'execomMember', name: 'Adhithya Mohan S', initials: 'PR', role: 'Team Lead', category: 'teamLead', team: 'PR and Media Team', order: 12, subMembers: [{ name: 'Rohin Daniel John', initials: 'RD' }, { name: 'Rogin', initials: 'RG' }, { name: 'Abhishek S', initials: 'AS' }, { name: 'Vishwabala P', initials: 'VP' }] },
  { _type: 'execomMember', name: 'Aparna Rajagopal', initials: 'CD', role: 'Team Lead', category: 'teamLead', team: 'Content & Documentation Team', order: 13, subMembers: [{ name: 'Angelina R Nambiar', initials: 'AN' }, { name: 'Devikrishna A R', initials: 'DA' }, { name: 'Sneha A Oommen', initials: 'SO' }] },
  { _type: 'execomMember', name: 'Angel Rose Prince', initials: 'SH', role: 'Team Lead', category: 'teamLead', team: 'SHE Team', order: 14, subMembers: [{ name: 'Adia Ani', initials: 'AA' }, { name: 'Aishwarya Balakrishnan Menon', initials: 'AB' }, { name: 'Anagha S', initials: 'AS' }] },
  // Junior ExeCom
  { _type: 'execomMember', name: 'Govind Warrier', initials: 'GW', role: 'Junior ExeCom', category: 'junior', team: 'Event Management Team', order: 15 },
  { _type: 'execomMember', name: 'S. Abarna Prasad', initials: 'AP', role: 'Junior ExeCom', category: 'junior', team: 'Event Management Team', order: 16 },
  { _type: 'execomMember', name: 'R. Vishakh', initials: 'RV', role: 'Junior ExeCom', category: 'junior', team: 'Design Team', order: 17 },
  { _type: 'execomMember', name: 'Charu B. Eshwar', initials: 'CB', role: 'Junior ExeCom', category: 'junior', team: 'Design Team', order: 18 },
  { _type: 'execomMember', name: 'Gopika J.R.', initials: 'GJ', role: 'Junior ExeCom', category: 'junior', team: 'PR & Media Team', order: 19 },
  { _type: 'execomMember', name: 'Eshan M.S.', initials: 'EM', role: 'Junior ExeCom', category: 'junior', team: 'PR & Media Team', order: 20 },
  { _type: 'execomMember', name: 'R. Hari Krishnan', initials: 'RH', role: 'Junior ExeCom', category: 'junior', team: 'PR & Media Team', order: 21 },
  { _type: 'execomMember', name: 'Sona Biju', initials: 'SB', role: 'Junior ExeCom', category: 'junior', team: 'PR & Media Team', order: 22 },
  { _type: 'execomMember', name: 'Gourilekshmi Prashanth', initials: 'GP', role: 'Junior ExeCom', category: 'junior', team: 'PR & Media Team', order: 23 },
  { _type: 'execomMember', name: 'Ashiya Noufal', initials: 'AN', role: 'Junior ExeCom', category: 'junior', team: 'SHE Team', order: 24 },
  { _type: 'execomMember', name: 'Sreya Krishna', initials: 'SK', role: 'Junior ExeCom', category: 'junior', team: 'SHE Team', order: 25 },
  { _type: 'execomMember', name: 'Ganga A.B.', initials: 'GA', role: 'Junior ExeCom', category: 'junior', team: 'Content & Documentation', order: 26 },
]

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  heroSubtitle: 'Innovation · Technology · Excellence',
  heroTypedText: "ISTE MBCET STUDENT'S CHAPTER",
  chapterCode: 'KE065',
  contactEmail: 'istestudentchapter@mbcet.ac.in',
  instagramUrl: 'https://www.instagram.com/iste_mbcet/',
  linkedinUrl: 'https://www.linkedin.com/company/istescmbcet/',
}

async function seed() {
  console.log('🌱 Seeding Sanity...\n')

  // Site Settings (singleton)
  await client.createOrReplace(siteSettings)
  console.log('✅ Site Settings')

  // Stats
  for (const doc of stats) {
    await client.create(doc)
  }
  console.log(`✅ ${stats.length} Stats`)

  // Testimonials
  for (const doc of testimonials) {
    await client.create(doc)
  }
  console.log(`✅ ${testimonials.length} Testimonials`)

  // Events
  for (const doc of events) {
    await client.create(doc)
  }
  console.log(`✅ ${events.length} Events`)

  // ExeCom Members
  for (const doc of execomMembers) {
    await client.create(doc)
  }
  console.log(`✅ ${execomMembers.length} ExeCom Members`)

  console.log('\n🎉 All done! Refresh your Studio to see the content.')
}

seed().catch(console.error)
