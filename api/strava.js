module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
      return res.status(500).json({ error: 'Missing Strava env vars' });
    }

    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token refresh failed: ${tokenRes.status} ${await tokenRes.text()}`);
    const token = await tokenRes.json();
    const auth = { Authorization: `Bearer ${token.access_token}` };

    const actsRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=60', {
      headers: auth,
    });
    if (!actsRes.ok) throw new Error(`Activities fetch failed: ${actsRes.status} ${await actsRes.text()}`);
    const activities = await actsRes.json();

    const athRes = await fetch('https://www.strava.com/api/v3/athlete', { headers: auth });
    if (!athRes.ok) throw new Error(`Athlete fetch failed: ${athRes.status} ${await athRes.text()}`);
    const athlete = await athRes.json();

    const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, { headers: auth });
    if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status} ${await statsRes.text()}`);
    const stats = await statsRes.json();

    const RUN = (a) => a.type === 'Run';
    const runs = activities.filter(RUN);

    const bestForDistance = (meters, pct = 0.015) => {
      const lo = meters * (1 - pct);
      const hi = meters * (1 + pct);
      const candidates = runs.filter(a => a.distance >= lo && a.distance <= hi && a.moving_time > 0);
      if (!candidates.length) return null;
      const best = candidates.reduce((acc, a) => (a.moving_time < acc.moving_time ? a : acc), candidates[0]);
      return { seconds: best.moving_time, activity_id: best.id, when: best.start_date };
    };

    const pb5k  = bestForDistance(5000);
    const pb10k = bestForDistance(10000);
    const pbHM  = bestForDistance(21100); 
    const pbFM  = bestForDistance(42200);   

    const recentRunIds = runs.slice(0, 25).map(a => a.id);
    let pb1k = null;

    for (const id of recentRunIds) {
      const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${id}`, { headers: auth });
      if (!detailRes.ok) continue;
      const detail = await detailRes.json();
      const splits = detail.splits_metric || [];
      for (const s of splits) {
        if (!s || typeof s.distance !== 'number' || typeof s.elapsed_time !== 'number') continue;
        if (s.distance >= 950 && s.distance <= 1050) {
          if (!pb1k || s.elapsed_time < pb1k.seconds) {
            pb1k = { seconds: s.elapsed_time, activity_id: id, when: detail.start_date };
          }
        }
      }
    }

    const trim = (a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      start_date: a.start_date,
      start_date_local: a.start_date_local,
      distance: a.distance,
      moving_time: a.moving_time,
      elapsed_time: a.elapsed_time,
      total_elevation_gain: a.total_elevation_gain,
    });

    const latestTwo = activities.slice(0, 2).map(trim);

    const km = (m) => (m || 0) / 1000;

    const out = {
      meta: { athlete_id: athlete.id },
      totals: {
        lifetime_km: km(stats.all_run_totals?.distance),
        ytd_km: km((stats.ytd_run_totals || stats.year_to_date_run_totals || {}).distance),
        recent_4w_km: km(stats.recent_run_totals?.distance),
        longest_run_km: km(stats.biggest_run_distance),
      },
      pbs: {
        k1:  pb1k && pb1k.seconds,
        k5:  pb5k && pb5k.seconds,
        k10: pb10k && pb10k.seconds,
        hm:  pbHM && pbHM.seconds,
        fm:  pbFM && pbFM.seconds,
      },
      activities: latestTwo,
    };

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
