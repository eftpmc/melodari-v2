"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { setGooglePlaylists } from '@/utils/redux/playlistSlice';
import { PlaylistItem } from '@/types';
import YoutubeMusicPlaylistCard from '@/app/components/YoutubeMusicPlaylistCard';

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
    <div className="flex bg-base-300 min-h-screen flex-col p-8">
      <YoutubeMusicPlaylistCard playlists={playlists} />
    </div>
  );
}
