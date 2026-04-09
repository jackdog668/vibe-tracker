window.VibeTracker = window.VibeTracker || {};

const DAY_MS = 24 * 60 * 60 * 1000;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcDayValue(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function uniqueSortedDates(entries) {
  const unique = new Set(entries.map((entry) => entry.date));
  return [...unique].sort((left, right) => toUtcDayValue(right) - toUtcDayValue(left));
}

function calculateStreaks(entries) {
  const dates = uniqueSortedDates(entries);

  if (!dates.length) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let running = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = toUtcDayValue(dates[index - 1]);
    const current = toUtcDayValue(dates[index]);
    const diff = previous - current;

    if (diff === DAY_MS) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 1;
    }
  }

  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const yesterdayKey = getLocalDateKey(new Date(today.getTime() - DAY_MS));

  let currentStreak = 0;

  if (dates[0] === todayKey || dates[0] === yesterdayKey) {
    currentStreak = 1;

    for (let index = 1; index < dates.length; index += 1) {
      const previous = toUtcDayValue(dates[index - 1]);
      const current = toUtcDayValue(dates[index]);

      if (previous - current === DAY_MS) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    current: currentStreak,
    longest,
  };
}

function getMilestoneTier(streakLength) {
  if (streakLength >= 30) {
    return 4;
  }

  if (streakLength >= 14) {
    return 3;
  }

  if (streakLength >= 7) {
    return 2;
  }

  if (streakLength >= 3) {
    return 1;
  }

  return 0;
}

function getMilestoneMessage(streakLength) {
  if (streakLength >= 30) {
    return "Thirty days locked in. This is no longer a streak, it is a pattern.";
  }

  if (streakLength >= 14) {
    return "Two full weeks. The flame is steady and hard to ignore now.";
  }

  if (streakLength >= 7) {
    return "A full week in motion. The streak has real weight now.";
  }

  if (streakLength >= 3) {
    return "Three days in a row. The first flame milestone is active.";
  }

  if (streakLength >= 1) {
    return "Momentum started. Keep checking in tomorrow to build the streak.";
  }

  return "Log a few days in a row to unlock flame milestones at 3, 7, 14, and 30 days.";
}

window.VibeTracker.streaks = {
  getLocalDateKey,
  calculateStreaks,
  getMilestoneTier,
  getMilestoneMessage,
};
