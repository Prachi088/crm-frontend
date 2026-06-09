# CRM Lite — Frontend

A lightweight, animated CRM built for modern sales teams. Track leads, manage your pipeline, and visualise performance — all in one place.

> **Live Demo:** [crm-frontend-i84l.onrender.com](https://crm-frontend-i84l.onrender.com)
> **Backend Repo:** [github.com/Prachi088/crm-backend](https://github.com/Prachi088/crm-backend)

---

## Features

### Core
- **Lead Management** — Scrollable lead list with name, email, company, deal value (INR), pipeline status badges, and priority tags (High Value, Stale, Needs Attention)
- **Add New Lead** — Form with full validation for name, email, company, deal value, and pipeline status
- **Search & Filter** — Search by name, email, or company; filter by pipeline status
- **CSV Export** — Download the full lead database as a CSV file with one click
- **Notes** — Attach, view, and delete contextual notes on any lead; only the note author can delete their own notes

### Analytics
- KPI cards for total leads, pipeline value (₹), conversion rate, and closed-won count
- Pipeline distribution pie chart
- Deal value by stage bar chart
- Stage breakdown with percentage progress bars

### Auth & Users
- **Login / Register** — GSAP-animated modal with email/password validation, inline field errors, and a password visibility toggle
- **Session Management** — Token and user persisted to `localStorage` via `AuthContext`
- **My Profile** — View and update your own account; see all leads you own with mini pipeline stats
- **Team Member Profile** — Click any lead's avatar to view that user's public profile and their leads (read-only)
- **UserMenu Dropdown** — Avatar-based dropdown in the navbar with sign-out

### UI & Experience
- **Animated Landing Page** — GSAP + Lenis smooth scroll with word-by-word hero reveal, parallax orbs, and scroll-triggered section animations
- **About Page** — Area chart, radar chart, animated KPI counters, feature cards, and CRM theory cards powered by GSAP + Recharts
- **Dark / Light Mode** — Theme toggle persisted to `localStorage`; CSS variables across all components
- **AI Chat Widget** — Floating chat button powered by Groq AI (Llama 3); context-aware using live lead data
- **Global Footer** — Navigation links, social links, contact info, and current-page highlighting
- **Terms & Conditions Modal** — GSAP-animated modal with accept/close actions
- **Toast Notifications** — Success and error toasts across all actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Animations | GSAP 3, ScrollTrigger, Lenis |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | Context API (`AuthContext`) |
| API | Axios (custom client at `src/api/client.js`) |
| AI | Groq AI — Llama 3 |
| Testing | Jest, React Testing Library |
| Deployment | Render |

---

## Project Structure

```
src/
├── api/
│   └── client.js              # Axios instance, API helpers, auth headers
├── components/
│   ├── AuthModal.jsx          # Login / register modal (GSAP animated)
│   ├── AuthModal.css
│   ├── LeadForm.js            # Add new lead form with validation
│   ├── LeadList.js            # Lead list with search, filter, notes, avatars
│   ├── ProfilePage.js         # Own profile (editable) + other user profile (read-only)
│   └── UserMenu.jsx           # Navbar avatar dropdown
│   └── UserMenu.css
├── context/
│   └── AuthContext.js         # Auth state, login/logout, localStorage sync
├── hooks/
│   └── useInView.js           # IntersectionObserver hook (useInView, useStagger)
├── AboutPage.js               # About / marketing page with charts and animations
├── AboutPage.css
├── App.js                     # Root component — routing, layout, analytics, theme
├── App.css
├── ChatBox.js                 # Groq AI floating chat widget
├── DesignSystem.js            # Shared design tokens (colors, typography, spacing)
├── Footer.js                  # Global footer with navigation
├── Footer.css
├── LandingPage.js             # Animated landing page
├── LandingPage.css
├── TermsModal.js              # Terms & conditions modal
├── index.js                   # Entry point — wraps app in AuthProvider
└── index.css                  # Global reset
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend running locally or on Render — see [crm-backend](https://github.com/Prachi088/crm-backend)

### Installation

```bash
git clone https://github.com/Prachi088/crm-frontend.git
cd crm-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:8080
```

### Run Locally

```bash
npm start
```

App runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

---

## Testing

Tests are written with **Jest** and **React Testing Library**. GSAP and API calls are mocked.

```bash
npm test
```

### Test Coverage

| File | What's tested |
|---|---|
| `AuthContext.test.js` | Login normalises and stores auth data; logout clears localStorage |
| `AuthModal.test.jsx` | Register flow stores session and closes modal; stale errors clear on retry |
| `LeadForm.test.js` | Trimmed payload submitted correctly; unauthenticated users are redirected to register |
| `LeadList.test.js` | Notes: add, refresh, toast; creator-only edit/delete controls; post-delete empty state |

---

## Key Design Decisions

- **Auth guard pattern** — `LeadForm` and notes check `isAuthenticated` before any mutation; unauthenticated users are prompted to sign in rather than hitting a 401.
- **Payload normalisation** — `AuthContext` normalises every login response (`userId`, `id`, `email`) to a consistent shape before storing, preventing downstream mismatches.
- **GSAP context cleanup** — All GSAP animations use `gsap.context()` scoped to a component ref and call `ctx.revert()` on unmount, preventing animation leaks.
- **Design tokens** — `DesignSystem.js` exports a single `DESIGN_TOKENS` object and helper functions (`getStatusColor`, `getThemeColor`) consumed across components for consistent theming.
- **Per-note ownership** — The delete button on a note is only rendered when `note.createdBy.id === currentUser.id`, enforced on the frontend and independently on the backend.

---

## Pipeline Stages

| Stage | Colour |
|---|---|
| Prospect | Indigo `#6366F1` |
| Qualified | Orange `#F97316` |
| Proposal | Blue `#3B82F6` |
| Closed Won | Green `#22C55E` |
| Closed Lost | Red `#F43F5E` |

---

## Author

**Prachi Rajput**
[GitHub](https://github.com/Prachi088) · [LinkedIn](https://linkedin.com/in/prachi-rajput-023985280)
