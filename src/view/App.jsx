import React, { useCallback } from "react";
import { useTracker } from "../lib/useTracker.js";
import { TurnRow } from "./TurnRow.jsx";
import {
  TURNS_PER_DAY,
  TURNS_PER_HOUR,
  makeInitialState,
} from "../lib/constants.js";

const ALL_TURNS = Array.from({ length: TURNS_PER_DAY }, (_, i) => i);
const HOURS     = Array.from({ length: TURNS_PER_DAY / TURNS_PER_HOUR }, (_, i) => i);

export default function App() {
  const { state, setState, ready, isGM } = useTracker();

  // ── Navigation ───────────────────────────────────────────────────────────
  const advance = useCallback(() =>
    setState((s) => ({ ...s, currentTurn: Math.min(s.currentTurn + 1, TURNS_PER_DAY - 1) })),
    [setState]);

  const retreat = useCallback(() =>
    setState((s) => ({ ...s, currentTurn: Math.max(s.currentTurn - 1, -1) })),
    [setState]);

  const setTurn = useCallback((idx) =>
    setState((s) => ({ ...s, currentTurn: idx })),
    [setState]);

  // ── Light sources ────────────────────────────────────────────────────────
  const toggleTorch = useCallback(() =>
    setState((s) => ({
      ...s,
      torchLitAt: s.torchLitAt === null ? Math.max(s.currentTurn, 0) : null,
    })), [setState]);

  const toggleLantern = useCallback(() =>
    setState((s) => ({
      ...s,
      lanternLitAt: s.lanternLitAt === null ? Math.max(s.currentTurn, 0) : null,
    })), [setState]);

  // ── Events ───────────────────────────────────────────────────────────────
  const addEvent = useCallback((idx, label) =>
    setState((s) => ({
      ...s,
      events: {
        ...s.events,
        [idx]: [...(s.events[idx] || []), label],
      },
    })), [setState]);

  const removeEvent = useCallback((idx, evIdx) =>
    setState((s) => {
      const updated = (s.events[idx] || []).filter((_, i) => i !== evIdx);
      const events  = { ...s.events };
      if (updated.length === 0) delete events[idx];
      else events[idx] = updated;
      return { ...s, events };
    }), [setState]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => setState(makeInitialState()), [setState]);

  // ── Status label ─────────────────────────────────────────────────────────
  const turnLabel = state.currentTurn < 0
    ? "Not started"
    : `Turn ${state.currentTurn + 1} / ${TURNS_PER_DAY}`;

  const hourLabel = state.currentTurn < 0
    ? ""
    : `Hour ${Math.floor(state.currentTurn / TURNS_PER_HOUR) + 1}`;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="loading">
        <div className="loading__flame">🕯</div>
        <div>Lighting the lantern…</div>
      </div>
    );
  }

  return (
    <div className="app">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__titles">
          <span className="app-header__title">Dungeon Tracker</span>
          <span className="app-header__sub">Old-School Essentials</span>
        </div>
        <div className="app-header__status">
          <span className="status-turn">{turnLabel}</span>
          {hourLabel && <span className="status-hour">{hourLabel}</span>}
        </div>
      </header>

      {/* ── GM Toolbar ─────────────────────────────────────────────────── */}
      {isGM && (
        <div className="toolbar">
          <button className="tb-btn tb-btn--ghost" onClick={retreat}
            disabled={state.currentTurn < 0} title="Previous turn">◀</button>
          <button className="tb-btn tb-btn--primary" onClick={advance}
            disabled={state.currentTurn >= TURNS_PER_DAY - 1}>
            Next Turn ▶
          </button>
          <div className="toolbar__sep" />
          <button
            className={`tb-btn tb-btn--light ${state.torchLitAt !== null ? "is-lit" : ""}`}
            onClick={toggleTorch}
            title={state.torchLitAt !== null ? "Extinguish torch" : "Light torch (6t)"}
          >🕯 Torch</button>
          <button
            className={`tb-btn tb-btn--light ${state.lanternLitAt !== null ? "is-lit" : ""}`}
            onClick={toggleLantern}
            title={state.lanternLitAt !== null ? "Extinguish lantern" : "Light lantern (24t)"}
          >🏮 Lantern</button>
          <div className="toolbar__sep" />
          <button className="tb-btn tb-btn--danger" onClick={reset}>↺ Reset</button>
        </div>
      )}

      {/* ── Turn List ──────────────────────────────────────────────────── */}
      <div className="turn-list">
        {HOURS.map((h) => {
          const start = h * TURNS_PER_HOUR;
          return (
            <div key={h} className="hour-group">
              <div className="hour-group__label">Hour {h + 1}</div>
              {ALL_TURNS.slice(start, start + TURNS_PER_HOUR).map((idx) => (
                <TurnRow
                  key={idx}
                  idx={idx}
                  currentTurn={state.currentTurn}
                  events={state.events[idx] || []}
                  torchLitAt={state.torchLitAt}
                  lanternLitAt={state.lanternLitAt}
                  isGM={isGM}
                  onSetCurrent={setTurn}
                  onAddEvent={addEvent}
                  onRemoveEvent={removeEvent}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* ── Footer legend ──────────────────────────────────────────────── */}
      <footer className="app-footer">
        {!isGM && <span className="view-only">Viewing only</span>}
        <span className="legend">
          <span className="badge badge--w">W</span> Wander &nbsp;
          <span className="badge badge--r">R</span> Rest &nbsp;
          <span className="badge badge--t">T</span> Torch &nbsp;
          <span className="badge badge--l">L</span> Lantern
        </span>
      </footer>

    </div>
  );
}
