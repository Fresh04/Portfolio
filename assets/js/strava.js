const grid = document.getElementById('activityGrid');
const statsEl = document.getElementById('stats');

async function loadActivities() {
  if (!grid || !statsEl) return;
  grid.innerHTML = '';
  statsEl.innerHTML = '';

  try {
    const res = await fetch('/api/strava', { cache: 'no-store' });
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();

    const acts = (data.activities || []).slice(0, 9);
    if (acts.length === 0) {
      grid.innerHTML = `<div class="card" style="grid-column: span 12"><div class="body">No recent activities.</div></div>`;
    } else {
      for (const a of acts) {
        const km = (a.distance / 1000).toFixed(1);
        const dur = Math.round((a.moving_time || a.elapsed_time || 0) / 60);
        const pace = (dur / km).toFixed(1);
        const when = new Date(a.start_date_local || a.start_date).toLocaleDateString();
        const type = a.type || 'Run';
        const el = document.createElement('article');
        el.className = 'card';
        el.innerHTML = `
          <div class="body">
            <div class="kicker">${type}</div>
            <h3>${a.name || 'Activity'}</h3>
            <p>${km} km · ${dur} min · ${isFinite(pace) ? pace + ' min/km' : '—'}</p>
            <div class="tags"><span class="tag">${when}</span>${a.total_elevation_gain ? `<span class="tag">${Math.round(a.total_elevation_gain)} m ↑</span>` : ''}</div>
          </div>`;
        grid.appendChild(el);
      }
    }

    if (data.stats) {
      const s = data.stats;
      const totRun = (s.all_run_totals?.distance || 0) / 1000;
      const totRide = (s.all_ride_totals?.distance || 0) / 1000;
      statsEl.innerHTML = `
        <div class="list">
          <div class="mono" style="display:flex; gap:14px; flex-wrap:wrap">
            <span class="tag">Lifetime Run: ${totRun.toFixed(0)} km</span>
            <span class="tag">Lifetime Ride: ${totRide.toFixed(0)} km</span>
            <span class="tag">Longest Run: ${(s.biggest_run_distance || 0).toFixed(1)} m</span>
          </div>
        </div>`;
    }
  } catch (err) {
    grid.innerHTML = `<div class='card' style='grid-column: span 12'><div class='body'>Failed to load Strava: ${err.message}</div></div>`;
  }
}

loadActivities();
