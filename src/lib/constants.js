// ── OSE Turn Tracker constants ────────────────────────────────────────────

export const TURNS_PER_DAY   = 36;
export const TURNS_PER_HOUR  = 6;
export const HOURS_PER_DAY   = TURNS_PER_DAY / TURNS_PER_HOUR;

export const METADATA_KEY    = "com.ose-dungeon-tracker/state";
export const STATE_VERSION    = 1;

export function getTurnMeta(globalIdx) {
  const pos = globalIdx % TURNS_PER_HOUR;
  return {
    isWander:   pos === 1 || pos === 3 || pos === 5,
    isRest:     pos === 5,
    hour:       Math.floor(globalIdx / TURNS_PER_HOUR),
    posInHour:  pos,
  };
}

export function makeInitialState() {
  return {
    v: STATE_VERSION,
    currentTurn: -1,
    events: {},
  };
}

export function migrateState(state) {
  if (!state || state.v === undefined) {
    return { ...makeInitialState(), ...state };
  }
  return state;
}
