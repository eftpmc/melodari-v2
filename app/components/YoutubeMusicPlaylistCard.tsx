import { useState } from 'react';
import { PlaylistItem } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface YoutubeMusicPlaylistCardProps {
  playlists: PlaylistItem[];
}

export default function YoutubeMusicPlaylistCard({ playlists }: YoutubeMusicPlaylistCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2" >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-lg font-semibold text-base-content">Youtube Music Playlists</div>
          <span className={`ml-2 badge ${playlists.length > 0 ? 'badge-success' : 'badge-error'}`}>
            {playlists.length > 0 ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {playlists.length > 0 && (
          <button onClick={toggleOpen} className="focus:outline-none">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-6 h-6 text-base-content" />
            </motion.div>
          </button>
        )}
      </div>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 divide-y divide-primary">
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
      </motion.div>
    </div>
  );
}
