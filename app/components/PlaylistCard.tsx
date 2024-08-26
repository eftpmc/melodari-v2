import React from 'react';
import { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void; // Handle opening the modal
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <label
      htmlFor="playlist-modal"
      className="bg-base-100 p-4 rounded-lg shadow-md w-contain m-1 flex items-center cursor-pointer"
      onClick={onClick} // Open the modal when the card is clicked
    >
      {playlist.thumbnails.medium && (
        <img
          src={playlist.thumbnails.medium}
          alt={playlist.title}
          className="w-12 h-12 object-cover rounded-lg"
        />
      )}
      <div className="ml-4 flex-1">
        <div className="text-base-content font-semibold">{playlist.title}</div>
        <div className="text-sm text-gray-500">{/* Additional Info (e.g., Author) */}</div>
      </div>
    </label>
  );
};

export default PlaylistCard;
