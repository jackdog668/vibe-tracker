window.VibeTracker = window.VibeTracker || {};

const MAX_SCORE = 5;

function getLastSevenDays(entries) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const days = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = window.VibeTracker.streaks.getLocalDateKey(date);
    const entry = byDate.get(key) || null;

    days.push({
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      vibe: entry ? entry.vibe : 0,
      productivity: entry ? entry.productivity : 0,
      hasEntry: Boolean(entry),
    });
  }

  return days;
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function drawBarChart(canvas, points, key, color) {
  const context = canvas.getContext("2d");
  const scale = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = Math.round(cssWidth * 0.42);

  canvas.width = Math.round(cssWidth * scale);
  canvas.height = Math.round(cssHeight * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);

  const margin = { top: 18, right: 18, bottom: 44, left: 22 };
  const width = cssWidth - margin.left - margin.right;
  const height = cssHeight - margin.top - margin.bottom;
  const barWidth = width / points.length * 0.58;
  const gap = width / points.length;

  context.strokeStyle = "rgba(120, 89, 71, 0.18)";
  context.fillStyle = "rgba(120, 89, 71, 0.7)";
  context.lineWidth = 1;
  context.font = "12px Segoe UI";

  for (let step = 0; step <= MAX_SCORE; step += 1) {
    const y = margin.top + height - (height / MAX_SCORE) * step;
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(margin.left + width, y);
    context.stroke();

    if (step < MAX_SCORE) {
      context.fillText(String(step + 1), 0, y - 4);
    }
  }

  points.forEach((point, index) => {
    const value = point[key];
    const x = margin.left + gap * index + (gap - barWidth) / 2;
    const barHeight = value ? (value / MAX_SCORE) * height : 4;
    const y = margin.top + height - barHeight;

    context.fillStyle = point.hasEntry ? color : "rgba(120, 89, 71, 0.16)";
    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, 14);
    context.fill();

    context.fillStyle = "rgba(45, 28, 19, 0.88)";
    context.fillText(point.label, x + 4, margin.top + height + 20);

    if (point.hasEntry) {
      context.font = "11px Segoe UI";
      context.fillText(String(value), x + barWidth / 2 - 3, y - 8);
      context.font = "12px Segoe UI";
    }
  });
}

function createDashboardController() {
  const avgVibeStat = document.querySelector("#avg-vibe-stat");
  const avgProductivityStat = document.querySelector("#avg-productivity-stat");
  const weeklyCountStat = document.querySelector("#weekly-count-stat");
  const vibeCanvas = document.querySelector("#vibe-chart");
  const productivityCanvas = document.querySelector("#productivity-chart");

  return {
    update(entries) {
      const week = getLastSevenDays(entries);
      const presentEntries = week.filter((day) => day.hasEntry);
      const vibeValues = presentEntries.map((day) => day.vibe);
      const productivityValues = presentEntries.map((day) => day.productivity);

      avgVibeStat.textContent = average(vibeValues).toFixed(1);
      avgProductivityStat.textContent = average(productivityValues).toFixed(1);
      weeklyCountStat.textContent = String(presentEntries.length);

      drawBarChart(vibeCanvas, week, "vibe", "#bb4d1f");
      drawBarChart(productivityCanvas, week, "productivity", "#d2a24c");
    },
  };
}

window.VibeTracker.dashboard = {
  createDashboardController,
};
