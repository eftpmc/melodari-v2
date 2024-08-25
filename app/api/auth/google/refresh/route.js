import { getOAuth2Client } from "@/utils/google/googleAuth";

export async function POST() {
    try {
        const { refresh_token } = await req.json(); // Retrieve the refresh token from the request body
        const oauth2Client = getOAuth2Client();

        oauth2Client.setCredentials({ refresh_token }); // Set the refresh token

        const tokens = await oauth2Client.refreshAccessToken(); // Refresh the access token
        const newTokens = tokens.credentials;

        if (newTokens) {
            return new Response(
                JSON.stringify(newTokens),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new Response(
                JSON.stringify({ message: "Failed to refresh Google tokens" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        console.error('Error during Google token refresh:', error.message);
        return new Response(
            JSON.stringify({ message: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
