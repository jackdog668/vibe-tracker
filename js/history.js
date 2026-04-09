window.VibeTracker = window.VibeTracker || {};

const VIBE_MAP = {
  1: "😤",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "🔥",
};

function snippet(note) {
  if (!note) {
    return "No journal note added.";
  }

  return note.length > 120 ? `${note.slice(0, 120)}…` : note;
}

function starString(count) {
  return `${"★".repeat(count)}${"☆".repeat(5 - count)}`;
}

function createHistoryController({ onDelete, showMessage }) {
  const list = document.querySelector("#history-list");
  const template = document.querySelector("#history-item-template");

  function renderEmptyState() {
    list.innerHTML = `
      <div class="empty-state">
        No entries yet. Save your first check-in to build a history timeline.
      </div>
    `;
  }

  return {
    update(entries) {
      list.innerHTML = "";

      if (!entries.length) {
        renderEmptyState();
        return;
      }

      entries.forEach((entry) => {
        const fragment = template.content.cloneNode(true);
        const item = fragment.querySelector(".history-item");
        const dateLabel = fragment.querySelector(".history-date");
        const vibeLabel = fragment.querySelector(".history-vibe");
        const productivityLabel = fragment.querySelector(".history-productivity");
        const noteSnippet = fragment.querySelector(".history-snippet");
        const noteFull = fragment.querySelector(".history-note");
        const toggle = fragment.querySelector(".history-toggle");
        const deleteButton = fragment.querySelector(".history-delete");

        dateLabel.textContent = new Date(entry.createdAt).toLocaleString();
        vibeLabel.textContent = `${VIBE_MAP[entry.vibe]} vibe ${entry.vibe}`;
        productivityLabel.textContent = starString(entry.productivity);
        noteSnippet.textContent = snippet(entry.note);
        noteFull.textContent = entry.note || "No journal note recorded for this check-in.";

        toggle.addEventListener("click", () => {
          const expanded = noteFull.classList.toggle("expanded");
          toggle.textContent = expanded ? "Collapse" : "Expand";
        });

        deleteButton.addEventListener("click", () => {
          const confirmed = window.confirm("Delete this check-in?");
          if (!confirmed) {
            return;
          }

          onDelete(entry.id);
          showMessage("Entry deleted.");
        });

        list.appendChild(item);
      });
    },
  };
}

window.VibeTracker.history = {
  createHistoryController,
};
