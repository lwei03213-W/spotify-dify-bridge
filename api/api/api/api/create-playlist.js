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

async function getCurrentUserId(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify user: ${JSON.stringify(data)}`);
  }

  return data.id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const name = body?.name;

    if (!name) {
      res.status(400).json({ error: 'Missing playlist name' });
      return;
    }

    const accessToken = await getAccessToken();
    const userId = await getCurrentUserId(accessToken);

    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description: body?.description || '',
        public: body?.public ?? false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Create playlist failed: ${JSON.stringify(data)}`);
    }

    res.status(200).json({
      id: data.id,
      name: data.name,
      url: data.external_urls?.spotify || '',
      uri: data.uri
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
