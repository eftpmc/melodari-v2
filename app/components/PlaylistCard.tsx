import React from 'react';
import { Playlist } from '@/types';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void; // Handle opening the modal
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  // Determine the icon based on the source of the playlist
  const icon =
    playlist.source === 'spotify' ? (
      <FaSpotify className="text-green-500 w-6 h-6" />
    ) : (
      <SiYoutubemusic className="text-red-500 w-6 h-6" />
    );

  return (
    <label
      htmlFor="playlist-modal"
      className="bg-base-100 p-4 rounded-lg shadow-md w-contain flex items-center cursor-pointer"
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
        <div className="text-sm text-gray-500">{playlist.accountName}</div> {/* Additional Info */}
      </div>
      <div className="ml-4">{icon}</div> {/* Icon added here */}
    </label>
  );
};

export default PlaylistCard;