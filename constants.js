// ── OSE Turn Tracker constants ────────────────────────────────────────────

// One dungeon day = 6 hours = 36 turns of 10 minutes each
export const TURNS_PER_DAY = 36;
export const TURNS_PER_HOUR = 6;

// Namespaced key for OBR room metadata (must be unique to this extension)
export const METADATA_KEY = "com.ose-dungeon-tracker/state";

// Light source durations in turns
export const TORCH_DURATION = 6;    // 1 hour
export const LANTERN_DURATION = 24; // 4 hours

// Within each 6-turn hour block (0-indexed positions):
//   pos 1, 3 → wandering monster check (every 2nd turn)
//   pos 5    → wandering monster check + party must rest
export function getTurnMeta(globalIdx) {
  const pos = globalIdx % TURNS_PER_HOUR; // 0-5
  return {
    isWander: pos === 1 || pos === 3 || pos === 5,
    isRest:   pos === 5,
    hour:     Math.floor(globalIdx / TURNS_PER_HOUR), // 0-5
    posInHour: pos,                                    // 0-5
  };
}

// Initial tracker state
export function makeInitialState() {
  return {
    currentTurn: -1,          // -1 = not started
    events: {},               // { [turnIdx]: string[] }
    torchLitAt: null,         // global turn index or null
    lanternLitAt: null,       // global turn index or null
  };
}
