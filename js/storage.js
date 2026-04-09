window.VibeTracker = window.VibeTracker || {};

const STORAGE_KEY = "vibe-tracker-data";

function createDefaultData() {
  return {
    entries: [],
    streaks: {
      current: 0,
      longest: 0,
    },
  };
}

function normalizeEntry(entry) {
  return {
    id: String(entry.id),
    date: String(entry.date),
    vibe: Number(entry.vibe),
    productivity: Number(entry.productivity),
    note: typeof entry.note === "string" ? entry.note.slice(0, 280) : "",
    createdAt: String(entry.createdAt),
  };
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

function sanitizeData(rawData) {
  if (!rawData || typeof rawData !== "object") {
    return createDefaultData();
  }

  const entries = Array.isArray(rawData.entries)
    ? rawData.entries
        .filter((entry) => entry && typeof entry === "object")
        .map(normalizeEntry)
        .filter((entry) => {
          const validDate = /^\d{4}-\d{2}-\d{2}$/.test(entry.date);
          const validTimestamp = !Number.isNaN(new Date(entry.createdAt).getTime());
          return (
            validDate &&
            validTimestamp &&
            entry.vibe >= 1 &&
            entry.vibe <= 5 &&
            entry.productivity >= 1 &&
            entry.productivity <= 5
          );
        })
    : [];

  const streaks = rawData.streaks && typeof rawData.streaks === "object"
    ? {
        current: Number(rawData.streaks.current) || 0,
        longest: Number(rawData.streaks.longest) || 0,
      }
    : { current: 0, longest: 0 };

  return {
    entries: sortEntries(entries),
    streaks,
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultData();
    }

    return sanitizeData(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load Vibe Tracker data.", error);
    return createDefaultData();
  }
}

function saveData(data) {
  const sanitized = sanitizeData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  return sanitized;
}

function saveEntries(entries, streaks) {
  return saveData({ entries, streaks });
}

function exportData(data) {
  const payload = JSON.stringify(sanitizeData(data), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `vibe-tracker-backup-${stamp}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function importDataFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(sanitizeData(parsed));
      } catch (error) {
        reject(new Error("The selected file is not valid JSON."));
      }
    };

    reader.onerror = () => {
      reject(new Error("The selected file could not be read."));
    };

    reader.readAsText(file);
  });
}

function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}

window.VibeTracker.storage = {
  loadData,
  saveData,
  saveEntries,
  exportData,
  importDataFromFile,
  clearData,
};
