import { getCallbackUrl } from './_lib/spotify.js';

export default async function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Missing SPOTIFY_CLIENT_ID');
    return;
  }

  const redirectUri = getCallbackUrl(req);
  const scope = [
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ');

  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);

  res.writeHead(302, { Location: url.toString() });
  res.end();
}
