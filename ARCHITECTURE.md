# AeroShield — System Architecture

> **A GenAI-powered winter smog intelligence assistant for families and communities.**
> Built with clean, production-grade Node.js + Express (backend) and React 19 + TypeScript (frontend).

---

## Project Structure

```
aeroshield-smog-ai/
├── server/                        # Express REST API backend
│   ├── config/
│   │   ├── constants.js           # All numeric constants (no magic numbers)
│   │   └── env.js                 # Typed environment variable validation
│   ├── controllers/               # MVC Controllers — HTTP layer only
│   │   ├── aqiController.js       # /api/health, /api/cities, /api/aqi
│   │   ├── profileController.js   # /api/profile/analyze
│   │   ├── recommendationsController.js  # /api/recommendations
│   │   ├── chatController.js      # /api/chat
│   │   └── communityController.js # /api/community, /api/community/pledge
│   ├── routes/
│   │   └── api.js                 # Clean route declarations (no inline logic)
│   ├── services/                  # Pure domain business logic
│   │   ├── aqiService.js          # AQI data retrieval (3-tier with LRU cache)
│   │   ├── vulnerabilityService.js # HIVI score calculator
│   │   ├── impactService.js       # PM2.5 exposure math & cigarette equivalence
│   │   ├── geminiService.js       # Gemini API + expert fallback engine
│   │   ├── routineService.js      # 5-phase diurnal routine generator
│   │   └── communityService.js    # Pledge state and collective impact
│   ├── utils/
│   │   ├── asyncHandler.js        # Async controller error propagation wrapper
│   │   ├── errors.js              # Typed error hierarchy (AppError subclasses)
│   │   ├── validators.js          # Pure input validation (no side effects)
│   │   └── logger.js              # Structured leveled logger (ISO timestamps)
│   ├── data/
│   │   └── knowledgeBase.js       # AQI breakpoints, preset cities, IAQ hacks
│   └── index.js                   # App bootstrap, middleware pipeline, graceful shutdown
│
├── client/                        # React 19 + TypeScript + Vite frontend SPA
│   └── src/
│       ├── components/
│       │   ├── ErrorBoundary.tsx   # Class-based React error boundary
│       │   ├── AqiOverview.tsx     # 24h diurnal inversion forecast chart
│       │   ├── HouseholdWizard.tsx # Profile input (HIVI data collection)
│       │   ├── RoutineOptimizer.tsx # 5-phase clean air schedule
│       │   ├── IaqHacksCatalog.tsx # DIY IAQ intervention catalog
│       │   ├── ImpactRadar.tsx     # PM2.5 exposure reduction metrics
│       │   ├── CommunityHub.tsx    # Community pledges & collective impact
│       │   ├── AiCopilotChat.tsx   # GenAI assistant conversation interface
│       │   └── Navbar.tsx          # City selector, tab navigation, a11y toggle
│       ├── services/
│       │   └── api.ts              # Typed fetch client for all API endpoints
│       ├── types.ts                # Shared TypeScript interfaces
│       ├── App.tsx                 # Root component with state orchestration
│       └── main.tsx                # React root with global ErrorBoundary
│
└── tests/                         # Vitest unit + integration tests
    ├── aqiService.test.js
    ├── vulnerabilityService.test.js
    ├── impactService.test.js
    ├── routineService.test.js
    ├── communityService.test.js
    ├── validators.test.js
    ├── errors.test.js
    └── apiRoutes.test.js           # Supertest integration tests
```

---

## Middleware Pipeline

```
Request
  │
  ▼
[1] helmet()           → Security headers (XSS, CSP, clickjacking)
  │
  ▼
[2] compression()      → Gzip response compression (~70% size reduction)
  │
  ▼
[3] cors()             → Cross-origin resource sharing
  │
  ▼
[4] rateLimit()        → 100 req / 15 min per IP (DDoS protection)
  │
  ▼
[5] express.json()     → Body parsing (10 kb ceiling)
  │
  ▼
[6] requestLogger      → ISO-timestamped method/path/status/latency logging
  │
  ▼
[7] apiRoutes          → /api/* → controllers → services → response
  │
  ▼
[8] express.static()   → client/dist (Cache-Control: immutable, 1 year)
  │
  ▼
[9] spaFallback        → index.html for all non-API routes
  │
  ▼
[10] errorHandler      → Typed AppError → structured JSON response
```

