"use client"

import React from 'react';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DemoModal from '@/app/components/DemoModal';
import { FolderSync, Music, PlayCircle, Users } from "lucide-react";
import Footer from "@/app/components/Footer";

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
        <div className="flex min-h-screen flex-col items-center justify-center mt-20">
            {/* Main hero content */}
            <div className="w-full flex flex-col items-center justify-center my-24 px-8">
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

            <div className="w-full my-20 px-8">
                <DemoModal />
            </div>

            <div className="flex flex-col items-center justify-center my-20 px-8">
                <button className="btn bg-base-content hover:bg-primary text-base-100 text-base-100 rounded-full py-2 px-6 mb-6 flex items-center justify-center">
                    <FolderSync /> Universal
                </button>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-center text-base-content">
                    Connected playlists.
                </h2>
                <p className="text-lg text-center text-base-content opacity-80 max-w-xl mb-8">
                    Melodari uses one playlist that can be connected to all of our supported providers.
                </p>
            </div>

            <div className="relative mt-20 w-full min-h-screen background bg-gradient-to-b from-base-300 to-base-content border-none">
                {/* SVG Background */}
                <div className="absolute inset-0 bg-cover bg-no-repeat background text-base-content"></div>

                {/* Button under the SVG's point */}
                <div className="button-wrapper z-20 p-2">
                    <button
                        className="btn whitespace-nowrap bg-base-300 hover:bg-primary text-base-content flex border-none items-center justify-center py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out"
                    >
                        View API
                    </button>
                </div>

                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-base-100 whitespace-nowrap'>Coming soon!</div>
                <Footer></Footer>
            </div>
        </div>
    );
}
