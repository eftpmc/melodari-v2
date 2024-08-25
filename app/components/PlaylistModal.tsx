import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { Playlist, Song } from '@/types';
import { setPlaylistSongs } from '@/utils/redux/playlistSlice';

interface PlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Retrieve the Google tokens and songs from the Redux store
  const googleTokens = useSelector((state: RootState) => state.auth.googleTokens);
  const songs = useSelector((state: RootState) => 
    state.playlists.google[playlist.id]?.songs
  );

  useEffect(() => {
    const fetchSongs = async () => {    
        console.log(playlist.id)
      if (!googleTokens) {
        console.error("Google tokens are null");
        return;
      }

      if (songs && songs.length === 0) {
        try {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}&maxResults=50`, 
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${googleTokens.access_token}`,
                Accept: 'application/json',
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const fetchedSongs: Song[] = data.items.map((item: any) => ({
              id: item.id,
              snippet: item.snippet,
            }));

            // Store the songs in Redux
            dispatch(setPlaylistSongs({ playlistId: playlist.id, songs: fetchedSongs }));
          } else {
            console.error('Failed to fetch playlist items:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching playlist items:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [dispatch, playlist.id, songs, googleTokens]);

  if (!playlist) return null;

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
                {index + 1}. {song.title}
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
