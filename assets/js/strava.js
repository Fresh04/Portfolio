const grid = document.getElementById('activityGrid');
const statsEl = document.getElementById('stats');

const API_URL =
  localStorage.getItem('STRAVA_API_URL') ||
  'https://stravabackend-dusky.vercel.app/api/strava';

const fmtPace = (secPerKm) => {
  if (!isFinite(secPerKm) || !secPerKm) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60).toString().padStart(2, '0');
  return `${m}:${s} /km`;
};

const fmtTime = (seconds) => {
  if (!isFinite(seconds) || !seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60).toString().padStart(2, '0');
  return h ? `${h}:${m.toString().padStart(2,'0')}:${s}` : `${m}:${s}`;
};

async function loadActivities() {
  if (!grid || !statsEl) return;
  grid.innerHTML = '';
  statsEl.innerHTML = '';

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      let t = ''; try { t = await res.text(); } catch {}
      throw new Error(`Bad response ${res.status}: ${t.slice(0,160)}`);
    }
    const data = await res.json();

    const T = data.totals || {};
    const PB = data.pbs || {};

    statsEl.innerHTML = `
      <div class="card" style="padding:16px; margin-bottom:20px">
        <h3 style="margin-bottom:10px">🏃 Performance Summary</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; font-size:0.95rem">
          <div><strong>Total Distance</strong><br>${(T.lifetime_km||0).toFixed(0)} km</div>
          <div><strong>This Year</strong><br>${(T.ytd_km||0).toFixed(0)} km</div>
          <div><strong>PB 1K</strong><br>${PB.k1 ? fmtPace(PB.k1) : '—'}</div>
          <div><strong>PB 5K</strong><br>${PB.k5 ? fmtTime(PB.k5) : '—'}</div>
          <div><strong>PB 10K</strong><br>${PB.k10 ? fmtTime(PB.k10) : '—'}</div>
          <div><strong>PB HM</strong><br>${PB.hm ? fmtTime(PB.hm) : '—'}</div>
          <div><strong>PB FM</strong><br>${PB.fm ? fmtTime(PB.fm) : '—'}</div>
        </div>
      </div>
    `;

    const acts = (data.activities || []).slice(0, 6);
    if (!acts.length) {
      grid.innerHTML = `
        <div class="card" style="grid-column: span 12"><div class="body">
          No recent activities.
        </div></div>`;
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
  } catch (err) {
    grid.innerHTML = `
      <div class='card' style='grid-column: span 12'>
        <div class='body'>Failed to load Strava: ${err.message}
          <div class="mono" style="margin-top:6px; color:var(--muted)">API: ${API_URL}</div>
        </div>
      </div>`;
  }
}

loadActivities();
