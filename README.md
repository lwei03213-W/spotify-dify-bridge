# spotify-dify-bridge

Minimal Vercel bridge for connecting Dify to Spotify playlist APIs.

## Endpoints

- `GET /api/login`
- `GET /api/callback`
- `GET /api/search-track?q=artist+song`
- `POST /api/create-playlist`
- `POST /api/add-tracks`

## Environment variables

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `SPOTIFY_REFRESH_TOKEN`
