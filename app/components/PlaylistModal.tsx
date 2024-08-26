import React, { useEffect, useState } from 'react';
import { Playlist, Song } from '@/types';
import { useGoogleContext } from '@/contexts/GoogleContext';
import { useSpotifyContext } from '@/contexts/SpotifyContext';

interface PlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose }) => {
  const { fetchSongsForPlaylist: fetchGoogleSongs } = useGoogleContext();
  const { fetchSongsForPlaylist: fetchSpotifySongs } = useSpotifyContext();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const loadSongs = async () => {
      if (playlist.source === 'google') {
        const fetchedSongs = await fetchGoogleSongs(playlist.id);
        console.log(fetchedSongs)
        setSongs(fetchedSongs);
      } else if (playlist.source === 'spotify') {
        const fetchedSongs = await fetchSpotifySongs(playlist.id);
        setSongs(fetchedSongs);
      }
      setLoading(false);
    };

    loadSongs();
  }, [playlist]);

  if (!playlist) return null;

  return (
    <>
      <input type="checkbox" id="playlist-modal" className="modal-toggle" />
      <div className="modal modal-open p-6">
        <div className="modal-box relative max-w-2xl w-full p-4">
          <label htmlFor="playlist-modal" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>
            ✕
          </label>
          <div className="flex items-start mb-4">
            <img
              src={playlist.thumbnails.medium || playlist.thumbnails.default}
              alt={playlist.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-bold text-base-content">{playlist.title}</h3>
              <p className="text-sm text-gray-500">{playlist.description}</p>
            </div>
          </div>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : songs && songs.length > 0 ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto border-t border-base-200 pt-2">
              {songs.map((song, index) => (
                <li key={song.id} className="text-base-content">
                  <b>{song.title}</b> by {song.artist}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No songs available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistModal;
