"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';

export default function Home() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const tokens = useSelector((state: RootState) => state.auth.tokens);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]); 
  // Use PlaylistItem[] as the type for the state
  interface PlaylistItemSnippet {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    // Add other fields you need from the snippet object
  }
  
  interface PlaylistItem {
    id: string;
    snippet: PlaylistItemSnippet;
  }
  
  interface PlaylistsResponse {
    items: PlaylistItem[];
    // Add other fields that the API response includes if needed
  }
  

  useEffect(() => {
    if (!isAuth) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchPlaylists = async () => {
      if (tokens?.access_token) {
        try {
          const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Accept': 'application/json',
            },
          });

          if (res.ok) {
            const data: PlaylistsResponse = await res.json(); // Use PlaylistsResponse type here
            setPlaylists(data.items || []);
          } else {
            console.error('Failed to fetch playlists:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      }
    };

    fetchPlaylists();
  }, [isAuth, router, tokens]);

  if (!isAuth) {
    return null; // Return nothing if not authenticated to avoid flickering
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center pb-24">
      <div>
        <h1 className="text-3xl text-base-content font-bold">Welcome, you are logged in!</h1>
        <h2 className="text-xl mt-4">Your Playlists:</h2>
        <ul className="mt-4">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <li key={playlist.id} className="text-base-content mb-2">
                {playlist.snippet.title}
              </li>
            ))
          ) : (
            <li>No playlists found.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
