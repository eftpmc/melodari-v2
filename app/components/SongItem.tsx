import React, { useState } from 'react';
import { Song } from '@/types';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { motion } from 'framer-motion';

interface SongItemProps {
  song: Song;
  index: number;
  isOpen: boolean;
  onClick: () => void;
}

const SongItem: React.FC<SongItemProps> = ({ song, index, isOpen, onClick }) => {
  return (
    <li className="text-base-content p-2 hover:bg-base-200 rounded-md">
      <div className="flex justify-between items-center cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-sm font-semibold">{index + 1}.</span>
          <span className="text-sm font-semibold truncate">{song.title}</span>
          <span className="text-sm text-gray-500 truncate">by {song.artist}</span>
        </div>
        <BsThreeDotsVertical className="text-base-content" />
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <ul className="menu p-2 rounded-box">
          <li><a>Play</a></li>
          <li><a>Add to Queue</a></li>
          <li><a>Add to Playlist</a></li>
        </ul>
      </motion.div>
    </li>
  );
};

export default SongItem;