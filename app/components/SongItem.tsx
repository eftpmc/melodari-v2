import React from 'react';
import { Song } from '@/types';
import { motion } from 'framer-motion';

interface SongItemProps {
  song: Song;
  index: number;
  isOpen: boolean;
  onClick: () => void;
}

const SongItem: React.FC<SongItemProps> = ({ song, index, isOpen, onClick }) => {
  const thumbnailUrl =
    song.platform === 'spotify' ? song.thumbnails.high : song.thumbnails.medium;

  return (
    <li className="text-base-content p-2 hover:bg-base-200 rounded-md">
      <div className="flex justify-between items-center cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-2 w-full">
          <img 
            src={thumbnailUrl} 
            alt={song.title} 
            className="w-12 h-12 object-cover rounded-md mr-4" 
          />
          <div className="flex-1 flex flex-col">
            <span className="font-semibold text-base-content truncate">
              {song.title}
            </span>
            <span className="text-sm text-base-content opacity-60 truncate">
              {song.artist}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content when song item is clicked */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <ul className="menu p-2">
          <li><a>Play</a></li>
          <li><a>Add to Queue</a></li>
          <li><a>Add to Playlist</a></li>
        </ul>
      </motion.div>
    </li>
  );
};

export default SongItem;