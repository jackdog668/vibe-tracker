// checkin.js — daily check-in form
const Checkin = {
  selected: { vibe: null, productivity: null },

  render() {
    // Date label
    const d = new Date();
    document.getElementById('checkinDate').textContent = d.toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Pre-fill today's entry if it exists
    const today = Storage.getToday();
    if (today) {
      this.selected.vibe = today.vibe;
      this.selected.productivity = today.productivity;
      document.getElementById('noteInput').value = today.note || '';
      document.getElementById('saveBtn').textContent = 'Update Check-In';
    } else {
      this.selected = { vibe: null, productivity: null };
      document.getElementById('noteInput').value = '';
      document.getElementById('saveBtn').textContent = 'Save Check-In';
    }

    this._paintSelections();
    this._updateCharCount();
  },

  init() {
    // Vibe row
    document.querySelectorAll('#vibeRow .pick').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selected.vibe = parseInt(btn.dataset.val, 10);
        this._paintSelections();
      });
    });
    // Prod row
    document.querySelectorAll('#prodRow .pick').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selected.productivity = parseInt(btn.dataset.val, 10);
        this._paintSelections();
      });
    });
    // Note counter
    document.getElementById('noteInput').addEventListener('input', () => this._updateCharCount());
    // Save
    document.getElementById('saveBtn').addEventListener('click', () => this._save());
  },

  _paintSelections() {
    document.querySelectorAll('#vibeRow .pick').forEach(btn => {
      btn.dataset.selected = (parseInt(btn.dataset.val, 10) === this.selected.vibe) ? 'true' : 'false';
    });
    document.querySelectorAll('#prodRow .pick').forEach(btn => {
      const val = parseInt(btn.dataset.val, 10);
      btn.dataset.selected = (this.selected.productivity && val <= this.selected.productivity) ? 'true' : 'false';
    });
  },

  _updateCharCount() {
    const n = document.getElementById('noteInput').value.length;
    document.getElementById('charCount').textContent = `${n}/280`;
  },

  _save() {
    if (!this.selected.vibe || !this.selected.productivity) {
      this._toast('Pick a vibe and productivity score first');
      return;
    }
    const note = document.getElementById('noteInput').value.trim();
    Storage.saveEntry({
      vibe: this.selected.vibe,
      productivity: this.selected.productivity,
      note
    });
    this._toast('Saved! ' + Streaks.flame(Storage.getAll().streaks.current));
    setTimeout(() => { location.hash = '#dashboard'; }, 700);
  },

  _toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
  }
};
