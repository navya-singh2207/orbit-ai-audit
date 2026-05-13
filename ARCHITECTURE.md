# Architecture: Orbit AI Audit

## Tech Stack
- **Frontend**: React (Vite) for a fast, modern SPA experience.
- **Backend**: Node.js (Express) to handle API routes, AI summary generation (hiding API keys), and email sending.
- **Database**: Firebase (Firestore) for storing audit reports and captured leads.
- **Styling**: Tailwind CSS for rapid, responsive UI development.
- **UI Components**: Shadcn UI (Radix Primitives) for accessible, polished components.
- **Animations**: Framer Motion for smooth transitions and "instant audit" feel.
- **AI**: Gemini API (via `@google/genai`) for personalized summary generation.
- **Emails**: Resend API for transactional audit confirmation.

## Key Decisions
1. **Full-Stack (Express + Vite)**: Essential for hiding the Gemini and Resend API keys. Also allows for cleaner future expansions.
2. **Hardcoded Logic Engine**: The audit logic is deterministic and finance-ready. AI is only used for the "Executive Summary" to add a personal touch.
3. **No Login Requirement**: reduces friction for the "cold visitor" use case. Leads are captured via an email gate *after* value is provided.
4. **Unique Public URLs**: Each audit generates a UUID. Public views exclude PII (email, company name) but show tool stack and savings.
5. **Form Persistence**: `localStorage` is used to ensure users don't lose progress if they refresh or come back later.

## Data Flow
1. User enters data -> Local state + LocalStorage.
2. User submits -> Client-side audit logic calculates results.
3. AI Summary -> Backend route `/api/summary` calls Gemini.
4. Lead Capture -> Backend route `/api/leads` saves to Firestore + triggers Resend email.
5. Sharing -> Shareable ID generated; public route `/share/:id` fetches non-sensitive data.
