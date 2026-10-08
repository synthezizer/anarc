/**
 * Live sidebar gadgets (calendar). Re-attached on every page load
 * (Astro <ClientRouter />) and stopped before each swap.
 */

let timer: number | undefined;

function renderCalendars(): void {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  document.querySelectorAll<HTMLElement>('[data-calendar]').forEach((cal) => {
    const title = cal.querySelector('[data-calendar-title]');
    const today = cal.querySelector('[data-calendar-today]');
    const days = cal.querySelector('[data-calendar-days]');
    if (!title || !today || !days) return;

    title.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    today.textContent = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

    const cells: string[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push('<span aria-hidden="true"></span>');
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d === now.getDate() ? `<span class="is-today" aria-current="date">${d}</span>` : `<span>${d}</span>`);
    }
    days.innerHTML = cells.join('');
  });
}

function start(): void {
  stop();
  if (!document.querySelector('[data-calendar]')) return;
  renderCalendars();
  // Re-check once a minute so the calendar rolls over at midnight.
  timer = window.setInterval(() => {
    if (!document.hidden) renderCalendars();
  }, 60_000);
}

function stop(): void {
  if (timer !== undefined) window.clearInterval(timer);
  timer = undefined;
}

export function startGadgets(): void {
  document.addEventListener('astro:page-load', start);
  document.addEventListener('astro:before-swap', stop);
}
