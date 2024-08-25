"use client";

import { useState } from 'react';
import { Playlist } from '@/types';
import PlaylistCard from './PlaylistCard';
import PlaylistModal from './PlaylistModal';

interface FilterablePlaylistProps {
  googlePlaylists: Playlist[];
  spotifyPlaylists: Playlist[];
}

export default function FilterablePlaylist({ googlePlaylists, spotifyPlaylists }: FilterablePlaylistProps) {
  const [filter, setFilter] = useState<'All' | 'YouTube Music' | 'Spotify'>('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const getFilteredPlaylists = () => {
    if (filter === 'YouTube Music') {
      return googlePlaylists;
    } else if (filter === 'Spotify') {
      return spotifyPlaylists;
    } else {
      return [...googlePlaylists, ...spotifyPlaylists];
    }
  };

  const filteredPlaylists = getFilteredPlaylists();

  const openModal = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  const closeModal = () => {
    setSelectedPlaylist(null);
  };

  return (
    <div className="p-8">
      <div className="flex space-x-4 mb-4">
        <span className={`badge cursor-pointer ${filter === 'All' ? 'badge-primary' : ''}`} onClick={() => setFilter('All')}>
          All
        </span>
        <span className={`badge cursor-pointer ${filter === 'YouTube Music' ? 'badge-primary' : ''}`} onClick={() => setFilter('YouTube Music')}>
          YouTube Music
        </span>
        <span className={`badge cursor-pointer ${filter === 'Spotify' ? 'badge-primary' : ''}`} onClick={() => setFilter('Spotify')}>
          Spotify
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaylists.length > 0 ? (
          filteredPlaylists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onClick={() => openModal(playlist)}  // Provide the onClick prop
            />
          ))
        ) : (
          <div className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2 flex items-center text-base-content">No playlists found.</div>
        )}
      </div>

      {selectedPlaylist && (
        <PlaylistModal playlist={selectedPlaylist} onClose={closeModal} />
      )}
    </div>
  );
}
