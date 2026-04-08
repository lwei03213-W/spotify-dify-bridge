async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Spotify refresh failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const playlistId = body?.playlist_id;
    const uris = body?.uris;

    if (!playlistId || !Array.isArray(uris) || uris.length === 0) {
      res.status(400).json({ error: 'playlist_id and non-empty uris are required' });
      return;
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Add tracks failed: ${JSON.stringify(data)}`);
    }

    res.status(200).json({
      success: true,
      snapshot_id: data.snapshot_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
