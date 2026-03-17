# Workspace

## Overview

AI Focus Tracker — a production-ready web application that tracks user focus using webcam, ML algorithms, DSA logic, and IoT integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS v4, Recharts, Framer Motion, react-webcam, Lucide icons

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/             # Express API server
│   │   └── src/routes/
│   │       ├── sessions.ts     # Session CRUD
│   │       ├── focus.ts        # Focus data recording
│   │       ├── analytics.ts    # Daily + trend analytics
│   │       └── iot.ts          # IoT device alert endpoint
│   └── focus-tracker/          # React frontend (dark glassmorphism)
│       └── src/
│           ├── pages/          # Home, LiveTracker, Dashboard, History, Settings
│           ├── hooks/          # useFocusML (DSA: sliding window, queue), useSettings
│           └── components/     # Layout, GlassCard
├── lib/
│   ├── api-spec/               # OpenAPI 3.1 spec
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/
│       └── src/schema/
│           ├── sessions.ts     # Sessions table
│           ├── focus_data.ts   # Focus data points table
│           └── iot_alerts.ts   # IoT alerts log table
└── scripts/
```

## Features

1. **Live Focus Tracker** — Webcam feed + simulated ML metrics (EAR, gaze, blink, head pose)
2. **Focus Score** — Sliding window smoothing (last 30 frames), Queue for frame processing
3. **Focus Categories** — HIGH_FOCUS, MEDIUM_FOCUS, LOW_FOCUS, DISTRACTED
4. **Dashboard** — Daily analytics charts, most/least focused hour
5. **Session History** — Past sessions with detail view
6. **Alerts** — On-screen + sound alerts when distracted
7. **IoT API** — `POST /api/iot/focus-alert` for ESP32/Raspberry Pi LED/buzzer
8. **Settings** — Sound alerts, IoT device ID, distraction threshold

## API Endpoints

- `GET /api/sessions` — list sessions
- `POST /api/sessions` — create session
- `GET /api/sessions/:id` — session detail
- `PATCH /api/sessions/:id` — end session
- `POST /api/focus/record` — record focus data point
- `GET /api/analytics/daily?date=YYYY-MM-DD` — daily analytics
- `GET /api/analytics/trends?days=7` — focus trends
- `POST /api/iot/focus-alert` — send IoT alert
- `GET /api/iot/status` — IoT device status

## IoT Integration

POST /api/iot/focus-alert with body:
```json
{
  "alertType": "DISTRACTION",
  "sessionId": 1,
  "focusScore": 25.5,
  "deviceId": "esp32-001",
  "message": "User is distracted"
}
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Root commands:
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — push schema to PostgreSQL
