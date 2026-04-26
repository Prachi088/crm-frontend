# CRM Lite — Frontend

A lightweight, modern CRM built for sales teams. Track leads, close deals, and visualize your pipeline — all in one place.

> **Live Demo:** [crm-frontend-i84l.onrender.com](https://crm-frontend-i84l.onrender.com)
> **Backend Repo:** [github.com/Prachi088/crm-backend](https://github.com/Prachi088/crm-backend)

---

## Features

- **Lead Management** — Scrollable lead list with name, email, company, deal value (INR), pipeline status badges, and High Value tags
- **Add New Lead** — Form with full name, email, company, deal value, and status
- **Analytics Dashboard** — Total leads, pipeline value (₹), conversion rate, closed won count, pipeline distribution pie chart, deal value by stage bar chart, and stage breakdown
- **Search & Filter** — Search by name, email, or company; filter by pipeline status
- **Export CSV** — Download all lead data as a CSV/Excel file
- **Notes** — Attach and expand notes on individual leads
- **Login / Logout** — Auth flow via modal with context-based session management
- **Profile Page** — View logged-in user profile details
- **About Page** — Marketing page with feature highlights
- **Terms & Conditions** — Dedicated modal/page
- **Global Footer** — Navigation and contact info across all pages
- **Dark / Light Mode** — Theme toggle in the header
- **AI Chat Widget** — Floating chat button powered by Groq AI
- **Animated Landing Page** — GSAP + Lenis smooth scroll with word-by-word hero reveal, parallax orbs, and scroll-triggered section animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Animations | GSAP, ScrollTrigger, Lenis |
| Charts | Recharts |
| Auth | Context API (AuthContext) |
| API | Axios (custom client) |
| AI | Groq AI |
| Deployment | Render |

---

## Project Structure

```
crm-frontend/
└── src/
    ├── api/
    │   └── client.js              # Axios instance and API config
    ├── components/
    │   ├── AuthModal.jsx          # Login / signup modal
    │   ├── AuthModal.css
    │   ├── LeadForm.jsx           # Add new lead form
    │   ├── LeadList.jsx           # Lead list with search, filter, notes
    │   ├── ProfilePage.jsx        # User profile page
    │   └── UserMenu.jsx           # Header user menu dropdown
    ├── context/
    │   └── AuthContext.js         # Auth state and session management
    ├── hooks/
    │   └── useInView.js           # Intersection observer hook
    ├── AboutPage.jsx              # About / marketing page
    ├── App.jsx                    # Root component and routing
    ├── ChatBox.jsx                # Groq AI floating chat widget
    ├── DesignSystem.js            # Shared design tokens
    ├── Footer.jsx                 # Global footer
    ├── LandingPage.jsx            # Animated landing page
    ├── LandingPage.css
    ├── TermsModal.jsx             # Terms and conditions
    └── index.js                  # Entry point
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

Create a `.env` file in the root:

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

## Author

**Prachi Rajput**
[GitHub](https://github.com/Prachi088) · [LinkedIn](https://linkedin.com/in/prachi-rajput-023985280)

---