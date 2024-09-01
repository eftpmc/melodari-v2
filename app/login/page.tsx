"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaSpotify } from "react-icons/fa"; 
import { useGoogleAuthContext } from "@/contexts/google/GoogleAuthContext";
import { useSpotifyAuthContext } from "@/contexts/spotify/SpotifyAuthContext";

export default function Login() {
    const router = useRouter();
    const {checkIfGoogleAuthenticated} = useGoogleAuthContext();
    const {checkIfSpotifyAuthenticated} = useSpotifyAuthContext();
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingSpotify, setLoadingSpotify] = useState(false);

    useEffect(() => {
        // If user is already authenticated, redirect to home
        const checkAuthStatus = async () => {
            const isGoogleAuth = await checkIfGoogleAuthenticated();
            const isSpotifyAuth = await checkIfSpotifyAuthenticated();
            if (isGoogleAuth || isSpotifyAuth) {
                router.push("/");
            }
        };

        checkAuthStatus();
    }, [router, checkIfGoogleAuthenticated, checkIfSpotifyAuthenticated]);

    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);

        try {
            const res = await fetch("/api/auth/google", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (data.authorizeUrl) {
                window.location.href = data.authorizeUrl;
            }
        } catch (error) {
            console.error("Error during Google authentication", error);
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleSpotifyLogin = async () => {
        setLoadingSpotify(true);

        try {
            const res = await fetch("/api/auth/spotify", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (data.authorizeUrl) {
                window.location.href = data.authorizeUrl;
            }
        } catch (error) {
            console.error("Error during Spotify authentication", error);
        } finally {
            setLoadingSpotify(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
            <h1 className="text-3xl font-bold mb-4 text-center text-base-content leading-tight">
                <span className="inline-block">
                    A{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Universal
                    </span>
                </span>
                <span className="block sm:inline">{" "}Approach to Music</span>
            </h1>
            <p className="text-base-content mb-8 text-center max-w-md">
                Discover and connect with the best music services all in one place.
            </p>
            <div className="flex flex-row">
                <button
                    onClick={handleGoogleLogin}
                    className="btn btn-error flex items-center text-base-200 py-3 px-6 rounded-lg shadow-lg m-2 mb-0"
                    disabled={loadingGoogle}
                >
                    {loadingGoogle ? (
                        "Connecting..."
                    ) : (
                        <FaGoogle className="w-5 h-5 text-base-200" />
                    )}
                </button>
                {/* <button
                    onClick={handleSpotifyLogin}
                    className="btn btn-success flex items-center text-base-200 py-3 px-6 rounded-lg shadow-lg m-2 mb-0"
                    disabled={loadingSpotify}
                >
                    {loadingSpotify ? (
                        "Connecting..."
                    ) : (
                        <FaSpotify className="w-5 h-5 text-base-200" />
                    )}
                </button> */}
            </div>
        </div>
    );
}
