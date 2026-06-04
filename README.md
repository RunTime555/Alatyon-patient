 🏥 Alatyon Hospital — Patient Portal

> Patient-facing portal** for viewing lab results, downloading PDF reports, managing personal health profile, and resetting passwords — built with Next.js 16, Prisma, and PostgreSQL (Neon).

📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Horizontal Scaling](#horizontal-scaling)
- [Related Repository](#related-repository)

---

 📌 Overview

The Alatyon Patient Portalis the patient-facing side of the Alatyon Hospital Lab System. Patients can log in to view their lab results after they have been reviewed and approved by a doctor. Rejected results are hidden from patients — only approved results are visible.

The portal connects to the **same shared Neon PostgreSQL database** as the Staff Portal. When a doctor approves a lab result in the Staff Portal, it is immediately visible to the patient here.

Live URL: [https://alatyon-patent-page.vercel.app](https://alatyon-patent-page.vercel.app)

---

✨ Features

📊 Patient Dashboard (`/dashboard`)
- Personalized welcome with patient name and MRN
- Summary stats: Total results, Approved, Pending
- Recent results feed
- Quick links to lab results and profile

 🧪 Lab Results Page (`/results`)
- View all approved and pending lab results (rejected results hidden)
- Summary cards: Total, Approved, Pending
- Search by test name or result value
- Filter by status: All / Approved / Pending
- Sort by newest or oldest first
- Download individual result as **PDF** (with doctor's remark and AI analysis)
- Export all results as **PDF** report
- Detail modal with full result info

 📄 PDF Reports
- Individual result PDF — includes:
  - Hospital header with Alatyon branding
  - Patient name and MRN
  - Test name, value, unit
  - Approval status badge
  - Doctor's remark
  - AI diagnostic analysis (if generated)
  - Generated timestamp
- Full report PDF — includes all results in a table with summary counts

👤 Patient Profile (`/profile`)
- View and update personal information
- Blood group, emergency contact, occupation, date of birth
- Change profile photo
- Change password

 🔐 Authentication
- Secure login with JWT cookie authentication
- Password reset via email with tokenized links (1-hour expiry)
- Auto-redirect to login when session expires
- Route protection via Next.js middleware

 🚀 Infrastructure
- Docker containerization with multi-stage build
- Nginx load balancer with SSL termination
- Horizontal scaling support (1 → 12 instances)
- Health check endpoint for container monitoring
- Rate limiting via middleware
- GitHub Actions CI/CD pipeline



 🏗 System Architecture


                        ┌─────────────────────────────┐
                        │         Internet              │
                        └─────────────┬───────────────┘
                                      │
                        ┌─────────────▼───────────────┐
                        │      Nginx (Port 80/443)      │
                        │  Load Balancer + SSL + Cache  │
                        └──────────┬──────────────────┘
                                   │
                    ┌──────────────┼──────────────────┐
                    │              │                   │
          ┌─────────▼──┐  ┌───────▼────┐  ┌──────────▼─┐
          │  App :3000  │  │  App :3000 │  │  App :3000 │
          │ Instance 1  │  │ Instance 2 │  │ Instance 3 │
          └─────────────┘  └────────────┘  └────────────┘
                    │              │                   │
                    └──────────────┼───────────────────┘
                                   │
              ┌────────────────────▼────────────────────┐
              │         Neon PostgreSQL (Shared DB)       │
              │  Same database as Staff Portal           │
              │  Doctor approves → patient sees it       │
              └──────────────────────────────────────────┘



🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript + JavaScript |
| Database | PostgreSQL via Neon (serverless) |
| Styling | Tailwind CSS v4 |
| PDF Generation | jsPDF |
| Auth | JWT (jsonwebtoken) + HttpOnly cookies |
| Email | Nodemailer (Gmail SMTP) |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| Deployment | Vercel |
| CI/CD | GitHub Actions |



 📁 Project Structure


Alatyon-patient/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js             # Patient login
│   │   │   ├── logout/route.js            # Logout + cookie clear
│   │   │   ├── forgot-password/route.js   # Send reset email
│   │   │   └── reset-password/route.js    # Verify token + update password
│   │   ├── dashboard/route.js             # Patient data + results
│   │   └── health/route.js                # Docker health check
│   ├── (patient)/                         # Protected patient routes
│   │   ├── dashboard/page.tsx             # Patient dashboard
│   │   ├── results/page.tsx               # Lab results list + PDF download
│   │   └── profile/page.tsx               # Patient profile
│   ├── login/page.tsx                     # Patient login page
│   ├── forgot-password/page.tsx           # Forgot password form
│   ├── reset-password/page.tsx            # Set new password
│   └── layout.tsx                         # Root layout
├── components/
│   ├── header.tsx                         # Page header component
│   ├── dashboard-card.tsx                 # Card wrapper component
│   └── ui/                                # shadcn/ui components
├── lib/
│   ├── prisma.js                          # Prisma singleton client
│   └── auth.js                            # JWT utilities
├── prisma/
│   └── schema.prisma                      # Database schema (shared)
├── nginx/
│   └── nginx.conf                         # Nginx config
├── middleware.js                          # Route protection + rate limiting
├── Dockerfile                             # Multi-stage Docker build
├── docker-compose.yml                     # Container orchestration
└── scale.sh                              # Auto-scaling script



 🔄 Application Flow


Patient visits portal
        │
        ▼
Login with email + password
        │
        ▼
JWT cookie set (patient_token)
        │
        ▼
Redirect to /dashboard
        │
        ├──── View Dashboard
        │     (summary stats + recent results)
        │
        ├──── View Lab Results (/results)
        │     │
        │     ├── Only APPROVED results shown
        │     │   (REJECTED hidden from patient)
        │     │
        │     ├── Filter: All / Approved / Pending
        │     │
        │     ├── Click Eye icon → Detail Modal
        │     │   (value, doctor remark, AI analysis)
        │     │
        │     └── Click Download → PDF saved to device
        │         (individual result or all results)
        │
        ├──── View Profile (/profile)
        │     (edit personal info, change password)
        │
        └──── Logout
              (cookie cleared, redirect to login)


 

 🌐 API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Patient login |
| POST | `/api/auth/logout` | Cookie | Clear cookie and logout |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Token | Reset password |
| GET | `/api/dashboard` | Cookie | Patient data + all lab results |
| GET | `/api/health` | Public | Docker health check |



 🚀 Getting Started

 Prerequisites
- Node.js 20+
- npm or pnpm
- Same Neon PostgreSQL database as Staff Portal

 Local Development

bash
1. Clone the repository
git clone https://github.com/RunTime555/Alatyon-patient.git
cd Alatyon-patient

 2. Install dependencies
npm install

 3. Set up environment variables
cp .env.example .env
Edit .env — use same DATABASE_URL as Staff Portal

 4. Generate Prisma client (migrations already run from Staff Portal)
npx prisma generate

 5. Start development server
npm run dev


Open [http://localhost:3000](http://localhost:3000)

 🐳 Docker Deployment

bash
# Build the Docker image
docker-compose build

# Start all services (app + nginx)
docker-compose up -d

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f app

# Stop
docker-compose down


 Scaling Table

| Concurrent Users | Instances | Notes |
|---|---|---|
| ≤ 100 | 1 | Development / small hospital |
| ≤ 500 | 2 | Small-medium hospital |
| ≤ 1,000 | 3 | Medium hospital |
| ≤ 5,000 | 5 | Large hospital |
| ≤ 10,000 | 8 | Major medical center |
| > 10,000 | 12 | National-scale system |

All instances share the same Neon PostgreSQL database (cloud-hosted, pooled connections) so scaling the app layer adds capacity without any data consistency issues.



🔗 Related Repository

| Repository | Description | URL |

| Alatyon Staff Portal | Doctor and Lab Technician admin portal | [github.com/RunTime555/Alatyon-Staf](https://github.com/RunTime555/Alatyon-Staf) |

Both portals share the same database. The workflow is:


Lab Tech (Staff Portal) → uploads result
Doctor (Staff Portal)   → reviews and approves
Patient (Patient Portal) → sees approved result + downloads PDF




