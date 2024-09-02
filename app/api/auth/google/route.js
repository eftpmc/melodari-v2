import { getOAuth2Client } from "@/utils/google/googleAuth";

export async function GET() {
    const oauth2Client = getOAuth2Client();

    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube',
            'openid',

        ],
    });

    return new Response(
        JSON.stringify({ authorizeUrl }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}

export async function POST(req) {
    const { code } = await req.json(); // Retrieve the code from the request body
    const oauth2Client = getOAuth2Client();

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.credentials = tokens;

        if (tokens) {
            return new Response(
                JSON.stringify({ tokens }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new Response(
                JSON.stringify({ message: "Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        console.error('Error during token exchange or validation:', error.message);
        return new Response(
            JSON.stringify({ message: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
