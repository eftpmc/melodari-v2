import React from 'react';
import { PlaylistItem } from '@/types';

interface PlaylistCardProps {
  playlist: PlaylistItem;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md w-contain m-1 flex items-center">
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
  );
};

export default PlaylistCard;
