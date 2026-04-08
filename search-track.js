import { json, spotifyRequest } from './_lib/spotify.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const q = req.query.q;
  if (!q) {
    json(res, 400, { error: 'Missing q query parameter' });
    return;
  }

  try {
    const data = await spotifyRequest(`/search?type=track&limit=10&q=${encodeURIComponent(q)}`);
    const tracks = (data.tracks?.items || []).map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(', '),
      album: track.album?.name || '',
      url: track.external_urls?.spotify || ''
    }));
    json(res, 200, { tracks });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
}
