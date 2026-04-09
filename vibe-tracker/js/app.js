// app.js — hash router, settings wiring, init
const App = {
  init() {
    Checkin.init();
    this._wireSettings();
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  route() {
    const tab = (location.hash || '#checkin').replace('#', '');
    const valid = ['checkin', 'dashboard', 'history', 'settings'];
    const active = valid.includes(tab) ? tab : 'checkin';

    valid.forEach(v => {
      document.getElementById('view-' + v).classList.toggle('hidden', v !== active);
    });
    document.querySelectorAll('.tabbar a').forEach(a => {
      a.classList.toggle('active', a.dataset.tab === active);
    });

    if (active === 'checkin') Checkin.render();
    if (active === 'dashboard') Dashboard.render();
    if (active === 'history') History.render();
  },

  _wireSettings() {
    document.getElementById('exportBtn').addEventListener('click', () => Storage.exportJSON());

    document.getElementById('importInput').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Storage.importJSON(file);
        alert('Import successful!');
        this.route();
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
      e.target.value = '';
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      if (confirm('Clear ALL data? This cannot be undone.')) {
        Storage.clearAll();
        alert('All data cleared.');
        location.hash = '#checkin';
        this.route();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