---

## AI Response Architecture

```
User Message
      │
      ▼
  chatController
      │
      ├─ Validate message (validateChatMessage)
      │
      ├─ Fetch AQI context (getAqiData — cached)
      │
      └─ getAssistantResponse()
            │
            ├── GEMINI_API_KEY present?
            │       YES → Gemini 2.5 Flash API call
            │               ├── Success → return Gemini reply
            │               └── Failure → fall through to expert engine
            │
            └── Expert Reasoning Engine (autonomous fallback)
                    ├── Keyword route: DIY hacks
                    ├── Keyword route: Pediatric/asthma
                    ├── Keyword route: Ventilation timing
                    ├── Keyword route: Commute/exercise
                    └── Default: General strategic action plan
```

---

## AQI Data Retrieval — 3-Tier Lookup

```
getAqiData(city)
      │
      ├── [Cache] In-memory LRU (TTL: 10 min, max: 50 cities)
      │       HIT  → Return cached result instantly
      │       MISS ↓
      │
      ├── [Tier 1] Preset Cities (knowledgeBase.js)
      │       Known cities (Delhi, Beijing, etc.)
      │       → Calibrated seasonal baseline + diurnal curve
      │
      ├── [Tier 2] Open-Meteo Geocoding + Air Quality API
      │       Any global city via live API
      │       → Cache result → Return
      │
      └── [Tier 3] Algorithmic Model (offline fallback)
              Default winter smog model
              → Return (not cached, retried on next request)
```

---

## Household Vulnerability Index (HIVI)

The HIVI score (0–100) is computed as a weighted sum of risk factors:

| Factor | Weight | Notes |
|--------|--------|-------|
| Baseline | +20 | Every household |
| Infant (<5 yrs) | +18 per child | Underdeveloped alveolar barrier |
| Child (5–12 yrs) | +10 per child | School transit exposure |
| Elderly (>65 yrs) | +15 per member | Cardiovascular sensitivity |
| Diagnosed asthma | +25 | Bronchospasm trigger at PM2.5 > 100 |
| COPD/Heart | +25 | Systemic vascular inflammation |
| Pregnancy | +20 | Ultrafine PM0.1 translocation risk |
| Arterial road (<100m) | +15 | Direct exhaust exposure |
| Ground floor | +10 | Cold-pool smog accumulation |
| Drafty windows | +14 | Stack-effect infiltration |
| No purifier | +12 | Zero filtration |
| HEPA whole-home | -22 | Credit: maximum protection |
| Morning jog habit | +16 | 06:00–09:00 AM inversion peak |
| Unshielded commute | +18 | Two-wheeler/walking during inversion |

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Node.js 20+ (ESM) | Native ES modules, top-level await |
| Framework | Express 4 | Lightweight, battle-tested |
| Security | Helmet 8 | 11 secure HTTP header guards |
| Compression | compression | ~70% bandwidth reduction |
| Rate Limiting | express-rate-limit | DDoS and API abuse protection |
| GenAI | @google/genai 0.2.0 | Gemini 2.5 Flash API |
| Frontend | React 19 + Vite 8 | Concurrent features, fast HMR |
| Styling | TailwindCSS v4 | Utility-first, design tokens |
| Language | TypeScript 7 | End-to-end type safety |
| Testing | Vitest 3 + Supertest | ESM-native, fast, isolation |
| Coverage | Istanbul (via vitest) | Line/function/branch thresholds |

---

## Running Locally

```bash
# 1. Clone
git clone https://github.com/sanskarmaurya952-cloud/aeroshield-smog-ai.git
cd aeroshield-smog-ai

# 2. Install
npm install

# 3. Configure (optional — works without Gemini key)
cp .env.example .env

# 4. Dev mode (server + client hot reload)
npm run dev

# 5. Production build + serve
npm run build
npm start

# 6. Tests
npm test                # 43 tests, 8 test suites
npm run test:coverage   # With Istanbul coverage report
```
