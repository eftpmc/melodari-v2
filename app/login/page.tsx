"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
    const router = useRouter();
    const { isAuthenticated, getAuthorizeUrl } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleGetStarted = async () => {
        setLoading(true);
        try {
            const authorizeUrl = await getAuthorizeUrl('google');
            if (authorizeUrl) {
                window.location.href = authorizeUrl;
            }
        } catch (error) {
            console.error("Error during Google authentication", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-center text-base-content leading-tight">
                <span className="inline-block">
                    A{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Universal
                    </span>
                </span>
                <br />
                <span className="block sm:inline">Approach to Music</span>
            </h1>
            <p className="text-xl text-base-content mb-8 text-center max-w-md">
                Every song, album and playlist.<br />Connected.
            </p>
            <button
                onClick={handleGetStarted}
                className="btn bg-base-content hover:bg-primary text-base-100 flex border-none items-center justify-center py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:px-8"
                disabled={loading}
            >
                {loading ? (
                    "Connecting..."
                ) : (
                    "Get Started"
                )}
            </button>
        </div>
    );
}