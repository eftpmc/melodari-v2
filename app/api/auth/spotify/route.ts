import { generateSpotifyAuthUrl, exchangeSpotifyCodeForTokens, getState } from "@/utils/spotifyAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const state = getState();
    const authorizeUrl = generateSpotifyAuthUrl(state);

    return NextResponse.json({ authorizeUrl });
}

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();
        const tokenData = await exchangeSpotifyCodeForTokens(code);

        if (tokenData.access_token) {
            return NextResponse.json({ tokens: tokenData });
        } else {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Error during token exchange or validation:', error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
