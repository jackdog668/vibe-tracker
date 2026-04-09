window.VibeTracker = window.VibeTracker || {};

function setPressedState(buttons, selectedScore) {
  buttons.forEach((button) => {
    const isSelected = Number(button.dataset.score) === selectedScore;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-checked", isSelected ? "true" : "false");
  });
}

function paintStars(buttons, selectedScore) {
  buttons.forEach((button) => {
    const buttonScore = Number(button.dataset.score);
    const isFilled = buttonScore <= selectedScore;
    const isSelected = buttonScore === selectedScore;
    button.classList.toggle("filled", isFilled);
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-checked", isSelected ? "true" : "false");
  });
}

function formatStars(count) {
  return "★".repeat(count);
}

function createCheckinController({ onSave, showMessage, onEntriesChanged }) {
  const form = document.querySelector("#checkin-form");
  const noteInput = document.querySelector("#note-input");
  const noteCounter = document.querySelector("#note-counter");
  const vibeButtons = [...document.querySelectorAll("#vibe-options .emoji-option")];
  const productivityButtons = [...document.querySelectorAll("#productivity-options .star-option")];
  const lastSaveLabel = document.querySelector("#last-save-label");
  const todayLabel = document.querySelector("#today-label");

  const state = {
    vibe: null,
    productivity: null,
  };

  function renderTodayLabel() {
    const now = new Date();
    todayLabel.textContent = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function resetForm() {
    state.vibe = null;
    state.productivity = null;
    noteInput.value = "";
    noteCounter.textContent = "0 / 280";
    setPressedState(vibeButtons, -1);
    paintStars(productivityButtons, 0);
  }

  function renderLastSave(entries) {
    if (!entries.length) {
      lastSaveLabel.textContent = "No entries saved yet.";
      return;
    }

    const latest = entries[0];
    lastSaveLabel.textContent = `Last saved ${new Date(latest.createdAt).toLocaleString()} • ${formatStars(latest.productivity)}`;
  }

  vibeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.vibe = Number(button.dataset.score);
      setPressedState(vibeButtons, state.vibe);
    });
  });

  productivityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.productivity = Number(button.dataset.score);
      paintStars(productivityButtons, state.productivity);
    });
  });

  noteInput.addEventListener("input", () => {
    noteCounter.textContent = `${noteInput.value.length} / 280`;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.vibe || !state.productivity) {
      showMessage("Select both vibe and productivity before saving.");
      return;
    }

    const now = new Date();
    const entry = {
      id: `${now.getTime()}`,
      date: window.VibeTracker.streaks.getLocalDateKey(now),
      vibe: state.vibe,
      productivity: state.productivity,
      note: noteInput.value.trim().slice(0, 280),
      createdAt: now.toISOString(),
    };

    const savedEntries = onSave(entry);
    renderLastSave(savedEntries);
    resetForm();
    onEntriesChanged(savedEntries);
    showMessage("Check-in saved.");
  });

  renderTodayLabel();

  return {
    update(entries) {
      renderTodayLabel();
      renderLastSave(entries);
    },
  };
}

window.VibeTracker.checkin = {
  createCheckinController,
};
