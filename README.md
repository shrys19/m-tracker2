# m-tracker

A private, local-only activity tracker (React + TypeScript + Vite + Tailwind + Dexie).
All data lives in IndexedDB on the device. Installable as a PWA.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run lint
```

## Architecture

```
src/
├── App.tsx                  Shell: page switching + modal orchestration
├── main.tsx                 React entry point
├── types.ts                 Shared types (Tab union)
│
├── lib/                     Pure functions, no React, easy to test
│   ├── date.ts              Date/duration formatters
│   ├── sessions.ts          Typed accessors for Session entries
│   └── stats.ts             Streak + insights computations
│
├── hooks/                   State + side-effect logic
│   ├── useSessions.ts       Owns sessions list + all CRUD
│   ├── useSettings.ts       PIN lock state
│   ├── useClock.ts          Live-updating timer source
│   └── useImportExport.ts   JSON file import/export
│
├── db/database.ts           Dexie schema (Session table)
├── utils/                   Small infra: settings persistence, PIN hashing, demo data
├── constants/tags.ts        Fixed tag vocabulary
│
├── components/
│   ├── primitives/          Reusable building blocks
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── TagPicker.tsx
│   │   └── TagBadges.tsx
│   │
│   ├── modals/              App-level dialogs (parent conditionally mounts each)
│   │   ├── BestStreakModal.tsx
│   │   ├── SessionCompleteModal.tsx
│   │   ├── PastEventModal.tsx
│   │   ├── PastSessionModal.tsx
│   │   └── PinSetupModal.tsx
│   │
│   ├── ActiveSessionCard.tsx        Live timer + "End Session" button
│   ├── ActivityTimeline.tsx         List container
│   ├── ActivityTimelineItem.tsx     One row, with inline edit
│   ├── FloatingActionButton.tsx     "+" FAB + its action sheet
│   ├── BottomNavigation.tsx         Top tab bar
│   ├── ConfirmModal.tsx             Generic "are you sure?"
│   ├── PinLock.tsx                  PIN entry screen
│   └── SplashScreen.tsx             Initial loading state
│
└── pages/
    ├── Dashboard.tsx        Stats grid + active session + activity feed
    ├── Calendar.tsx         Month heatmap + selected-day events
    ├── Insights.tsx         All-time stats
    └── Settings.tsx         PIN, import/export, demo data, reset
```

## Conventions

- **Modal lifecycle**: parents conditionally mount modals (`{open && <Modal />}`). No `open` prop. Each open = fresh mount = fresh state. No reset-on-open effects.
- **Date keys**: local-time `YYYY-MM-DD` strings, produced by `lib/date.ts`. Never construct these inline.
- **Datetime-local inputs**: use `datetimeLocalNow()` from `lib/date.ts`. Do **not** use `new Date().toISOString().slice(0, 16)` — that returns UTC and displays wrong outside UTC.
- **Domain logic**: lives in `lib/`. Components only render. Hooks only orchestrate state and side effects.
- **Destructive actions**: gated by the in-app `ConfirmModal`, not `window.confirm`.

## Adding a tag

Edit `src/constants/tags.ts`. The `TagPicker` and existing entries pick up the change automatically.

## Data shape

A single `Session` is either a `quick` event (instantaneous, has `timestamp`) or a `session` (has `startTime` and optionally `endTime`). Both may carry a `description` and `tags`. See `src/db/database.ts`.
