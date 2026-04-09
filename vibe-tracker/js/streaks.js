// streaks.js — consecutive-day streak calculation
const Streaks = {
  compute(entries) {
    if (!entries || entries.length === 0) return { current: 0, longest: 0 };

    // Unique dates sorted ascending
    const dates = [...new Set(entries.map(e => e.date))].sort();

    let longest = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
      if (this._isNextDay(dates[i - 1], dates[i])) {
        run++;
        if (run > longest) longest = run;
      } else {
        run = 1;
      }
    }

    // Current streak: walk backwards from today
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = this._shiftDate(today, -1);
    const set = new Set(dates);

    let current = 0;
    let cursor = set.has(today) ? today : (set.has(yesterday) ? yesterday : null);
    while (cursor && set.has(cursor)) {
      current++;
      cursor = this._shiftDate(cursor, -1);
    }

    return { current, longest: Math.max(longest, current) };
  },

  flame(n) {
    if (n >= 30) return '🔥🔥🔥🔥';
    if (n >= 14) return '🔥🔥🔥';
    if (n >= 7) return '🔥🔥';
    if (n >= 3) return '🔥';
    return '';
  },

  _isNextDay(a, b) {
    return this._shiftDate(a, 1) === b;
  },

  _shiftDate(iso, days) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
};
