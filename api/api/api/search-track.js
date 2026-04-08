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
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const q = req.query.q;

  if (!q) {
    res.status(400).json({ error: 'Missing q query parameter' });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(q)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Spotify API failed: ${JSON.stringify(data)}`);
    }

    const tracks = (data.tracks?.items || []).map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(', '),
      album: track.album?.name || '',
      url: track.external_urls?.spotify || ''
    }));

    res.status(200).json({ tracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
