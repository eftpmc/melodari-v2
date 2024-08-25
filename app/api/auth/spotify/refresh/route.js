import { refreshSpotifyTokens } from "@/utils/spotifyAuth";

export async function POST() {
    try {
        const { refresh_token } = await req.json(); // Retrieve the refresh token from the request body

        const newTokens = await refreshSpotifyTokens(refresh_token);

        if (newTokens) {
            return new Response(
                JSON.stringify(newTokens),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new Response(
                JSON.stringify({ message: "Failed to refresh Spotify tokens" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        console.error('Error during Spotify token refresh:', error.message);
        return new Response(
            JSON.stringify({ message: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
