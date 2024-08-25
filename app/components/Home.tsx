"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { setGooglePlaylists } from '@/utils/redux/playlistSlice';
import { Playlist } from '@/types';
import FilterablePlaylist from '@/app/components/FilterablePlaylist';

interface PlaylistsResponse {
  items: Playlist[];
}

export default function Home() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const storedGooglePlaylists = useSelector((state: RootState) => state.playlists.google);
  const [googlePlaylists, setGooglePlaylistsClient] = useState<Playlist[]>([]);

  useEffect(() => {
    if (!isAuth) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchPlaylists = async () => {
      if (googleTokens?.access_token && Object.keys(storedGooglePlaylists).length === 0) {
        try {
          const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${googleTokens.access_token}`,
              'Accept': 'application/json',
            },
          });

          if (res.ok) {
            const data: PlaylistsResponse = await res.json();
            setGooglePlaylistsClient(data.items || []);

            // Store the playlists in Redux, ensuring each playlist has its ID and an empty songs array
            const playlistsWithSongs = data.items.map((playlist) => ({
              ...playlist,
              songs: [], // Initialize songs array
            }));

            dispatch(setGooglePlaylists(playlistsWithSongs));
          } else {
            console.error('Failed to fetch playlists:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }
      } else {
        // Set playlists from Redux if already fetched
        setGooglePlaylistsClient(Object.values(storedGooglePlaylists));
      }
    };

    fetchPlaylists();
  }, [isAuth, router, googleTokens, dispatch, storedGooglePlaylists]);

  if (!isAuth) {
    return null;
  }

  return (
    <div className="p-8 bg-base-300">
      <FilterablePlaylist googlePlaylists={googlePlaylists} spotifyPlaylists={[]} />
    </div>
  );
}
