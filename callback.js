import { exchangeCodeForTokens, getCallbackUrl } from './_lib/spotify.js';

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.status(400).send(`Spotify authorization failed: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  try {
    const redirectUri = getCallbackUrl(req);
    const tokenData = await exchangeCodeForTokens(code, redirectUri);

    const refreshToken = tokenData.refresh_token || 'No refresh token returned';
    const accessToken = tokenData.access_token || 'No access token returned';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; line-height: 1.6;">
          <h1>Spotify connected</h1>
          <p>Save these values now. You will put the refresh token into Vercel environment variables.</p>
          <p><strong>Refresh Token</strong></p>
          <pre style="white-space: pre-wrap; word-break: break-all; background: #f5f5f5; padding: 12px;">${refreshToken}</pre>
          <p><strong>Access Token</strong></p>
          <pre style="white-space: pre-wrap; word-break: break-all; background: #f5f5f5; padding: 12px;">${accessToken}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
