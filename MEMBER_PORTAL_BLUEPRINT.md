# ISTE MBCET Member Portal: Architectural Blueprint
*Version 1.0 - Focused strictly on the 300+ Annual Student Members*

## 👁️ The Vision
ISTE MBCET recruits over 300 members annually. The **Member Portal** is not an administrative tool; it is a cinematic, highly-gated digital hub designed to deliver overwhelming value to these students. It transforms their membership from a mere "receipt" into an elite, continuous digital experience.

## 🧬 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Self-Hosted / Managed)
- **ORM:** Prisma
- **Auth:** Next.js Server Actions with IronSession or Auth.js (Zero Supabase)
- **Aesthetics:** Tailwind CSS, Pure CSS 3D, GSAP

---

## 🏛️ Database Schema (PostgreSQL via Prisma)

The relational integrity is designed to be lightweight but robust enough to handle the 300+ student volume.

```prisma
model Member {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String
  
  // Core Identity
  fullName      String?
  branch        String?
  semester      Int?
  
  // Platform Clearance
  clearance     ClearanceLevel @default(MEMBER) // ENUM: MEMBER, CORE, EXECOM
  
  // Relations
  attendances   Attendance[]
  createdAt     DateTime     @default(now())
}

model Event {
  id            String       @id @default(uuid())
  title         String
  date          DateTime
  description   String?
  
  attendances   Attendance[]
}

model Attendance {
  id             String   @id @default(uuid())
  memberId       String
  eventId        String
  certificateUrl String?  // Link to PDF if issued
  
  member         Member   @relation(fields: [memberId], references: [id])
  event          Event    @relation(fields: [eventId], references: [id])
}
```

---

## ⚙️ The 3-Stage Cinematic Onboarding

1. **The Access Gate (`/login`)**
   A minimal, dark-mode terminal screen. Members log in using the email they registered with during the recruitment drive. Server Actions handle the password verification and securely inject an encrypted, HTTP-only session cookie.

2. **The Initialization Sequence (`/dashboard/setup`)**
   If a member logs in for the very first time (their `branch` or `fullName` is null), the system goes into lockdown. A glassmorphic modal forces them to input their exact branch and semester to construct their digital identity. They cannot access the vault without providing this telemetry.

3. **The Identity Matrix (`/dashboard`)**
   Once initialized, the portal unlocks. The Next.js Server Component securely fetches the member's data alongside all their `Attendance` records in a single, lightning-fast database trip.

---

## 💎 The Four Pillars of Value (Dashboard UI)

### 1. The Digital Identity Card (Top Left)
A 3D, physics-based CSS card. It displays the member's name, branch, and their clearance level. When the user moves their mouse, the card tilts (using GSAP), reflecting a holographic sheen. 

### 2. The Vault (Top Right)
A gated repository accessible *only* to verified members. This contains high-value assets that justify the membership fee:
- Premium workshop PDFs
- Previous Year Question Papers (PYQs)
- Exclusive roadmaps (e.g., "How to crack Google SoC")
- Unlisted YouTube recordings of past ISTE technical sessions.

### 3. The Activity & Certification Timeline (Bottom Left)
A beautiful, glowing vertical timeline. It maps every single event the student has attended out of the 300-member cohort. If a certificate was issued, a neon "View Artifact" button allows them to instantly download their cryptographically verifiable PDF.

### 4. The Elite Radar (Bottom Right)
A direct feed piped in from the Python ML `Internship Engine`. While the public website gets standard internships, this private radar shows the highest-scoring, 99%-confidence jobs specifically tailored to the member's branch.

---

## 🚀 Execution Strategy (Phases)
1. **Phase 1:** Initialize `schema.prisma`, run the PostgreSQL migration, and seed the database with dummy members.
2. **Phase 2:** Build the Next.js Server Actions for secure Login/Logout.
3. **Phase 3:** Construct the raw UI grids for the Dashboard (Identity Card, Vault, Timeline).
4. **Phase 4:** Wire the UI to Prisma to hydrate live data on the server-side.
