import { getOAuth2Client } from "@/utils/google/googleAuth";

export async function POST() {
    try {
        const { refresh_token } = await req.json(); // Retrieve the refresh token from the request body

        if (!refresh_token) {
            return new Response(
                JSON.stringify({ message: "Missing refresh token" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const oauth2Client = getOAuth2Client();

        oauth2Client.setCredentials({ refresh_token }); // Set the refresh token

        const { credentials: newTokens } = await oauth2Client.getAccessToken(); // Refresh the access token

        if (newTokens?.access_token) {
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