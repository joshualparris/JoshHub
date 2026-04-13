const SAVE_KEY = "chronicles_sword_coast_save";
export const SAVE_VERSION = 1;

export function hasSave() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

export function saveGame(state) {
  const payload = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.version !== SAVE_VERSION) {
      return { incompatible: true, foundVersion: parsed.version ?? null };
    }

    if (!parsed.state || typeof parsed.state !== "object") {
      return null;
    }

    return { incompatible: false, state: parsed.state, savedAt: parsed.savedAt ?? null };
  } catch (_error) {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
