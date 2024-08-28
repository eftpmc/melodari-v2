"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Playlist } from '@/types';
import PlaylistCard from './PlaylistCard';
import PlaylistModal from './PlaylistModal';

interface FilterablePlaylistProps {
  googlePlaylists: Playlist[];
  spotifyPlaylists: Playlist[];
}

export default function FilterablePlaylist({ googlePlaylists = [], spotifyPlaylists = [] }: FilterablePlaylistProps) {
  const [filter, setFilter] = useState<'All' | 'YouTube Music' | 'Spotify'>('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [playCounts, setPlayCounts] = useState<{ [id: string]: number }>({});

  const { getPlayCount, incrementPlayCount } = useAuth();

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

  const sortedGooglePlaylists = useMemo(() => {
    return googlePlaylists.map(playlist => ({
      ...playlist,
      playCount: playCounts[playlist.id] || 0,
    })).sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [googlePlaylists, playCounts]);

  const sortedSpotifyPlaylists = useMemo(() => {
    return spotifyPlaylists.map(playlist => ({
      ...playlist,
      playCount: playCounts[playlist.id] || 0,
    })).sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [spotifyPlaylists, playCounts]);

  const filteredPlaylists = useMemo(() => {
    switch (filter) {
      case 'YouTube Music':
        return sortedGooglePlaylists;
      case 'Spotify':
        return sortedSpotifyPlaylists;
      case 'All':
      default:
        return [...sortedGooglePlaylists, ...sortedSpotifyPlaylists];
    }
  }, [filter, sortedGooglePlaylists, sortedSpotifyPlaylists]);

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
        <PlaylistModal playlist={selectedPlaylist} onClose={closeModal} />
      )}
    </div>
  );
}