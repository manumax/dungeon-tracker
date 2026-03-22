import React, { useState, useRef, useCallback, useEffect } from "react";
import { getTurnMeta } from "../lib/constants.js";

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

  const commitEvent = useCallback(() => {
    const label = draft.trim();
    if (label) onAddEvent(idx, label);
    setDraft("");
    setEditing(false);
  }, [draft, idx, onAddEvent]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter")  commitEvent();
    if (e.key === "Escape") { setDraft(""); setEditing(false); }
  }, [commitEvent]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const startEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const turnNum = idx + 1;

  return (
    <div
      className={[
        "turn-row",
        isCurrent  ? "is-current" : "",
        isPast     ? "is-past"    : "",
        isRest     ? "is-rest"    : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Left: number + pip */}
      <div className="turn-row__gutter">
        <span className="turn-row__num">{turnNum}</span>
        {isCurrent && <span className="turn-row__pip" />}
      </div>

      {/* Centre: flags + events */}
      <div className="turn-row__body">
        {(isWander || isRest) && (
          <div className="turn-row__flags">
            {isWander && (
              <span className="badge badge--w" title="Roll wandering monsters">W</span>
            )}
            {isRest && (
              <span className="badge badge--r" title="Party must rest 1 turn">R</span>
            )}
          </div>
        )}

        {events.length > 0 && (
          <div className="turn-row__events">
            {events.map((ev) => (
              <span key={ev.id} className="event-chip">
                <span className="event-chip__text">{ev.label}</span>
                {isGM && (
                  <button
                    className="event-chip__remove"
                    onClick={() => onRemoveEvent(idx, ev.id)}
                    aria-label={`Remove event: ${ev.label}`}
                  >×</button>
                )}
              </span>
            ))}
          </div>
        )}

        {editing && (
          <input
            ref={inputRef}
            className="turn-row__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEvent}
            placeholder="Event name…"
            aria-label="Event name"
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
              aria-label={isPast ? "Return to this turn" : "Jump to this turn"}
            >
              {isPast ? "↩" : "→"}
            </button>
          )}
          {!isPast && (
            <button
              className="icon-btn"
              onClick={startEditing}
              aria-label="Add event"
            >+</button>
          )}
        </div>
      )}
    </div>
  );
}
