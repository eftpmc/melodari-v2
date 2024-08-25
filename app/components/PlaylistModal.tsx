import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { Playlist, Song } from '@/types';
import { fetchGooglePlaylistSongs } from '@/utils/google/googleService';
import { fetchSpotifyPlaylistSongs } from '@/utils/spotify/spotifyService';

interface PlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Retrieve tokens and songs from the Redux store
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const spotifyTokens = useSelector((state: RootState) => state.auth.spotifyTokens);
  const googleSongs = useSelector((state: RootState) => state.playlists.google[playlist.id]?.songs);
  const spotifySongs = useSelector((state: RootState) => state.playlists.spotify[playlist.id]?.songs);

  useEffect(() => {
    const loadSongs = async () => {
      if (googleTokens) {
        await fetchGooglePlaylistSongs(googleTokens.access_token, playlist.id, dispatch);
      } else if (spotifyTokens) {
        await fetchSpotifyPlaylistSongs(spotifyTokens.access_token, playlist.id, dispatch);
      }
      setLoading(false);
    };

    loadSongs();
  }, [dispatch, playlist.id, googleSongs, spotifySongs, googleTokens, spotifyTokens]);

  if (!playlist) return null;

  const songs = googleTokens ? googleSongs : spotifyTokens ? spotifySongs : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-base-content">{playlist.title}</h2>
          <button onClick={onClose} className="text-base-content text-xl">&times;</button>
        </div>
        <img
          src={playlist.thumbnails.high}
          alt={playlist.title}
          className="w-full h-auto object-cover rounded-lg mb-4"
        />
        {loading ? (
          <p className="text-center text-base-content">Loading...</p>
        ) : songs && songs.length > 0 ? (
          <ul className="space-y-2">
            {songs.map((song, index) => (
              <li key={song.id} className="text-base-content">
                {index + 1}. {song.title} {song.artists ? `by ${song.artists.join(', ')}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-base-content">No songs available</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
