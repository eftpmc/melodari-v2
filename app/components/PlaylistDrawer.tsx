import React, { useState } from 'react';
import { Song, Playlist } from '@/types';
import { useGooglePlaylistContext } from '@/contexts/google/GooglePlaylistContext';
import { useSpotifyPlaylistContext } from '@/contexts/spotify/SpotifyPlaylistContext';
import { toast } from 'react-hot-toast';

interface PlaylistDrawerProps {
  song: Song;
  onClose: () => void;
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ song, onClose }) => {
  const { playlists: googlePlaylists, addSongsToGooglePlaylist } = useGooglePlaylistContext();
  const { playlists: spotifyPlaylists, addSongsToSpotifyPlaylist } = useSpotifyPlaylistContext();
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]); // Store selected playlists

  const allPlaylists = [...googlePlaylists, ...spotifyPlaylists]; // Combine Google and Spotify playlists

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId) // Deselect if already selected
        : [...prev, playlistId] // Add to selected if not already selected
    );
  };

  const handleAddToPlaylists = async () => {
    try {
      for (const playlistId of selectedPlaylists) {
        const playlist = allPlaylists.find((p) => p.id === playlistId);
        if (playlist?.source === 'google') {
          await addSongsToGooglePlaylist(playlistId, [song]); // Add song to Google playlist
        } else if (playlist?.source === 'spotify') {
          await addSongsToSpotifyPlaylist(playlistId, [song]); // Add song to Spotify playlist
        }
      }
      onClose(); // Close the drawer after adding
      toast.success('Song added to selected playlists!');
    } catch (error) {
      console.error('Error adding song to playlists:', error);
      toast.error('Failed to add song to playlists.');
    }
  };

  return (
    <div className="drawer drawer-end">
      <input id="playlist-drawer" type="checkbox" className="drawer-toggle" checked />
      <div className="drawer-content">
        {/* Drawer content */}
        <label htmlFor="playlist-drawer" className="drawer-overlay" onClick={onClose}></label>
        <div className="p-4 bg-base-100 shadow-lg rounded-lg w-80">
          <h3 className="text-lg font-bold mb-4">Add "{song.title}" to Playlists</h3>
          <ul className="menu">
            {allPlaylists.map((playlist: Playlist) => (
              <li key={playlist.id}>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPlaylists.includes(playlist.id)}
                    onChange={() => handlePlaylistSelect(playlist.id)}
                  />
                  <span>{playlist.title}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4 space-x-2">
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddToPlaylists}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDrawer;