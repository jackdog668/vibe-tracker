// storage.js — single source of truth for all Vibe Tracker data
const STORAGE_KEY = 'vibe-tracker-v1';

const Storage = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { entries: [], streaks: { current: 0, longest: 0 } };
      const data = JSON.parse(raw);
      if (!data.entries) data.entries = [];
      if (!data.streaks) data.streaks = { current: 0, longest: 0 };
      return data;
    } catch (e) {
      console.error('Storage read failed', e);
      return { entries: [], streaks: { current: 0, longest: 0 } };
    }
  },

  _persist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  getToday() {
    const today = this.todayISO();
    return this.getAll().entries.find(e => e.date === today) || null;
  },

  saveEntry({ vibe, productivity, note }) {
    const data = this.getAll();
    const today = this.todayISO();
    const existing = data.entries.find(e => e.date === today);
    if (existing) {
      existing.vibe = vibe;
      existing.productivity = productivity;
      existing.note = note;
      existing.createdAt = new Date().toISOString();
    } else {
      data.entries.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        date: today,
        vibe,
        productivity,
        note,
        createdAt: new Date().toISOString()
      });
    }
    data.streaks = Streaks.compute(data.entries);
    this._persist(data);
    return data;
  },

  deleteEntry(id) {
    const data = this.getAll();
    data.entries = data.entries.filter(e => e.id !== id);
    data.streaks = Streaks.compute(data.entries);
    this._persist(data);
    return data;
  },

  exportJSON() {
    const data = this.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-tracker-${this.todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!Array.isArray(parsed.entries)) throw new Error('Invalid shape');
          parsed.streaks = Streaks.compute(parsed.entries);
          this._persist(parsed);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
