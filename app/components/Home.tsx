"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleContext } from '@/contexts/GoogleContext';
import { useSpotifyContext } from '@/contexts/SpotifyContext';
import FilterablePlaylist from '@/app/components/FilterablePlaylist';

export default function Home() {
  const router = useRouter();
  const { isGoogleAuth, playlists: googlePlaylists } = useGoogleContext();
  const { isSpotifyAuth, playlists: spotifyPlaylists } = useSpotifyContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isGoogleAuth && !isSpotifyAuth) {
      router.push('/login');
      return;
    }

    // Once both contexts have loaded their playlists, we can stop showing the loading state
    setLoading(false);
  }, [isGoogleAuth, isSpotifyAuth, router]);

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
    <div className="py-4 bg-base-300">
      <FilterablePlaylist/>
    </div>
  );
}