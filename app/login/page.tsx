"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DemoModal from '@/app/components/DemoModal'; // Import the PlaylistModal component

export default function Login() {
    const router = useRouter();
    const { isAuthenticated, getAuthorizeUrl } = useAuth();

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleGetStarted = async () => {
        try {
            const authorizeUrl = await getAuthorizeUrl('google');
            if (authorizeUrl) {
                window.location.href = authorizeUrl;
            }
        } catch (error) {
            console.error("Error during Google authentication", error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-8 mt-20">
            <div className="w-full flex flex-col items-center justify-center my-24">
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
            >
                Get Started
            </button>
            </div>

            <div className="w-full my-20">
                <DemoModal />
            </div>
        </div>
    );
}
