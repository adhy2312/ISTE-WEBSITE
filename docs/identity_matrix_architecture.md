# Neural Identity Architecture (Member Login Portal)

The architecture successfully implements the **`Login -> Member Portal`** vision through a highly secure, multi-stage, branching gateway.

## Core Flow
Authentication -> Gateway Validation -> State Branching

---

### Stage 1: The Access Portal (`/login`)
- **The Visual:** The user visits `/login` and interacts with the "ACCESS PORTAL" cinematic screen.
- **The Action:** The user inputs their identifier (email) and passkey. 
- **The Engine:** Next.js Server Actions securely process the payload via Supabase Auth. 
- **The Transition:** Upon successful credential verification, an encrypted HTTP-only session cookie is securely injected into the browser, and the user is instantly redirected to the `/dashboard`.

---

### Stage 2: The Gateway Check (`/dashboard`)
When the user arrives at the Member Portal (`/dashboard`), the Next.js Server Component intercepts the request *before* the UI is rendered and executes a tripartite validation check:

1. **Auth Verification:** Does a valid session cookie exist? If no, the request is immediately bounced back to `/login`.
2. **Profile Completeness Check:** The server queries the `profiles` table in Supabase. Does this specific user have their core parameters (`full_name`, `department`, `semester`) registered?
3. **Data Hydration:** It securely fetches any rows matching the user's ID from the `event_registrations` (Event Logs) and `certificates` tables.

---

### Stage 3: State Branching
Based on the Gateway Check, the Portal intelligently branches into one of two exclusive states:

#### State A: Initialization Sequence (First Time Users)
If the user's profile is empty (parameters are null), the portal initiates a lockdown. 
- It hides the main dashboard UI.
- It surfaces the **"Initialize Profile"** protocol.
- The user cannot bypass this screen or view event logs until they provide their Name, Branch, and Semester. 
- Submitting the form hits the hidden `/api/profile/update` backend route, syncs the data to Supabase, and reloads the dashboard, seamlessly triggering State B.

#### State B: The Identity Matrix (Active Members)
Once the profile parameters are complete, the portal unlocks and renders the full Matrix grid.
- **Left Column (Operator Profile):** Displays their synchronized Name, Department, Semester, and their current System Clearance (e.g., MEMBER or EXECOM).
- **Right Column (Neural Imprints):** Loops through the hydrated `event_registrations` data to display a chronological list of their event history.
- **Right Column (Digital Artifacts):** Renders a grid of the certificates they have acquired, sourced from the `certificates` table.

---

### Security & UX Summary
This architecture guarantees absolute data integrity. It ensures no user can navigate the system with a "blank" profile, automatically enforces onboarding, and delivers the transition from "login" to "portal" as a flawless, cinematic experience.
