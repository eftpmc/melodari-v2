import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from "@/utils/google/googleAuth";

interface RefreshTokenRequest {
    refresh_token: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: RefreshTokenRequest = await req.json();

        if (!body.refresh_token) {
            return new NextResponse(
                JSON.stringify({ message: "Missing refresh token" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const oauth2Client = getOAuth2Client();

        oauth2Client.setCredentials({ refresh_token: body.refresh_token });

        const newTokens = await oauth2Client.refreshAccessToken();
        const tokens = newTokens.credentials;

        if (tokens?.access_token) {
            return new NextResponse(
                JSON.stringify(tokens),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new NextResponse(
                JSON.stringify({ message: "Failed to refresh Google tokens" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error('Error during Google token refresh:', errorMessage);
        return new NextResponse(
            JSON.stringify({ message: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
