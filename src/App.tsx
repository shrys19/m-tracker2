import { useState } from "react";

import BottomNavigation from "./components/BottomNavigation";
import ConfirmModal from "./components/ConfirmModal";
import FloatingActionButton from "./components/FloatingActionButton";
import PinLock from "./components/PinLock";
import SplashScreen from "./components/SplashScreen";

import BestStreakModal from "./components/modals/BestStreakModal";
import PastEventModal from "./components/modals/PastEventModal";
import PastSessionModal from "./components/modals/PastSessionModal";
import PinSetupModal from "./components/modals/PinSetupModal";
import SessionCompleteModal from "./components/modals/SessionCompleteModal";

import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";

import { useImportExport } from "./hooks/useImportExport";
import { useSessions } from "./hooks/useSessions";
import { useSettings } from "./hooks/useSettings";
import type { Tab } from "./types";

/**
 * App.tsx is the thin shell:
 *   1. Wires together the data + settings hooks.
 *   2. Switches between pages via a tab union.
 *   3. Orchestrates the app-level modals — owns their open/close state but
 *      delegates their UI and form state to modal components.
 *
 * Anything domain-y (streaks, insights, CRUD, formatters) lives elsewhere.
 */
export default function App() {
  // ---------- Data + settings ----------
  const data = useSessions();
  const settingsState = useSettings();
  const { exportData, importData } = useImportExport({
    sessions: data.sessions,
    importAll: data.importAll,
  });

  // ---------- UI state ----------
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // Modal visibility flags.
  const [showPastEvent, setShowPastEvent] = useState(false);
  const [showPastSession, setShowPastSession] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  // For the SessionComplete modal: which session are we annotating?
  const [completedSessionId, setCompletedSessionId] = useState<number | null>(null);

  // For the BestStreak modal: which dates to show.
  const [bestStreakDates, setBestStreakDates] = useState<string[]>([]);

  // Generic "are you sure?" confirmation. Filled with title/message/onConfirm
  // whenever we need to gate a destructive action.
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // ---------- Boot states ----------
  if (data.loading) return <SplashScreen />;

  if (settingsState.settings.pinEnabled && !settingsState.unlocked) {
    return (
      <PinLock
        correctHash={settingsState.settings.pinHash}
        onUnlock={settingsState.unlock}
      />
    );
  }

  // ---------- Handlers ----------
  async function handleEndSession() {
    const id = await data.endSession();
    if (id != null) {
      setCompletedSessionId(id);
      setShowSessionComplete(true);
    }
  }

  async function handleSessionCompleteSave(description: string, tags: string[]) {
    if (completedSessionId != null) {
      await data.updateEntry(completedSessionId, description, tags);
    }
    setCompletedSessionId(null);
    setShowSessionComplete(false);
  }

  function handleSessionCompleteSkip() {
    setCompletedSessionId(null);
    setShowSessionComplete(false);
  }

  function handleDelete(id: number) {
    setConfirm({
      title: "Delete entry?",
      message: "This entry will be permanently removed.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        await data.deleteEntry(id);
        setConfirm(null);
      },
    });
  }

  function handleReset() {
    setConfirm({
      title: "Delete all activity?",
      message:
        "Every event and session on this device will be permanently erased. This cannot be undone.",
      confirmLabel: "Delete Everything",
      onConfirm: async () => {
        await data.clearAll();
        setConfirm(null);
      },
    });
  }

  function handleEnablePinRequested() {
    setShowPinSetup(true);
  }

  async function handlePinSetupSave(pin: string) {
    await settingsState.enablePin(pin);
    setShowPinSetup(false);
    alert("PIN enabled.");
  }

  function handleDisablePinRequested() {
    setConfirm({
      title: "Disable PIN lock?",
      message: "The app will no longer require a PIN on launch.",
      confirmLabel: "Disable PIN",
      onConfirm: () => {
        settingsState.disablePin();
        setConfirm(null);
        alert("PIN disabled.");
      },
    });
  }

  // ---------- Page switcher ----------
  function renderPage() {
    switch (activeTab) {
      case "calendar":
        return <Calendar sessions={data.sessions} />;
      case "insights":
        return <Insights sessions={data.sessions} />;
      case "settings":
        return (
          <Settings
            pinEnabled={settingsState.settings.pinEnabled}
            onEnablePin={handleEnablePinRequested}
            onDisablePin={handleDisablePinRequested}
            onExport={exportData}
            onImport={importData}
            onSeedData={data.seedDemo}
            onReset={handleReset}
          />
        );
      case "dashboard":
      default:
        return (
          <Dashboard
            sessions={data.sessions}
            activeSession={data.activeSession}
            totalEvents={data.totalEvents}
            avgDurationMs={data.avgDurationMs}
            onDeleteEntry={handleDelete}
            onEndSession={handleEndSession}
            onUpdateEntry={data.updateEntry}
            onShowBestStreak={(dates) => setBestStreakDates(dates)}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 safe-top">
      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />

      <div className="mx-auto max-w-md p-6 pb-24">{renderPage()}</div>

      {activeTab === "dashboard" && (
        <FloatingActionButton
          hasActiveSession={!!data.activeSession}
          onLogEvent={data.logQuickEvent}
          onAddPastEvent={() => setShowPastEvent(true)}
          onAddPastSession={() => setShowPastSession(true)}
          onStartSession={data.startSession}
        />
      )}

      {showSessionComplete && (
        <SessionCompleteModal
          onSave={handleSessionCompleteSave}
          onSkip={handleSessionCompleteSkip}
        />
      )}

      {bestStreakDates.length > 0 && (
        <BestStreakModal
          dates={bestStreakDates}
          onClose={() => setBestStreakDates([])}
        />
      )}

      {showPastEvent && (
        <PastEventModal
          onSave={async ({ timestamp, description, tags }) => {
            await data.addPastEvent({ timestamp, description, tags });
            setShowPastEvent(false);
          }}
          onCancel={() => setShowPastEvent(false)}
        />
      )}

      {showPastSession && (
        <PastSessionModal
          onSave={async ({ start, end, description, tags }) => {
            await data.addPastSession({ start, end, description, tags });
            setShowPastSession(false);
          }}
          onCancel={() => setShowPastSession(false)}
        />
      )}

      {showPinSetup && (
        <PinSetupModal
          onSave={handlePinSetupSave}
          onCancel={() => setShowPinSetup(false)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={() => confirm.onConfirm()}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
