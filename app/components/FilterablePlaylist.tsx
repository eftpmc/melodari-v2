import { useState } from 'react';
import { PlaylistItem } from '@/types';

interface FilterablePlaylistProps {
  googlePlaylists: PlaylistItem[];
  spotifyPlaylists: PlaylistItem[];
}

export default function FilterablePlaylist({ googlePlaylists, spotifyPlaylists }: FilterablePlaylistProps) {
  const [filter, setFilter] = useState<'All' | 'YouTube Music' | 'Spotify'>('All');

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
      <div className="mt-4">
        {filteredPlaylists.length > 0 ? (
          filteredPlaylists.map((playlist) => (
            <div key={playlist.id} className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2 flex items-center">
              <img
                src={playlist.snippet.thumbnails.medium.url}
                alt={playlist.snippet.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="ml-4 flex-1">
                <div className="text-base-content font-semibold">{playlist.snippet.title}</div>
                <div className="text-sm text-gray-500">{/* Author Name (if available) */}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2 flex items-center text-base-content">No playlists found.</div>
        )}
      </div>
    </div>
  );
}
