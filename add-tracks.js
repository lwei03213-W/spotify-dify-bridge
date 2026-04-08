import { json, spotifyRequest } from './_lib/spotify.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const playlistId = body?.playlist_id;
    const uris = body?.uris;

    if (!playlistId || !Array.isArray(uris) || uris.length === 0) {
      json(res, 400, { error: 'playlist_id and non-empty uris are required' });
      return;
    }

    const data = await spotifyRequest(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris })
    });

    json(res, 200, {
      success: true,
      snapshot_id: data.snapshot_id
    });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
}
