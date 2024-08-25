import React from 'react';
import { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void; // Add an onClick prop to handle opening the modal
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <div
      className="bg-base-200 p-4 rounded-lg shadow-md w-contain m-1 flex items-center cursor-pointer"
      onClick={onClick} // Open the modal when the card is clicked
    >
      <img
        src={playlist.snippet.thumbnails.medium.url}
        alt={playlist.snippet.title}
        className="w-12 h-12 object-cover rounded-lg"
      />
      <div className="ml-4 flex-1">
        <div className="text-base-content font-semibold">{playlist.snippet.title}</div>
        <div className="text-sm text-gray-500">{/* Additional Info (e.g., Author) */}</div>
      </div>
    </div>
  );
};

export default PlaylistCard;
