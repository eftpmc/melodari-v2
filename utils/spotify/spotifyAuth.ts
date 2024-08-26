import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID!;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI!;

export function generateSpotifyAuthUrl(state: string) {
    const scope = 'user-read-private user-read-email';

    return (
        'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
        })
    );
}

export async function exchangeSpotifyCodeForTokens(code: string) {
    const authOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
        body: querystring.stringify({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
        }),
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

export async function refreshSpotifyTokens(refresh_token: string) {
    const authOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify({
            refresh_token: refresh_token,
            grant_type: 'refresh_token',
            client_id: client_id,
        }),
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}

function generateRandomString(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function getState() {
    return generateRandomString(16);
}