import { NextRequest, NextResponse } from 'next/server';
import { refreshSpotifyTokens } from "@/utils/spotify/spotifyAuth";

interface RefreshTokenRequest {
    refresh_token: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: RefreshTokenRequest = await req.json(); // Retrieve the refresh token from the request body

        const newTokens = await refreshSpotifyTokens(body.refresh_token);

        if (newTokens) {
            return new NextResponse(
                JSON.stringify(newTokens),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new NextResponse(
                JSON.stringify({ message: "Failed to refresh Spotify tokens" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error('Error during Spotify token refresh:', errorMessage);
        return new NextResponse(
            JSON.stringify({ message: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}