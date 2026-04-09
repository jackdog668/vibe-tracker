# Vibe Tracker

Local-first daily mood and productivity tracker. Zero backend. Zero APIs. Just open `index.html`.

Built for **Digital Alchemy Academy — Vibe Coding Blueprint Cohort** as a teaching vehicle for the PM-as-Director methodology.

## Features
- Daily check-in (vibe 1-5 emoji + productivity 1-5 stars + 280-char journal note)
- Streak tracking (current + longest, with growing flame milestones)
- Weekly dashboard with Chart.js bar charts + stat cards
- History view with expand/delete
- Export / Import / Clear data (JSON)
- Mobile-first responsive (bottom tab bar on mobile, top nav on desktop)
- Dark theme by default (Digital Alchemy brand colors)

## Run Locally
1. Clone or download this folder
2. Open `index.html` in any modern browser
3. That's it. No build. No install. No npm.

## Deploy to GitHub Pages
```bash
git init
git add .
git commit -m "feat: initial vibe tracker"
git branch -M main
git remote add origin https://github.com/<you>/vibe-tracker.git
git push -u origin main
```
Then in your GitHub repo: **Settings → Pages → Source: `main` branch / root → Save**.
Your app goes live at `https://<you>.github.io/vibe-tracker/`.

## File Structure
```
vibe-tracker/
├── index.html
├── css/styles.css
└── js/
    ├── storage.js    # localStorage CRUD + export/import
    ├── streaks.js    # consecutive-day calculation
    ├── checkin.js    # daily check-in form
    ├── dashboard.js  # charts + stats
    ├── history.js    # entry list
    └── app.js        # hash router
```

## Data Model
```json
{
  "entries": [
    {
      "id": "uuid",
      "date": "2026-04-08",
      "vibe": 4,
      "productivity": 3,
      "note": "Shipped the module today.",
      "createdAt": "2026-04-08T14:30:00Z"
    }
  ],
  "streaks": { "current": 5, "longest": 12 }
}
```

All data lives in `localStorage` under the key `vibe-tracker-v1`. Export regularly.

---
*"Build it. Commit it. Deploy it. Repeat."*
