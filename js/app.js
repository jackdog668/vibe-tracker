window.VibeTracker = window.VibeTracker || {};

const { createCheckinController } = window.VibeTracker.checkin;
const { createDashboardController } = window.VibeTracker.dashboard;
const { createHistoryController } = window.VibeTracker.history;
const { clearData, exportData, importDataFromFile, loadData, saveEntries } = window.VibeTracker.storage;
const { calculateStreaks, getMilestoneMessage, getMilestoneTier } = window.VibeTracker.streaks;

let appState = loadData();

const flashMessage = document.querySelector("#flash-message");
const currentStreak = document.querySelector("#current-streak");
const longestStreak = document.querySelector("#longest-streak");
const entryTotal = document.querySelector("#entry-total");
const streakStatusLabel = document.querySelector("#streak-status-label");
const streakMilestone = document.querySelector("#streak-milestone");
const streakFlame = document.querySelector("#streak-flame");
const exportButton = document.querySelector("#export-button");
const importInput = document.querySelector("#import-input");
const clearButton = document.querySelector("#clear-button");

const views = [...document.querySelectorAll(".view")];
const navButtons = [...document.querySelectorAll(".nav-button")];

let flashTimer = null;

function showMessage(message) {
  flashMessage.textContent = message;
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => {
    flashMessage.textContent = "";
  }, 2800);
}

function persistEntries(entries) {
  const streaks = calculateStreaks(entries);
  appState = saveEntries(entries, streaks);
  return appState.entries;
}

function updateSummary() {
  currentStreak.textContent = String(appState.streaks.current);
  longestStreak.textContent = String(appState.streaks.longest);
  entryTotal.textContent = String(appState.entries.length);

  streakStatusLabel.textContent = appState.streaks.current
    ? `${appState.streaks.current}-day streak active`
    : "No streak yet";
  streakMilestone.textContent = getMilestoneMessage(appState.streaks.current);

  streakFlame.className = `ember-orb ember-tier-${getMilestoneTier(appState.streaks.current)}`;
}

const checkinController = createCheckinController({
  onSave(entry) {
    const remainingEntries = appState.entries.filter((existing) => existing.date !== entry.date);
    return persistEntries([entry, ...remainingEntries]);
  },
  showMessage,
  onEntriesChanged() {
    renderAll();
  },
});

const dashboardController = createDashboardController();

const historyController = createHistoryController({
  onDelete(entryId) {
    const nextEntries = appState.entries.filter((entry) => entry.id !== entryId);
    persistEntries(nextEntries);
    renderAll();
  },
  showMessage,
});

function renderAll() {
  updateSummary();
  checkinController.update(appState.entries);
  dashboardController.update(appState.entries);
  historyController.update(appState.entries);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.viewTarget;

    navButtons.forEach((navButton) => navButton.classList.toggle("active", navButton === button));
    views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  });
});

exportButton.addEventListener("click", () => {
  exportData(appState);
  showMessage("Export created.");
});

importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const confirmed = window.confirm("Importing will replace the data currently stored in this browser. Continue?");
  if (!confirmed) {
    importInput.value = "";
    return;
  }

  try {
    const imported = await importDataFromFile(file);
    appState = saveEntries(imported.entries, calculateStreaks(imported.entries));
    renderAll();
    showMessage("Data imported.");
  } catch (error) {
    showMessage(error.message);
  } finally {
    importInput.value = "";
  }
});

clearButton.addEventListener("click", () => {
  const confirmed = window.confirm("Clear all Vibe Tracker data from localStorage?");
  if (!confirmed) {
    return;
  }

  clearData();
  appState = loadData();
  renderAll();
  showMessage("All data cleared.");
});

renderAll();
