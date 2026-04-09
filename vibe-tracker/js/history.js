// history.js — list, expand, delete
const History = {
  expanded: new Set(),

  render() {
    const data = Storage.getAll();
    const list = document.getElementById('historyList');
    const empty = document.getElementById('historyEmpty');
    list.textContent = '';

    if (data.entries.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
    const vibeEmoji = ['', '😤', '😕', '😐', '😊', '🔥'];

    sorted.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'entry';

      const head = document.createElement('div');
      head.className = 'entry-head';

      const left = document.createElement('div');
      const dateEl = document.createElement('div');
      dateEl.className = 'entry-date';
      dateEl.textContent = new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
      });
      const stars = document.createElement('div');
      stars.className = 'entry-stars';
      stars.textContent = '★'.repeat(entry.productivity) + '☆'.repeat(5 - entry.productivity);
      left.appendChild(dateEl);
      left.appendChild(stars);

      const emoji = document.createElement('div');
      emoji.className = 'entry-emoji';
      emoji.textContent = vibeEmoji[entry.vibe] || '';

      head.appendChild(left);
      head.appendChild(emoji);
      card.appendChild(head);

      if (entry.note) {
        const isOpen = this.expanded.has(entry.id);
        if (isOpen) {
          const full = document.createElement('div');
          full.className = 'entry-full';
          full.textContent = entry.note;
          card.appendChild(full);
        } else {
          const snip = document.createElement('div');
          snip.className = 'entry-snippet';
          snip.textContent = entry.note.length > 50 ? entry.note.slice(0, 50) + '…' : entry.note;
          card.appendChild(snip);
        }
      }

      if (this.expanded.has(entry.id)) {
        const del = document.createElement('button');
        del.className = 'entry-del';
        del.textContent = 'Delete';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Delete this entry? This cannot be undone.')) {
            Storage.deleteEntry(entry.id);
            this.expanded.delete(entry.id);
            this.render();
          }
        });
        card.appendChild(del);
      }

      card.addEventListener('click', () => {
        if (this.expanded.has(entry.id)) this.expanded.delete(entry.id);
        else this.expanded.add(entry.id);
        this.render();
      });

      list.appendChild(card);
    });
  }
};
