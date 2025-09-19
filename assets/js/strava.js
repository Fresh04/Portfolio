const grid = document.getElementById('activityGrid');
const statsEl = document.getElementById('stats');

const API_URL =
  localStorage.getItem('STRAVA_API_URL') ||
  'https://stravabackend-dusky.vercel.app/api/strava'; 

async function loadActivities() {
  if (!grid || !statsEl) return;
  grid.innerHTML = '';
  statsEl.innerHTML = '';

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch {}
      throw new Error(`Bad response ${res.status}: ${body.slice(0,180)}`);
    }
    const data = await res.json();

    const acts = (data.activities || []).slice(0, 9);
    if (!acts.length) {
      grid.innerHTML = `
        <div class="card" style="grid-column: span 12">
          <div class="body">No recent activities.</div>
        </div>`;
    } else {
      for (const a of acts) {
        const km = a.distance ? (a.distance / 1000).toFixed(1) : '0.0';
        const mins = Math.max(1, Math.round((a.moving_time || a.elapsed_time || 0) / 60));
        const pace = (parseFloat(km) ? (mins / parseFloat(km)).toFixed(1) : '—');
        const when = new Date(a.start_date_local || a.start_date || Date.now()).toLocaleDateString();
        const type = a.type || 'Activity';

        const el = document.createElement('article');
        el.className = 'card';
        el.innerHTML = `
          <div class="body">
            <div class="kicker">${type}</div>
            <h3>${a.name || 'Activity'}</h3>
            <p>${km} km · ${mins} min · ${isFinite(pace) ? pace + ' min/km' : '—'}</p>
            <div class="tags">
              <span class="tag">${when}</span>
              ${a.total_elevation_gain ? `<span class="tag">${Math.round(a.total_elevation_gain)} m ↑</span>` : ''}
            </div>
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
    grid.innerHTML = `
      <div class='card' style='grid-column: span 12'>
        <div class='body'>Failed to load Strava: ${err.message}
          <div class="mono" style="margin-top:6px; color:var(--muted)">
            Using API: ${API_URL}
          </div>
        </div>
      </div>`;
  }
}

loadActivities();
