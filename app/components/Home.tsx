"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { setGooglePlaylists, setSpotifyPlaylists } from '@/utils/redux/playlistSlice';
import { Playlist } from '@/types';
import FilterablePlaylist from '@/app/components/FilterablePlaylist';

interface PlaylistsResponse {
  items: any[]; // Temporarily using any for response typing
}

export default function Home() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
  const storedGooglePlaylists = useSelector((state: RootState) => state.playlists.google);
  const storedSpotifyPlaylists = useSelector((state: RootState) => state.playlists.spotify); 

  const [googlePlaylists, setGooglePlaylistsClient] = useState<Playlist[]>([]);
  const [spotifyPlaylists, setSpotifyPlaylistsClient] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth) {
      router.push('/login');
      return;
    }

    const fetchGooglePlaylists = async () => {
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
            const transformedPlaylists = data.items.map((playlist) => ({
              id: playlist.id,
              title: playlist.snippet.title,
              description: playlist.snippet.description,
              thumbnails: {
                default: playlist.snippet.thumbnails.default.url,
                medium: playlist.snippet.thumbnails.medium.url,
                high: playlist.snippet.thumbnails.high.url,
              },
              songs: [], // Initialize songs array, you will fetch these later
            }));
            setGooglePlaylistsClient(transformedPlaylists);
            dispatch(setGooglePlaylists(transformedPlaylists));
          } else {
            console.error('Failed to fetch Google playlists:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching Google playlists:', error);
        }
      } else {
        setGooglePlaylistsClient(Object.values(storedGooglePlaylists));
      }
    };

    const fetchSpotifyPlaylists = async () => {
      if (spotifyTokens?.access_token && Object.keys(storedSpotifyPlaylists).length === 0) {
        try {
          const res = await fetch('https://api.spotify.com/v1/me/playlists', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${spotifyTokens.access_token}`,
              'Accept': 'application/json',
            },
          });

          if (res.ok) {
            const data: PlaylistsResponse = await res.json();
            const transformedPlaylists = data.items.map((playlist) => ({
              id: playlist.id,
              title: playlist.name,
              description: playlist.description,
              thumbnails: {
                default: playlist.images[0]?.url || '',
                medium: playlist.images[0]?.url || '',
                high: playlist.images[0]?.url || '',
              },
              songs: [], // Initialize songs array, you will fetch these later
            }));

            setSpotifyPlaylistsClient(transformedPlaylists);
            dispatch(setSpotifyPlaylists(transformedPlaylists));
          } else {
            console.error('Failed to fetch Spotify playlists:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching Spotify playlists:', error);
        }
      } else {
        setSpotifyPlaylistsClient(Object.values(storedSpotifyPlaylists));
      }
    };

    // Fetch both Google and Spotify playlists and stop loading
    Promise.all([fetchGooglePlaylists(), fetchSpotifyPlaylists()]).finally(() => setLoading(false));
  }, [isAuth, router, googleTokens, spotifyTokens, storedGooglePlaylists, storedSpotifyPlaylists]);

  if (loading) {
    return (
      <div className="py-8 bg-base-300">
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-base-200 skeleton" />
          <div className="h-8 w-1/2 bg-base-200 skeleton" />
          <div className="h-8 w-full bg-base-200 skeleton" />
          <div className="h-8 w-5/6 bg-base-200 skeleton" />
          <div className="h-8 w-4/5 bg-base-200 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-base-300">
      <FilterablePlaylist googlePlaylists={googlePlaylists} spotifyPlaylists={spotifyPlaylists} />
    </div>
  );
}
