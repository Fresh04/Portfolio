export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400'); 

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
    if (!tokenRes.ok) throw new Error('Token refresh failed');
    const token = await tokenRes.json();

    const actsRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!actsRes.ok) throw new Error('Activities fetch failed');
    const activities = await actsRes.json();

    const athRes = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!athRes.ok) throw new Error('Athlete fetch failed');
    const athlete = await athRes.json();

    const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!statsRes.ok) throw new Error('Stats fetch failed');
    const stats = await statsRes.json();

    const trimmed = activities.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      start_date: a.start_date,
      start_date_local: a.start_date_local,
      distance: a.distance,
      moving_time: a.moving_time,
      elapsed_time: a.elapsed_time,
      total_elevation_gain: a.total_elevation_gain,
    }));

    return res.status(200).json({ activities: trimmed, stats });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
