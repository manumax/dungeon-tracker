import React, { useState, useRef } from "react";
import { getTurnMeta } from "../lib/constants.js";

/**
 * TurnRow — one row in the compact list view.
 *
 * Props:
 *   idx           — 0-based global turn index
 *   currentTurn   — current active turn index
 *   events        — string[] of custom events on this turn
 *   isGM
 *   onSetCurrent  — (idx) set this turn as current
 *   onAddEvent    — (idx, label)
 *   onRemoveEvent — (idx, eventIdx)
 */
export function TurnRow({
  idx,
  currentTurn,
  events,
  isGM,
  onSetCurrent,
  onAddEvent,
  onRemoveEvent,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");
  const inputRef              = useRef(null);

  const { isWander, isRest } = getTurnMeta(idx);

  const isCurrent = idx === currentTurn;
  const isPast    = idx < currentTurn;

  function commitEvent() {
    const label = draft.trim();
    if (label) onAddEvent(idx, label);
    setDraft("");
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter")  commitEvent();
    if (e.key === "Escape") { setDraft(""); setEditing(false); }
  }

  function startEditing() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const turnNum = idx + 1;

  return (
    <div
      className={[
        "turn-row",
        isCurrent ? "is-current" : "",
        isPast    ? "is-past"    : "",
        isRest    ? "is-rest"    : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Left: number + pip */}
      <div className="turn-row__gutter">
        <span className="turn-row__num">{turnNum}</span>
        {isCurrent && <span className="turn-row__pip" />}
      </div>

      {/* Centre: flags + events */}
      <div className="turn-row__body">
        <div className="turn-row__flags">
          {isWander && (
            <img 
              className="badge badge--dragon" 
              src="https://as1.ftcdn.net/v2/jpg/18/50/99/04/1000_F_1850990434_ACbKBvAkK08isUpVFoVrJBhzvwF0elcK.jpg" 
              alt="Wandering Monster"
              title="Roll wandering monsters"
            />
          )}
          {isRest && (
            <span className="badge badge--r" title="Party must rest 1 turn">R</span>
          )}
        </div>

        {/* Custom events */}
        {events.length > 0 && (
          <div className="turn-row__events">
            {events.map((ev, i) => (
              <span key={i} className="event-chip">
                {ev}
                {isGM && (
                  <button
                    className="event-chip__remove"
                    onClick={() => onRemoveEvent(idx, i)}
                    title="Remove"
                  >×</button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Inline event input */}
        {editing && (
          <input
            ref={inputRef}
            className="turn-row__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEvent}
            placeholder="Event name…"
          />
        )}
      </div>

      {/* Right: GM actions */}
      {isGM && (
        <div className="turn-row__actions">
          {!isCurrent && (
            <button
              className="icon-btn"
              onClick={() => onSetCurrent(idx)}
              title={isPast ? "Return to this turn" : "Jump to this turn"}
            >
              {isPast ? "↩" : "→"}
            </button>
          )}
          {!isPast && (
            <button
              className="icon-btn"
              onClick={startEditing}
              title="Add event"
            >+</button>
          )}
        </div>
      )}
    </div>
  );
}
