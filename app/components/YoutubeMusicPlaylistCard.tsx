import { useState } from 'react';
import { PlaylistItem } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface YouTubeMusicPlaylistCardProps {
  playlists: PlaylistItem[];
}

export default function YouTubeMusicPlaylistCard({ playlists }: YouTubeMusicPlaylistCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md w-full">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-base-content">YouTube Music Playlists</div>
        <button onClick={toggleOpen} className="focus:outline-none">
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>
      {isOpen && (
        <div className="mt-4">
          <div className="divide-y divide-gray-300">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center py-2">
                  <img
                    src={playlist.snippet.thumbnails.medium.url}
                    alt={playlist.snippet.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="ml-4 flex-1">
                    <div className="text-base-content">{playlist.snippet.title}</div>
                    <div className="text-sm text-gray-500">{/* Author Name (if available) */}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-base-content">No playlists found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
