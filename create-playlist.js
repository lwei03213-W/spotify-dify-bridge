import { getCurrentUserId, json, spotifyRequest } from './_lib/spotify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const name = body?.name;

    if (!name) {
      json(res, 400, { error: 'Missing playlist name' });
      return;
    }

    const userId = await getCurrentUserId();
    const data = await spotifyRequest(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: body?.description || '',
        public: body?.public ?? false
      })
    });

    json(res, 200, {
      id: data.id,
      name: data.name,
      url: data.external_urls?.spotify || '',
      uri: data.uri
    });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
}
