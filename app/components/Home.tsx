"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { setGooglePlaylists } from '@/utils/redux/playlistSlice';
import { PlaylistItem } from '@/types';

interface PlaylistsResponse {
  items: PlaylistItem[];
}

export default function Home() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const tokens = useSelector((state: RootState) => state.auth.googleTokens);
  const storedPlaylists = useSelector((state: RootState) => state.playlists.google);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>(storedPlaylists);

  useEffect(() => {
    if (!isAuth) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchPlaylists = async () => {
      if (tokens?.access_token && storedPlaylists.length === 0) {
        try {
          const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Accept': 'application/json',
            },
          });

          if (res.ok) {
            const data: PlaylistsResponse = await res.json();
            setPlaylists(data.items || []);
            dispatch(setGooglePlaylists(data.items || [])); // Store playlists in Redux
          } else {
            console.error('Failed to fetch playlists:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      }
    };

    if (storedPlaylists.length === 0) {
      fetchPlaylists();
    }
  }, [isAuth, router, tokens, dispatch, storedPlaylists]);

  if (!isAuth) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="overflow-x-auto w-full">
        <table className="table w-full table-zebra">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Author</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <tr key={playlist.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-16 h-16 mask mask-squircle">
                          <img src={playlist.snippet.thumbnails.medium.url} alt={playlist.snippet.title} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-base-content">{playlist.snippet.title}</div>
                  </td>
                  <td>
                    <span className="text-sm opacity-75">{/* Author Name (if available) */}</span>
                  </td>
                  <td>
                    <span className="text-sm">{playlist.snippet.description}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">No playlists found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
