import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { fetchGooglePlaylists } from '@/utils/google/googleService';
import { fetchSpotifyPlaylists } from '@/utils/spotify/spotifyService';
import FilterablePlaylist from '@/app/components/FilterablePlaylist';
import { Playlist } from '@/types';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
  const storedGooglePlaylists = useSelector((state: RootState) => state.playlists.google);
  const storedSpotifyPlaylists = useSelector((state: RootState) => state.playlists.spotify); 

  const [googlePlaylists, setGooglePlaylists] = useState<Playlist[]>([]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!googleTokens && !spotifyTokens) {
      router.push('/login');
      return;
    }

    const loadPlaylists = async () => {
      if (googleTokens) {
        await fetchGooglePlaylists(googleTokens.access_token, storedGooglePlaylists, dispatch);
        setGooglePlaylists(Object.values(storedGooglePlaylists));
      }

      if (spotifyTokens) {
        await fetchSpotifyPlaylists(spotifyTokens.access_token, storedSpotifyPlaylists, dispatch);
        setSpotifyPlaylists(Object.values(storedSpotifyPlaylists));
      }

      setLoading(false);
    };

    loadPlaylists();
  }, [googleTokens, spotifyTokens, router, dispatch, storedGooglePlaylists, storedSpotifyPlaylists]);

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
      <FilterablePlaylist 
        googlePlaylists={googlePlaylists} 
        spotifyPlaylists={spotifyPlaylists} 
      />
    </div>
  );
}
