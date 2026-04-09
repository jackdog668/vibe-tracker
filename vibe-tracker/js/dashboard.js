// dashboard.js — weekly charts + stat cards
const Dashboard = {
  vibeChart: null,
  prodChart: null,

  render() {
    const data = Storage.getAll();
    const days = this._last7Days();
    const byDate = Object.fromEntries(data.entries.map(e => [e.date, e]));

    const vibeSeries = days.map(d => byDate[d]?.vibe ?? 0);
    const prodSeries = days.map(d => byDate[d]?.productivity ?? 0);
    const labels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }));

    // Stats
    const weekEntries = days.map(d => byDate[d]).filter(Boolean);
    const avg = arr => arr.length ? (arr.reduce((s, n) => s + n, 0) / arr.length).toFixed(1) : '—';
    document.getElementById('statAvgVibe').textContent = avg(weekEntries.map(e => e.vibe));
    document.getElementById('statAvgProd').textContent = avg(weekEntries.map(e => e.productivity));
    document.getElementById('statTotal').textContent = data.entries.length;
    document.getElementById('statStreak').textContent = `${data.streaks.current} ${Streaks.flame(data.streaks.current)}`;
    document.getElementById('longestStreak').textContent = data.streaks.longest;
    document.getElementById('streakFlame').textContent = Streaks.flame(data.streaks.current);
    document.getElementById('topFlame').textContent = Streaks.flame(data.streaks.current);

    this._drawChart('vibeChart', 'vibeChart', labels, vibeSeries, 'Vibe', '#40FF78');
    this._drawChart('prodChart', 'prodChart', labels, prodSeries, 'Productivity', '#FFDB40');
  },

  _last7Days() {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  },

  _drawChart(propKey, canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (this[propKey] && typeof this[propKey].destroy === 'function') {
      this[propKey].destroy();
    }
    this[propKey] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#f5f5f7' } } },
        scales: {
          y: { beginAtZero: true, max: 5, ticks: { color: '#8a8f9c', stepSize: 1 }, grid: { color: '#1f2230' } },
          x: { ticks: { color: '#8a8f9c' }, grid: { color: '#1f2230' } }
        }
      }
    });
  }
};
