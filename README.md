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

## Android app (Capacitor)

The native Android wrapper lives in `android/` and bundles the built web app
(`dist/`) — same code, IndexedDB persists in the app sandbox. Export uses a
native share sheet on device (browser download on web).

### The PWA still works

Capacitor is purely additive — it wraps the existing `dist/` build, it does not
replace it. The web app and its PWA are unchanged:

- `vite-plugin-pwa` still emits the service worker + manifest on `npm run build`;
  `npm run dev` and browser install behave exactly as before.
- Native-only code paths are guarded by `Capacitor.isNativePlatform()`
  (`src/hooks/useImportExport.ts`), so the browser keeps the `<a download>`
  export and never calls native plugins.
- Same routes, same IndexedDB data layer in both targets.

So you can ship the web/PWA and the Android APK from one codebase.

### Where data lives

- **Web / PWA**: IndexedDB in the browser profile.
- **Android**: IndexedDB inside the app's private sandbox
  (`/data/data/com.mtracker.app/app_webview/Default/IndexedDB/`). Survives
  restarts and app updates; wiped on uninstall or "Clear data". Local only — no
  cloud. Use Settings → Export for backups (writes to app cache, then shares).

```bash
npm run cap:sync     # build web + copy into android/
npm run android:open # open in Android Studio
```

Regenerate icons/splash after changing `assets/icon.png`:

```bash
npx capacitor-assets generate --android \
  --iconBackgroundColor '#09090b' --splashBackgroundColor '#09090b'
```

### Build a personal APK (sideload)

Requires the Android SDK — install **Android Studio** and finish its first-run
wizard (installs the SDK to `~/Android/Sdk`). The CLI build is then:

```bash
npm run cap:sync
cd android && ANDROID_HOME=~/Android/Sdk ./gradlew :app:assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Notes:
- `android/local.properties` holds `sdk.dir` (gitignored).
- `android/gradle.properties` pins `org.gradle.java.home` to Android Studio's
  bundled JBR, because the system `java-21` is a **JRE without `javac`**. Adjust
  the path if Studio isn't the snap install.
- Install on a phone: `~/Android/Sdk/platform-tools/adb install app-debug.apk`
  (USB debugging on), or copy the APK over and allow "install unknown apps".

App id: `com.mtracker.app`.

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
