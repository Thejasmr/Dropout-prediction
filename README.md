# EduPulse AI — Student Dropout Prediction & Counseling Platform
## Open-Source EdTech SaaS | Powered by Machine Learning

---

## Table of Contents

1. [Problem Statement Overview](#1-problem-statement-overview)
2. [Problem Analysis](#2-problem-analysis)
3. [Proposed Solution](#3-proposed-solution)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Tech Stack](#6-tech-stack)
7. [Objectives](#7-objectives)
8. [ML Pipeline](#8-ml-pipeline)
9. [Dashboard & Features](#9-dashboard--features)
10. [Notification System](#10-notification-system)
11. [API Design](#11-api-design)
12. [Database Schema](#12-database-schema)
13. [Environment Configuration](#13-environment-configuration)
14. [Setup & Installation](#14-setup--installation)
15. [Deployment Strategy](#15-deployment-strategy)
16. [Performance Optimisation Architecture](#16-performance-optimisation-architecture)
17. [Expected Outcomes](#17-expected-outcomes)

---

## 1. Problem Statement Overview

**Product:** EduPulse AI  
**Target Market:** Universities, Colleges, and Technical Institutes — Globally  
**Segment:** EdTech SaaS / Institutional Analytics  
**Category:** Software  
**Theme:** Smart Automation & Predictive Analytics  

### Core Problem

Institutions worldwide maintain student data across **isolated silos**:

| Data Type | Current State |
|-----------|--------------|
| Attendance | Separate spreadsheet |
| Test / Assessment Scores | Separate spreadsheet |
| Fee Payment Records | Separate spreadsheet |
| Subject Attempt History | Separate spreadsheet |

No unified view exists to detect when a student is simultaneously struggling across multiple dimensions. Counsellors lack early warning signals, meaning interventions happen **after** a student has already disengaged — often too late.


### Key Pain Points

- **Late Detection:** Risk is identified only after repeated failures or absence streaks.
- **No Cross-Signal Correlation:** A student with 60% attendance, declining test scores, and overdue fees is never flagged as a compound risk.
- **Counsellor Overload:** Manual review of spreadsheets is time-consuming and error-prone.
- **Budget Constraints:** Commercial analytics tools are unaffordable for government institutes.
- **Lack of Transparency:** Complex black-box models are distrusted by educators.

---

## 2. Problem Analysis

### Risk Indicators Identified

| Indicator | Threshold (Configurable) | Weight |
|-----------|--------------------------|--------|
| Attendance Rate | < 75% | High |
| Consecutive Absences | > 7 days | High |
| Test Score Trend | Declining over 3 tests | Medium |
| Subject Attempt Count | ≥ 3 attempts on same subject | High |
| Fee Payment Delay | > 30 days overdue | Medium |
| Assignment Submission Rate | < 60% | Low |
| Participation Index | Bottom 10% of cohort | Low |

### Risk Classification

- 🔴 **High Risk (Score 70–100):** Immediate counsellor intervention required
- 🟡 **Medium Risk (Score 40–69):** Mentor follow-up within a week
- 🟢 **Low Risk (Score 0–39):** Monitor, no immediate action

---

## 3. Proposed Solution

A **consolidated digital platform** that:

1. **Ingests** data from spreadsheets (CSV/Excel), databases, and manual entry forms.
2. **Fuses** multi-source data into a single student profile.
3. **Applies** interpretable ML models + rule-based logic to score dropout risk.
4. **Visualises** risk on an intuitive colour-coded dashboard.
5. **Dispatches** scheduled alerts to mentors and guardians via Email/SMS/WhatsApp.
6. **Empowers** educators with explainable AI — not black-box predictions.

### Design Philosophy

> "Take what is already present, integrate it cleverly, and produce meaningful impact."

- **No new data collection required** — works with existing spreadsheets.
- **Configurable thresholds** — educators control what defines "at-risk."
- **Minimal training** — familiar spreadsheet-style UI with colour coding.
- **Transparent logic** — every risk flag is explained with its contributing factors.

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                    Next.js 14 (App Router) — Port 3000                      │
│                                                                              │
│  ┌─────────────────────────────┐   ┌──────────────────────────────────────┐ │
│  │   PUBLIC LAYOUT (Pre-Login) │   │  APP SHELL LAYOUT (Post-Login)       │ │
│  │  Public Navbar + Hero       │   │  Org Switcher │ Cmd+K Search         │ │
│  │  Landing │ Pricing │ Demo   │   │  Notifications │ Role Dropdown       │ │
│  │  ROI Calculator │ Testimonials│  │  Sidebar Nav │ Dark/Light Toggle    │ │
│  │  Public Footer + Status     │   │  Mobile Drawer │ Chatbot FAB         │ │
│  └─────────────────────────────┘   └──────────────────────────────────────┘ │
│                                                                              │
│         Framer Motion Animations │ React Query RSC │ Zustand State          │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ REST / WebSocket / SSE (streaming)
┌──────────────────────────────────────▼───────────────────────────────────────┐
│                              BACKEND LAYER                                   │
│                       Python FastAPI — Port 8000                             │
│    Auth │ Student API │ Ingestion │ Notifications │ Chatbot (LLM + RAG)     │
└──────────────┬────────────────────────────────────┬──────────────────────────┘
               │ HTTP                               │ Async SQLAlchemy / ORM
┌──────────────▼───────────┐       ┌────────────────▼────────────────────────┐
│       ML SERVICE         │       │            DATABASE LAYER               │
│   Python FastAPI         │       │  PostgreSQL 15  (primary store)         │
│   Port 8001              │       │  Redis 7        (cache TTL + queues)    │
│                          │       │  MinIO          (API :9000 / UI :9001)  │
│  - Preprocessing         │       └─────────────────────────────────────────┘
│  - Feature Engineering   │
│  - XGBoost Inference     │       ┌─────────────────────────────────────────┐
│  - Model Retraining      │       │         ASYNC WORKER LAYER              │
│  ························│       │  Celery Workers (risk recalc, SHAP)     │
│  ↓  SHAP TreeExplainer   │       │  Celery Beat    (scheduled digests)     │
└──────────────────────────┘       │  Email (SMTP) │ SMS │ WhatsApp          │
                                   └─────────────────────────────────────────┘
```


---

## 5. Project Structure

> **Convention:** Every page lives in its own folder. Each folder owns its component, styles, and local logic — nothing bleeds into sibling folders. Shared code lives in clearly named top-level directories. All files are `.js` / `.jsx`.

```
dropout_prediction/
│
├── frontend/                               # Next.js 14 (App Router) — JavaScript only
│   ├── .env.local                          # Frontend environment variables
│   ├── next.config.js                      # Next.js config (rewrites, image domains)
│   ├── jsconfig.json                       # Path aliases (@/components, @/lib, etc.)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.js
│   ├── .prettierrc
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── assets/
│   │       └── images/
│   │
│   └── src/
│       │
│       ├── app/                            # Next.js App Router root
│       │   ├── layout.js                   # Root layout — fonts, AppProviders
│       │   ├── globals.css                 # Global Tailwind base styles
│       │   ├── not-found.js                # Global 404 page
│       │   ├── error.js                    # Global error boundary
│       │   │
│       │   ├── (public)/                   # ── PUBLIC LAYOUT GROUP (Pre-Login) ──
│       │   │   ├── layout.js               # Public Navbar + Public Footer shell
│       │   │   ├── page.js                 # SaaS Landing Page (hero, ROI calc, testimonials)
│       │   │   ├── pricing/
│       │   │   │   └── page.js             # Pricing tiers & feature comparison
│       │   │   └── demo/
│       │   │       └── page.js             # Request Demo / contact form
│       │   │
│       │   ├── (auth)/                     # ── AUTH ROUTE GROUP (no layout shell) ──
│       │   │   ├── login/
│       │   │   │   ├── page.js             # Login page
│       │   │   │   └── loading.js          # Suspense skeleton
│       │   │   └── logout/
│       │   │       └── page.js             # Logout handler + redirect
│       │   │
│       │   ├── (dashboard)/                # ── PROTECTED APP SHELL (Post-Login) ──
│       │   │   ├── layout.js               # App shell: Sidebar + Topbar + ChatbotWidget
│       │   │   │
│       │   │   ├── dashboard/              # Main dashboard
│       │   │   │   ├── page.js             # Risk summary, KPI cards, heatmap
│       │   │   │   └── loading.js          # Skeleton for KPI cards
│       │   │   │
│       │   │   ├── students/               # Student management
│       │   │   │   ├── page.js             # Paginated student roster
│       │   │   │   ├── loading.js
│       │   │   │   └── [id]/               # Dynamic student profile
│       │   │   │       ├── page.js         # Full detail + risk breakdown + SHAP panel
│       │   │   │       ├── loading.js
│       │   │   │       └── not-found.js
│       │   │   │
│       │   │   ├── alerts/                 # Risk alert centre
│       │   │   │   ├── page.js             # Alert feed filterable by severity
│       │   │   │   └── loading.js
│       │   │   │
│       │   │   ├── reports/                # Reports & exports
│       │   │   │   ├── page.js             # Report builder + PDF/CSV export
│       │   │   │   └── loading.js
│       │   │   │
│       │   │   ├── ingestion/              # Data upload & mapping
│       │   │   │   ├── page.js             # Upload wizard + field mapper
│       │   │   │   └── loading.js
│       │   │   │
│       │   │   └── settings/               # Admin configuration
│       │   │       ├── page.js             # Settings hub
│       │   │       ├── loading.js
│       │   │       ├── thresholds/
│       │   │       │   └── page.js         # Risk threshold config
│       │   │       ├── notifications/
│       │   │       │   └── page.js         # Notification schedule config
│       │   │       └── users/
│       │   │           └── page.js         # User & role management
│       │   │
│       │   └── api/                        # Next.js Route Handlers (BFF layer)
│       │       ├── auth/
│       │       │   └── [...nextauth]/
│       │       │       └── route.js        # NextAuth catch-all
│       │       └── proxy/
│       │           └── [...path]/
│       │               └── route.js        # Transparent proxy to FastAPI
│       │
│       ├── components/                     # Shared, reusable UI components
│       │   │
│       │   ├── ui/                         # Primitive UI building blocks
│       │   │   ├── Button/
│       │   │   │   ├── Button.js
│       │   │   │   └── index.js            # Re-export
│       │   │   ├── Badge/
│       │   │   │   ├── Badge.js
│       │   │   │   └── index.js
│       │   │   ├── Card/
│       │   │   │   ├── Card.js
│       │   │   │   └── index.js
│       │   │   ├── Modal/
│       │   │   │   ├── Modal.js
│       │   │   │   └── index.js
│       │   │   ├── Table/
│       │   │   │   ├── Table.js
│       │   │   │   └── index.js
│       │   │   ├── Input/
│       │   │   │   ├── Input.js
│       │   │   │   └── index.js
│       │   │   ├── Select/
│       │   │   │   ├── Select.js
│       │   │   │   └── index.js
│       │   │   ├── Spinner/
│       │   │   │   ├── Spinner.js
│       │   │   │   └── index.js
│       │   │   └── Toast/
│       │   │       ├── Toast.js
│       │   │       └── index.js
│       │   │
│       │   ├── landing/                    # ── PUBLIC LANDING PAGE COMPONENTS ──
│       │   │   ├── PublicNavbar/
│       │   │   │   ├── PublicNavbar.js     # Logo, Features, Pricing, Sign In CTA
│       │   │   │   └── index.js
│       │   │   ├── HeroSection/
│       │   │   │   ├── HeroSection.js      # Animated gradient headline + CTA buttons
│       │   │   │   └── index.js
│       │   │   ├── ROICalculator/
│       │   │   │   ├── ROICalculator.js    # Interactive dropout reduction estimator
│       │   │   │   └── index.js
│       │   │   ├── FeatureCards/
│       │   │   │   ├── FeatureCards.js     # Product feature breakdown grid
│       │   │   │   └── index.js
│       │   │   ├── PricingSection/
│       │   │   │   ├── PricingSection.js   # Tier cards with feature comparison
│       │   │   │   └── index.js
│       │   │   ├── TestimonialCarousel/
│       │   │   │   ├── TestimonialCarousel.js  # Auto-playing institute testimonials
│       │   │   │   └── index.js
│       │   │   ├── PartnerLogos/
│       │   │   │   ├── PartnerLogos.js     # Government / institute partner strip
│       │   │   │   └── index.js
│       │   │   └── PublicFooter/
│       │   │       ├── PublicFooter.js     # Links, Privacy, ToS, Status badge
│       │   │       └── index.js
│       │   │
│       │   ├── chatbot/                    # ── FLOATING AI COUNSELING CHATBOT ──
│       │   │   ├── ChatbotWidget/
│       │   │   │   ├── ChatbotWidget.js    # FAB + expandable chat window (post-login only)
│       │   │   │   └── index.js
│       │   │   ├── ChatMessage/
│       │   │   │   ├── ChatMessage.js      # Individual message bubble w/ typist effect
│       │   │   │   └── index.js
│       │   │   └── ChatSuggestions/
│       │   │       ├── ChatSuggestions.js  # Quick-action suggestion chips
│       │   │       └── index.js
│       │   │
│       │   ├── charts/                     # Chart wrapper components
│       │   │   ├── AttendanceLineChart/
│       │   │   │   ├── AttendanceLineChart.js
│       │   │   │   └── index.js
│       │   │   ├── ScoreTrendChart/
│       │   │   │   ├── ScoreTrendChart.js
│       │   │   │   └── index.js
│       │   │   ├── RiskDonutChart/
│       │   │   │   ├── RiskDonutChart.js
│       │   │   │   └── index.js
│       │   │   └── RiskHeatmap/
│       │   │       ├── RiskHeatmap.js
│       │   │       └── index.js
│       │   │
│       │   ├── dashboard/                  # Dashboard-specific composed widgets
│       │   │   ├── RiskSummaryCards/
│       │   │   │   ├── RiskSummaryCards.js # Staggered-animated KPI cards
│       │   │   │   └── index.js
│       │   │   ├── RiskBadge/
│       │   │   │   ├── RiskBadge.js        # Red / Yellow / Green pulsing badge
│       │   │   │   └── index.js
│       │   │   ├── StudentCard/
│       │   │   │   ├── StudentCard.js      # Hover spotlight micro-interaction
│       │   │   │   └── index.js
│       │   │   ├── AlertFeed/
│       │   │   │   ├── AlertFeed.js
│       │   │   │   └── index.js
│       │   │   └── ExplainPanel/
│       │   │       ├── ExplainPanel.js     # SHAP factor breakdown
│       │   │       └── index.js
│       │   │
│       │   ├── students/                   # Student-specific components
│       │   │   ├── StudentTable/
│       │   │   │   ├── StudentTable.js
│       │   │   │   └── index.js
│       │   │   ├── StudentFilters/
│       │   │   │   ├── StudentFilters.js
│       │   │   │   └── index.js
│       │   │   ├── CounsellingLog/
│       │   │   │   ├── CounsellingLog.js
│       │   │   │   └── index.js
│       │   │   └── RiskOverrideForm/
│       │   │       ├── RiskOverrideForm.js
│       │   │       └── index.js
│       │   │
│       │   ├── ingestion/                  # Data upload components
│       │   │   ├── UploadZone/
│       │   │   │   ├── UploadZone.js       # Drag-and-drop CSV/Excel upload
│       │   │   │   └── index.js
│       │   │   ├── FieldMapper/
│       │   │   │   ├── FieldMapper.js      # Column mapping UI
│       │   │   │   └── index.js
│       │   │   └── IngestionHistory/
│       │   │       ├── IngestionHistory.js
│       │   │       └── index.js
│       │   │
│       │   └── layout/                     # App shell components (post-login)
│       │       ├── Sidebar/
│       │       │   ├── Sidebar.js          # Desktop collapsible sidebar
│       │       │   ├── SidebarItem.js
│       │       │   └── index.js
│       │       ├── AppNavbar/
│       │       │   ├── AppNavbar.js        # Org switcher, Cmd+K, notifications, user menu
│       │       │   ├── OrgSwitcher.js      # Institute/Campus switcher dropdown
│       │       │   ├── GlobalSearch.js     # Cmd+K modal with live results
│       │       │   ├── NotificationBell.js # Real-time bell with unread badge
│       │       │   ├── UserMenu.js         # Profile, role indicator, dark mode toggle
│       │       │   └── index.js
│       │       ├── MobileDrawer/
│       │       │   ├── MobileDrawer.js     # Slide-out gesture nav for mobile/tablet
│       │       │   └── index.js
│       │       ├── PageHeader/
│       │       │   ├── PageHeader.js
│       │       │   └── index.js
│       │       └── AnimatedLayout/
│       │           ├── AnimatedLayout.js   # Framer Motion page transition wrapper
│       │           └── index.js
│       │
│       ├── hooks/                          # Custom React hooks
│       │   ├── useStudents.js              # Fetch + filter student list
│       │   ├── useStudent.js               # Single student detail
│       │   ├── useRiskScore.js             # Risk score + explanation
│       │   ├── useAlerts.js                # Alert feed
│       │   ├── useNotifications.js         # Notification state
│       │   ├── useIngestion.js             # Upload & mapping
│       │   ├── useAuth.js                  # Session / role helpers
│       │   ├── useChatbot.js               # Chatbot message state + SSE streaming
│       │   ├── useTheme.js                 # Dark/light mode toggle
│       │   └── useKeyboardShortcut.js      # Cmd+K global search binding
│       │
│       ├── lib/                            # Pure utility modules (no React)
│       │   ├── apiClient.js                # Axios instance with interceptors
│       │   ├── auth.js                     # NextAuth config & callbacks
│       │   ├── queryClient.js              # React Query client setup
│       │   ├── formatters.js               # Date, number, percentage helpers
│       │   ├── riskUtils.js                # Risk colour / label helpers
│       │   └── constants.js                # App-wide constants
│       │
│       ├── store/                          # Zustand global state slices
│       │   ├── useStudentStore.js
│       │   ├── useAlertStore.js
│       │   ├── useSettingsStore.js
│       │   └── useChatbotStore.js          # Chat history, open/close state
│       │
│       └── providers/                      # React context providers
│           ├── AppProviders.js             # Wraps QueryClient + Auth + Toast
│           └── ThemeProvider.js
│
├── backend/                                # Python FastAPI — Port 8000
│   ├── .env                                # Backend environment variables
│   ├── requirements.txt
│   ├── requirements-dev.txt                # Dev-only deps (pytest, black, ruff)
│   ├── Dockerfile
│   ├── main.py                             # FastAPI app entry point
│   │
│   ├── alembic/                            # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/                       # Auto-generated migration files
│   │
│   └── app/
│       ├── core/
│       │   ├── config.py                   # Pydantic settings from .env
│       │   ├── security.py                 # JWT encode/decode, hashing
│       │   ├── database.py                 # Async SQLAlchemy engine + session
│       │   └── dependencies.py             # FastAPI dependency injections
│       │
│       ├── models/                         # SQLAlchemy ORM models (one file = one table)
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── student.py
│       │   ├── course.py
│       │   ├── attendance.py
│       │   ├── assessment.py
│       │   ├── fee.py
│       │   ├── risk_score.py
│       │   ├── alert.py
│       │   └── counselling_session.py
│       │
│       ├── schemas/                        # Pydantic v2 request/response schemas
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── student.py
│       │   ├── attendance.py
│       │   ├── assessment.py
│       │   ├── fee.py
│       │   ├── risk_score.py
│       │   └── alert.py
│       │
│       ├── routers/                        # Route handlers grouped by domain
│       │   ├── __init__.py
│       │   ├── auth.py                     # /api/v1/auth/*
│       │   ├── students.py                 # /api/v1/students/*
│       │   ├── attendance.py               # /api/v1/attendance/*
│       │   ├── assessments.py              # /api/v1/assessments/*
│       │   ├── fees.py                     # /api/v1/fees/*
│       │   ├── ingestion.py                # /api/v1/ingestion/*
│       │   ├── alerts.py                   # /api/v1/alerts/*
│       │   ├── notifications.py            # /api/v1/notifications/*
│       │   └── reports.py                  # /api/v1/reports/*
│       │
│       ├── services/                       # Business logic layer
│       │   ├── auth_service.py
│       │   ├── student_service.py
│       │   ├── risk_service.py             # Calls ML service, stores scores
│       │   ├── ingestion_service.py        # Parse + validate uploaded files
│       │   ├── notification_service.py     # Email / SMS dispatch
│       │   └── report_service.py
│       │
│       ├── tasks/                          # Celery async tasks
│       │   ├── celery_app.py               # Celery + Redis broker setup
│       │   ├── scheduled.py                # Celery Beat schedules
│       │   ├── risk_tasks.py               # Nightly batch risk recalculation
│       │   └── notification_tasks.py       # Scheduled digest / alert dispatch
│       │
│       └── utils/
│           ├── file_parser.py              # CSV / Excel → DataFrame
│           ├── validators.py               # Data integrity checks
│           ├── pagination.py               # Cursor / offset pagination helpers
│           └── seed_admin.py               # Seeds the initial admin user on first deploy
│
├── ml_service/                             # ML Microservice — Port 8001
│   ├── .env                                # ML service environment variables
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py                             # FastAPI ML app entry point
│   │
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py                   # Settings from .env
│   │   │   └── database.py                 # Read-only DB connection for training
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── predict.py                  # /ml/v1/predict
│   │   │   ├── explain.py                  # /ml/v1/explain
│   │   │   ├── retrain.py                  # /ml/v1/retrain
│   │   │   └── model_info.py               # /ml/v1/model/info
│   │   │
│   │   ├── services/
│   │   │   ├── preprocessor.py             # Clean + encode raw features
│   │   │   ├── feature_engineering.py      # Derive attendance_rate, score_trend, etc.
│   │   │   ├── predictor.py                # Load model, run inference
│   │   │   ├── explainer.py                # SHAP values → human-readable factors
│   │   │   └── trainer.py                  # Full training pipeline
│   │   │
│   │   ├── schemas/
│   │   │   ├── prediction.py               # Request / response schemas
│   │   │   └── retrain.py
│   │   │
│   │   └── artifacts/                      # Versioned model files (gitignored)
│   │       ├── v1.0.0/
│   │       │   ├── risk_model.pkl
│   │       │   └── scaler.pkl
│   │       └── latest -> v1.0.0/           # Symlink to active version
│   │
│   ├── notebooks/                          # Exploratory analysis (not shipped)
│   │   ├── 01_eda.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   └── 03_model_training.ipynb
│   │
│   └── data/
│       ├── raw/                            # Original sample CSVs (gitignored)
│       └── processed/                      # Cleaned datasets (gitignored)
│
├── docker-compose.yml                      # Orchestrates all services
├── docker-compose.override.yml             # Local dev overrides (hot reload, ports)
├── nginx/
│   └── nginx.conf                          # Reverse proxy config
├── .env                                    # Root shared env (DB, Redis, MinIO)
├── .env.example                            # Safe template to commit
├── .gitignore
└── README.md
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page files | `page.js` (Next.js reserved) | `dashboard/page.js` |
| Component files | PascalCase | `RiskBadge.js` |
| Each component | Own folder + `index.js` re-export | `RiskBadge/index.js` |
| Hooks | camelCase with `use` prefix | `useStudents.js` |
| Store slices | camelCase with `use` prefix | `useStudentStore.js` |
| Lib/utils | camelCase | `riskUtils.js` |
| Python modules | snake_case | `student_service.py` |

### Import Alias (jsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":         ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*":   ["src/hooks/*"],
      "@/lib/*":     ["src/lib/*"],
      "@/store/*":   ["src/store/*"],
      "@/providers/*": ["src/providers/*"]
    }
  }
}
```


---

## 6. Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | SSR/SSG/RSC React framework |
| JavaScript (ES2022+) | Runtime language — `.js` / `.jsx` throughout |
| jsconfig.json | Path aliases and editor intellisense (no TypeScript) |
| Tailwind CSS | Utility-first styling + dark mode (`class` strategy) |
| shadcn/ui | Accessible component library |
| Framer Motion | Page transitions, staggered reveals, micro-interactions |
| Recharts | Data visualisation with animated chart entry |
| NextAuth.js | Authentication (JWT + OAuth) |
| Zustand | Client state management |
| React Query (TanStack) | Server state, caching (`staleTime: 5 * 60 * 1000`) |
| Axios | HTTP client with interceptors |
| ESLint + Prettier | Code quality and formatting |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.11 | Runtime |
| FastAPI | REST API + SSE streaming (chatbot) |
| SQLAlchemy 2.0 | Async ORM |
| Alembic | Database migrations |
| Pydantic v2 | Data validation |
| PostgreSQL | Primary database |
| Redis | Risk score cache (TTL), task queue |
| Celery | Async SHAP recalculation + notification dispatch |
| MinIO | File/spreadsheet + model artifact storage |
| python-jose | JWT authentication |
| Passlib | Password hashing |
| LangChain / LlamaIndex | LLM orchestration layer for AI chatbot |
| OpenAI / Ollama | LLM provider (configurable — cloud or self-hosted) |

### ML Service
| Technology | Purpose |
|------------|---------|
| scikit-learn | Model training & evaluation |
| XGBoost / LightGBM | Gradient boosted risk classifier |
| SHAP | Model explainability |
| pandas | Data manipulation |
| numpy | Numerical computing |
| imbalanced-learn | Handle class imbalance (SMOTE) |
| joblib | Model serialisation |
| FastAPI | ML inference API |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker + Docker Compose | Containerisation |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD pipeline |

---

## 7. Objectives

### Primary Objectives

1. **Unified Data Ingestion**
   - Accept CSV/Excel uploads for attendance, scores, fee records.
   - Auto-map columns via configurable field-mapping UI.
   - Schedule automated ingestion from shared drives or institute APIs.

2. **Multi-Signal Risk Scoring**
   - Combine attendance, academic performance, payment history, and attempt count into a single composite risk score.
   - Use both rule-based thresholds (transparent) and ML models (accurate).
   - Score updated after every data ingestion cycle.

3. **Interpretable AI**
   - Every risk score is accompanied by a human-readable explanation.
   - SHAP values indicate which factors contributed most to a student's risk.
   - Educators can override scores with a documented reason.

4. **Visual Dashboard**
   - Colour-coded student roster (Red/Yellow/Green).
   - Trend charts for attendance and scores over time.
   - Risk heatmap across courses, batches, and departments.
   - Filterable and sortable student table.

5. **Proactive Notifications**
   - Automated weekly digest emails to mentors.
   - Immediate alerts when a student crosses the high-risk threshold.
   - SMS/WhatsApp notifications to guardians (configurable per student).
   - Notification logs and delivery confirmations.

6. **Configurable Thresholds**
   - Admin panel to adjust risk thresholds without code changes.
   - Department-specific configurations.
   - Enable/disable individual risk signals.

7. **Intervention Tracking**
   - Log counsellor interactions per student.
   - Track outcomes of interventions over time.
   - Generate outcome reports for institutional review.

8. **Minimal Setup & Maintenance**
   - Runs on existing institutional hardware.
   - Docker-based deployment — no manual dependency management.
   - Role-based access: Admin, Counsellor, Mentor, Viewer.

### Secondary Objectives

- Generate semester-end dropout risk reports for institutional compliance submission.
- Cohort comparison across years to measure program effectiveness.
- Exportable PDF/CSV reports for accreditation and regulatory audits.
- API-ready for future integration with DigiLocker or SIMS.

---

## 8. ML Pipeline

### Data Flow

```
Raw Spreadsheets
      │
      ▼
  Data Ingestion & Validation
      │
      ▼
  Data Preprocessing
  - Handle missing values (median/mode imputation)
  - Encode categorical features
  - Normalise numerical features (StandardScaler)
      │
      ▼
  Feature Engineering
  - attendance_rate = present_days / total_days
  - score_trend = slope of last 3 test scores
  - attempt_ratio = attempts_used / max_attempts
  - fee_delay_days = days since due date
  - composite_risk_score = weighted sum of signals
      │
      ▼
  ML Model (XGBoost Classifier)
  - Binary classification: At-Risk / Not-At-Risk
  - Multi-class: High / Medium / Low
  - Trained on historical dropout data
  - SMOTE for class imbalance
      │
      ▼
  SHAP Explainability
  - Uses `shap.TreeExplainer` for fast, real-time feature importance during inference
  - Top 3 contributing factors per student
  - Feature importance visualisation
      │
      ▼
  Risk Score + Explanation → API Response
```

### Model Selection Rationale

| Model | Pros | Cons |
|-------|------|------|
| Logistic Regression | Explainable, fast | Low accuracy on non-linear data |
| Random Forest | Good accuracy | Less interpretable |
| **XGBoost** | **High accuracy, handles missing values, fast** | **Chosen** |
| Neural Network | Very high accuracy | Black box, needs large data |

### Feature Importance (Expected)

1. Attendance Rate (35%)
2. Score Trend (25%)
3. Repeat Attempt Count (20%)
4. Fee Payment Delay (15%)
5. Assignment Submission Rate (5%)

### Model Retraining

- Triggered automatically at end of each semester.
- Manual retraining available from Admin panel.
- Model versioning stored in MinIO.
- A/B testing between model versions before deployment.

---

## 9. Dashboard & Features

### Layout Architecture

#### Public SaaS Layout (Pre-Login)

| Section | Contents |
|---------|---------|
| Public Navbar | Logo, Features, Pricing, Impact Metrics, "Sign In" + "Request Demo" CTAs |
| Hero Section | Animated gradient headline, subtitle, dual CTAs, animated institution count |
| ROI Calculator | Interactive slider — input institution size, outputs estimated dropout reduction |
| Feature Cards | Six product pillars with icons, animated on scroll entry |
| Partner Logos | Global university, college, and institute partner logo strip |
| Pricing Section | Free / Institutional / Enterprise tier cards with feature comparison table |
| Testimonial Carousel | Auto-playing quotes from counsellors and institute administrators |
| Public Footer | Policy links, ToS, Compliance badges, real-time System Status indicator |

#### Protected App Shell (Post-Login)

| Element | Behaviour |
|---------|---------|
| Organisation Switcher | Select Institute / Campus from dropdown — scopes all data to selection |
| Global Quick Search | `Cmd + K` modal — searches students, alerts, reports with live results |
| Notification Centre | Bell icon with unread badge, real-time alert feed in slide-out panel |
| User Profile Dropdown | Avatar, name, role indicator (Admin / Counsellor / Mentor), Logout |
| Dark / Light Toggle | Persisted in `localStorage`, applied via Tailwind `dark:` classes |
| Mobile Drawer | Slide-out gesture nav for viewports < 768 px |

### Animation Standards (Framer Motion)

| Interaction | Implementation |
|-------------|---------------|
| Page route transitions | `initial={{ opacity:0, y:15 }}` → `animate={{ opacity:1, y:0 }}` → `exit={{ opacity:0, y:-15 }}` |
| KPI card stagger | `staggerChildren: 0.08` on dashboard summary card container |
| High-risk badge pulse | `animate={{ scale:[1,1.05,1] }}` · `transition={{ repeat:Infinity, duration:2 }}` |
| Chart entry | Recharts `animationBegin: 0`, `animationDuration: 800` on all series |
| Attendance SVG ring | Animated stroke-dashoffset from 0 → target on mount |
| Student card hover | `whileHover={{ scale:1.02, boxShadow:"0 8px 30px rgba(0,0,0,0.12)" }}` |
| Modal / drawer | `backdrop-blur-md` backdrop + spring physics: `type:"spring", stiffness:300, damping:30` |

### Floating AI Counseling Chatbot

The chatbot is a **post-login-only** feature, rendered inside `(dashboard)/layout.js`.

| Feature | Detail |
|---------|--------|
| Entry point | Fixed FAB at `bottom-6 right-6`, `z-index: 50`, glowing avatar ring |
| Chat window | Collapsible header, scrollable message history, input bar |
| Streaming | SSE from `/api/v1/chatbot/query` — renders tokens with typist effect |
| Suggestion chips | Pre-built prompts shown on open (see examples below) |
| RAG context | Queries against student risk records + institutional counselling guidelines |

**Example suggestion chips:**
- *"Show top 10 high-risk students in the CS department"*
- *"Draft a parent email for Student #1042's overdue fees"*
- *"Explain the SHAP risk factors for Student ID #1042"*
- *"Which batch has the highest average dropout risk this semester?"*

### Main Dashboard Panels

| Panel | Description |
|-------|-------------|
| Risk Summary Cards | Stagger-animated KPI counts — High / Medium / Low risk students |
| Risk Heatmap | Colour grid across courses, batches, and departments |
| Trend Chart | Attendance & score timelines with smooth animated entry |
| Alert Feed | Real-time list of newly flagged students, filterable by severity |
| Cohort Comparison | Department-wise dropout risk bar chart |

### Student Profile Page

- Personal details + contact info
- Risk score with pulsing colour badge + SHAP explanation panel
- Animated attendance ring (SVG progress arc)
- Test score trend chart with smooth entry animation
- Fee payment history timeline
- Counsellor interaction log
- Manual override option with mandatory reason field

### Admin Settings Panel

- Threshold configuration per risk signal (no code change required)
- Notification schedule configuration
- Data ingestion management (upload history, re-run, field remapping)
- User management (roles & permissions)
- Model management (current version, A/B results, retrain trigger)

---

## 10. Notification System

### Notification Types

| Type | Trigger | Recipients | Channel |
|------|---------|------------|---------|
| High Risk Alert | Student crosses 70 score | Counsellor + Mentor | Email + SMS |
| Weekly Digest | Every Monday 8 AM | All mentors | Email |
| Guardian Alert | Score drops > 20% in a week | Guardian | SMS / WhatsApp |
| Fee Reminder | 30 days overdue | Student + Guardian | Email + SMS |
| Intervention Due | No counsellor contact in 14 days | Counsellor | Email |

### Delivery Architecture

```
Celery Beat (Scheduler)
      │
      ▼
Celery Worker
      │
   ┌──┴──┐
   │     │
SMTP   SMS Gateway (Twilio / MSG91)
Email  │
       WhatsApp Business API
```


---

## 11. API Design

### Backend API (Port 8000)

#### Authentication
```
POST   /api/v1/auth/login          # JWT login
POST   /api/v1/auth/refresh        # Refresh token
POST   /api/v1/auth/logout         # Invalidate token
```

#### Students
```
GET    /api/v1/students            # List students (paginated, filterable)
GET    /api/v1/students/{id}       # Student detail
GET    /api/v1/students/{id}/risk  # Risk score + explanation
GET    /api/v1/students/{id}/timeline  # Historical data
POST   /api/v1/students/{id}/override  # Manual risk override
POST   /api/v1/students/{id}/counselling  # Log counsellor session
```

#### Data Ingestion
```
POST   /api/v1/ingestion/upload        # Upload CSV/Excel file
GET    /api/v1/ingestion/history       # Upload history
POST   /api/v1/ingestion/reprocess     # Re-run processing on a file
POST   /api/v1/ingestion/map-fields    # Configure column mapping
```

#### Alerts & Notifications
```
GET    /api/v1/alerts              # List alerts
PATCH  /api/v1/alerts/{id}/read    # Mark as read
POST   /api/v1/notifications/test  # Send test notification
GET    /api/v1/notifications/log   # Delivery log
```

#### Reports
```
GET    /api/v1/reports/summary     # Institution-level summary
GET    /api/v1/reports/cohort      # Cohort comparison
GET    /api/v1/reports/export      # Export PDF/CSV
```

#### AI Chatbot
```
POST   /api/v1/chatbot/query       # Async LLM + RAG query (SSE streaming response)
GET    /api/v1/chatbot/history     # Retrieve session chat history
DELETE /api/v1/chatbot/history     # Clear session chat history
```

### ML Service API (Port 8001)

```
POST   /ml/v1/predict              # Predict risk for one student
POST   /ml/v1/predict/batch        # Batch prediction
POST   /ml/v1/retrain              # Trigger model retraining
GET    /ml/v1/model/info           # Current model metadata
GET    /ml/v1/explain/{student_id} # SHAP explanation
GET    /ml/v1/features/importance  # Global feature importance
```

---

## 12. Database Schema

### Core Tables

```sql
-- Students
students (
  id UUID PRIMARY KEY,
  enrollment_no VARCHAR UNIQUE,
  full_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  guardian_phone VARCHAR,
  guardian_email VARCHAR,
  course_id UUID,
  batch_year INT,
  current_semester INT,
  created_at TIMESTAMP
)

-- Optimise course/semester cohort queries
CREATE INDEX idx_students_course_semester ON students(course_id, current_semester);

-- Attendance
attendance_records (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  date DATE,
  subject_id UUID,
  status ENUM('present','absent','late'),
  recorded_at TIMESTAMP
)

-- Assessments
assessment_scores (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  subject_id UUID,
  assessment_type VARCHAR,  -- 'test', 'assignment', 'exam'
  score FLOAT,
  max_score FLOAT,
  attempt_number INT,
  assessment_date DATE
)

-- Fee Records
fee_records (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  semester INT,
  amount_due DECIMAL,
  amount_paid DECIMAL,
  due_date DATE,
  paid_date DATE,
  status ENUM('paid','partial','overdue')
)

-- Risk Scores
risk_scores (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  score FLOAT,
  risk_level ENUM('high','medium','low'),
  contributing_factors JSONB,
  model_version VARCHAR,
  calculated_at TIMESTAMP,
  is_overridden BOOLEAN,
  override_reason TEXT
)

-- Optimise historical risk trend queries per student
CREATE INDEX idx_risk_scores_student_date ON risk_scores(student_id, calculated_at);

-- Alerts
alerts (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  alert_type VARCHAR,
  message TEXT,
  severity ENUM('critical','warning','info'),
  is_read BOOLEAN,
  created_at TIMESTAMP
)

-- Counselling Logs
counselling_sessions (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  counsellor_id UUID REFERENCES users,
  session_date DATE,
  notes TEXT,
  outcome VARCHAR,
  follow_up_date DATE
)

-- AI Chatbot History (per user session, TTL managed via Redis for active sessions)
chatbot_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  session_id VARCHAR,              -- groups a conversation thread
  role ENUM('user','assistant'),
  content TEXT,
  context_student_id UUID,         -- nullable — student context when queried
  created_at TIMESTAMP
)
```

---

## 13. Environment Configuration

### Root `.env` (Shared)
```env
# Shared across services
POSTGRES_DB=dropout_db
POSTGRES_USER=dropout_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio_access_key
MINIO_SECRET_KEY=minio_secret_key
MINIO_BUCKET=dropout-files
```

### `frontend/.env.local`
```env
# Next.js Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="EduPulse AI"
NEXT_PUBLIC_APP_VERSION=1.0.0

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_32chars

# Feature Flags
NEXT_PUBLIC_CHATBOT_ENABLED=true
NEXT_PUBLIC_LANDING_ENABLED=true

# Optional: OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### `backend/.env`
```env
# FastAPI Backend
APP_ENV=development
SECRET_KEY=your_jwt_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

DATABASE_URL=postgresql+asyncpg://dropout_user:your_secure_password@postgres:5432/dropout_db
REDIS_URL=redis://redis:6379/0

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio_access_key
MINIO_SECRET_KEY=minio_secret_key
MINIO_BUCKET=dropout-files

# ML Service URL
ML_SERVICE_URL=http://ml_service:8001

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@edupulse.ai

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+91XXXXXXXXXX

# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Redis Cache TTL (seconds)
RISK_SCORE_CACHE_TTL=3600         # 1 hour — invalidated on data ingestion
AGGREGATION_CACHE_TTL=900         # 15 minutes — dashboard summaries

# AI Chatbot (LLM)
LLM_PROVIDER=openai               # openai | ollama
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://ollama:11434  # used only if LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3

# Notification Schedule (cron)
WEEKLY_DIGEST_CRON=0 8 * * MON
RISK_CALC_CRON=0 1 * * *
```

### `ml_service/.env`
```env
# ML Microservice
APP_ENV=development
ML_SERVICE_PORT=8001

DATABASE_URL=postgresql+psycopg2://dropout_user:your_secure_password@postgres:5432/dropout_db

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio_access_key
MINIO_SECRET_KEY=minio_secret_key
MINIO_BUCKET=dropout-files
MODEL_BUCKET=ml-models

# Model Config
MODEL_VERSION=v1.0.0
RISK_HIGH_THRESHOLD=70
RISK_MEDIUM_THRESHOLD=40
RETRAIN_MIN_SAMPLES=500

# SHAP Config
SHAP_MAX_DISPLAY=3
```


---

## 14. Setup & Installation

### Prerequisites

- Docker Desktop 4.x+
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- Git

### Quick Start with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dropout_prediction.git
cd dropout_prediction

# 2. Copy and configure environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
cp ml_service/.env.example ml_service/.env

# 3. Edit each .env file with your credentials
# (See Section 13 for all required variables)

# 4. Build and start all services
docker-compose up --build

# 5. Run database migrations
docker-compose exec backend alembic upgrade head

# 6. Seed initial admin user
docker-compose exec backend python -m app.utils.seed_admin

# 7. Access the application
# Frontend:   http://localhost:3000
# Backend API: http://localhost:8000/docs
# ML Service: http://localhost:8001/docs
# MinIO Console: http://localhost:9001
```

### Local Development Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
# No TypeScript compile step — plain JS runs directly
```

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

#### ML Service
```bash
cd ml_service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

#### Celery Worker (separate terminal)
```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 15. Deployment Strategy

### Docker Compose Services

```yaml
services:
  postgres:       # PostgreSQL 15
  redis:          # Redis 7 (cache TTL + task queue)
  minio:          # MinIO (API :9000, Console :9001)
  backend:        # FastAPI (port 8000) — API + chatbot SSE
  ml_service:     # ML FastAPI (port 8001)
  frontend:       # Next.js (port 3000)
  celery_worker:  # SHAP recalculation + notification dispatch
  celery_beat:    # Scheduled digest + nightly risk recalc
  nginx:          # Reverse proxy (port 80 / 443)
  ollama:         # (optional) Self-hosted LLM for chatbot
```

### Production Recommendations

- Use managed PostgreSQL (e.g., RDS or Supabase) over containerised DB.
- Enable SSL/TLS via Nginx with Let's Encrypt.
- Store model artifacts in persistent MinIO volume or cloud storage.
- Set up log aggregation (Loki + Grafana or ELK).
- Enable database backups via cron or managed service.

### CI/CD Pipeline (GitHub Actions)

```
Push to main
    │
    ▼
Lint & Code Formatting (frontend & backend)
    │
    ▼
Unit Tests (pytest + jest)
    │
    ▼
Build Docker Images
    │
    ▼
Push to Container Registry
    │
    ▼
Deploy to staging → smoke test → deploy to production
```

---

## 16. Performance Optimisation Architecture

### Redis Caching Strategy

| Cache Key Pattern | TTL | Invalidated When |
|-------------------|-----|-----------------|
| `risk:student:{id}` | 1 hour | New data ingested for that student |
| `risk:cohort:{course_id}:{semester}` | 15 min | Any student in cohort re-scored |
| `dashboard:summary:{org_id}` | 15 min | Any risk score update |
| `chatbot:session:{user_id}:{session_id}` | 30 min | User clears history |

### Asynchronous Inference & Background Jobs

Heavy operations are **never** on the main request thread:

| Task | Worker | Trigger |
|------|--------|---------|
| Batch SHAP recalculation | Celery worker | Data ingestion complete |
| Nightly full-cohort risk rescore | Celery Beat | `0 1 * * *` |
| Weekly mentor digest emails | Celery Beat | `0 8 * * MON` |
| Immediate high-risk alert dispatch | Celery worker | Score crosses threshold |

### Frontend Performance

| Technique | Applied To |
|-----------|-----------|
| Next.js Server Components (RSC) | Dashboard summary panels, static student lists |
| React Query cache (`staleTime: 5min`) | All data-fetching hooks — prevents redundant requests |
| Dynamic imports (`next/dynamic`) | Framer Motion, Recharts, ChatbotWidget — not in initial bundle |
| Lazy loading | All chart components below the fold |
| Image optimisation | `next/image` for all partner logos and avatars |
| `backdrop-blur` via CSS | Modals/drawers — GPU-composited, no JS cost |

### Database Query Optimisation

| Index | Purpose |
|-------|---------|
| `idx_risk_scores_student_date` ON `risk_scores(student_id, calculated_at)` | Historical trend queries per student |
| `idx_students_course_semester` ON `students(course_id, current_semester)` | Cohort filtering and department comparisons |
| `idx_alerts_student_unread` ON `alerts(student_id, is_read)` | Unread alert badge counts |

All paginated list endpoints (`/api/v1/students`, `/api/v1/alerts`) use **cursor-based pagination** to avoid `OFFSET` performance degradation at scale.

---

## 17. Expected Outcomes

### Quantitative Targets

| Metric | Target |
|--------|--------|
| Early detection lead time | 4–6 weeks before academic failure |
| ML model accuracy | ≥ 85% (F1 score on at-risk class) |
| False positive rate | < 15% |
| Dashboard load time | < 2 seconds (P95) |
| Notification delivery rate | > 98% |
| Data ingestion processing time | < 60 seconds per 1000 students |

### Qualitative Outcomes

- **Educators gain confidence** through transparent, explainable risk scores.
- **Counsellors focus effort** on the highest-risk students first.
- **Guardians receive timely updates**, enabling home support.
- **Administrators** get institution-wide dropout trend reports for policy decisions.
- **Institutions worldwide** can track program effectiveness and retention trends across all enrolled cohorts.

### Impact Projection

| Year | Expected Dropout Reduction |
|------|---------------------------|
| Year 1 | 10–15% reduction |
| Year 2 | 20–25% reduction (with full counsellor adoption) |
| Year 3 | 30%+ reduction (with historical model training data) |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request.
5. Ensure all CI checks pass before requesting review.

---

## License

This project is developed as an **open-source EdTech SaaS platform** — built to serve universities, colleges, and technical institutes globally.  
All rights reserved. Not for commercial distribution without permission.

---

## Contact

**Product:** EduPulse AI  
**Website:** https://edupulse.ai  
**Category:** EdTech SaaS — Dropout Prediction & Student Success  
**Theme:** Smart Automation & Predictive Analytics  

---

*Built with the spirit of SIH: Take what exists, integrate it cleverly, and create meaningful impact.*
