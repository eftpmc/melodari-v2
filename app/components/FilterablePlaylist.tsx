import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import PlaylistCard from './PlaylistCard';
import PlaylistModal from './PlaylistModal';
import { useGooglePlaylistContext } from '@/contexts/google/GooglePlaylistContext';
import { useSpotifyPlaylistContext } from '@/contexts/spotify/SpotifyPlaylistContext';
import { Playlist, Song } from '@/types';

export default function FilterablePlaylist() {
  const [filter, setFilter] = useState<'All' | 'YouTube Music' | 'Spotify'>('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [playCounts, setPlayCounts] = useState<{ [id: string]: number }>({});
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const { getPlayCount, incrementPlayCount } = useProfile();
  const { playlists: googlePlaylists, refreshPlaylists: refreshGooglePlaylists } = useGooglePlaylistContext();
  const { playlists: spotifyPlaylists, refreshPlaylists: refreshSpotifyPlaylists } = useSpotifyPlaylistContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 125);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const fetchPlayCounts = async () => {
      const counts: { [id: string]: number } = {};
      const allPlaylists = [...googlePlaylists, ...spotifyPlaylists];
      for (const playlist of allPlaylists) {
        counts[playlist.id] = await getPlayCount(playlist.id);
      }
      setPlayCounts(counts);
    };

    fetchPlayCounts();
  }, [googlePlaylists, spotifyPlaylists, getPlayCount]);

  const refreshAllPlaylists = async () => {
    setLoading(true);
    await refreshGooglePlaylists();
    await refreshSpotifyPlaylists();
    setLoading(false);
  };

  useEffect(() => {
    refreshAllPlaylists();
  }, []); // This will refresh the playlists when the component mounts

  const combinedPlaylists = useMemo(() => {
    const playlistMap: { [title: string]: Playlist } = {};

    spotifyPlaylists.forEach((playlist) => {
      if (playlistMap[playlist.title]) {
        playlistMap[playlist.title].platforms = Array.from(new Set([...playlistMap[playlist.title].platforms, 'spotify']));
        playlistMap[playlist.title].songs = [...playlistMap[playlist.title].songs, ...playlist.songs];
      } else {
        playlistMap[playlist.title] = {
          ...playlist,
          platforms: ['spotify'],
          songs: [...playlist.songs],
        };
      }
    });

    googlePlaylists.forEach((playlist) => {
      if (playlistMap[playlist.title]) {
        playlistMap[playlist.title].platforms = Array.from(new Set([...playlistMap[playlist.title].platforms, 'google']));
        playlistMap[playlist.title].songs = [...playlistMap[playlist.title].songs, ...playlist.songs];
      } else {
        playlistMap[playlist.title] = {
          ...playlist,
          platforms: ['google'],
          songs: [...playlist.songs],
        };
      }
    });

    return Object.values(playlistMap)
      .map(playlist => ({
        ...playlist,
        platforms: Array.from(new Set([
          ...playlist.platforms,
          ...(playlist.songs.some(song => song.platform === 'google') ? ['google'] : []),
          ...(playlist.songs.some(song => song.platform === 'spotify') ? ['spotify'] : [])
        ]))
      }))
      .sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0));
  }, [googlePlaylists, spotifyPlaylists, playCounts]);

  const filteredPlaylists = useMemo(() => {
    switch (filter) {
      case 'YouTube Music':
        return combinedPlaylists.filter(playlist => playlist.platforms.includes('google'));
      case 'Spotify':
        return combinedPlaylists.filter(playlist => playlist.platforms.includes('spotify'));
      case 'All':
      default:
        return combinedPlaylists;
    }
  }, [filter, combinedPlaylists]);

  const openModal = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    await incrementPlayCount(playlist.id); // Increment play count when playlist is opened
    setPlayCounts(prev => ({
      ...prev,
      [playlist.id]: (prev[playlist.id] || 0) + 1,
    }));
  };

  const closeModal = () => {
    setSelectedPlaylist(null);
  };

  const handleStartLoading = () => {
    closeModal();
    setIsLoadingModalOpen(true);
  };

  const handleFinishLoading = () => {
    setIsLoadingModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex space-x-4 mb-4">
        <span
          className={`badge cursor-pointer ${filter === 'All' ? 'badge-primary' : ''}`}
          onClick={() => setFilter('All')}
        >
          All
        </span>
        <span
          className={`badge cursor-pointer ${filter === 'YouTube Music' ? 'badge-primary' : ''}`}
          onClick={() => setFilter('YouTube Music')}
        >
          YouTube Music
        </span>
        <span
          className={`badge cursor-pointer ${filter === 'Spotify' ? 'badge-primary' : ''}`}
          onClick={() => setFilter('Spotify')}
        >
          Spotify
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-base-200 p-4 rounded-lg shadow-md w-full flex items-center space-x-4">
                <div className="w-12 h-12 bg-base-300 rounded-lg skeleton" />
                <div className="flex-1">
                  <div className="h-6 bg-base-300 rounded skeleton w-3/4" />
                  <div className="h-4 bg-base-300 rounded skeleton w-1/2" />
                </div>
              </div>
            ))
        ) : filteredPlaylists.length > 0 ? (
          filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => openModal(playlist)}
            />
          ))
        ) : (
          <div className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2 flex items-center text-base-content">
            No playlists found.
          </div>
        )}
      </div>

      {selectedPlaylist && (
        <PlaylistModal
          playlist={selectedPlaylist}
          onClose={closeModal}
          onStartLoading={handleStartLoading}
          onFinishLoading={handleFinishLoading}
        />
      )}

      {/* Loading Modal */}
      {isLoadingModalOpen && (
        <dialog id="loading_modal" className="modal modal-middle" open>
          <form method="dialog" className="modal-box">
            <h3 className="font-bold text-lg text-base-content">Converting...</h3>
            <p className="py-4 text-base-content">Please wait while we process your request.</p>
            <progress className="progress w-full"></progress>
          </form>
        </dialog>
      )}
    </div>
  );
}