"use client";

import React, { useEffect, useState } from 'react';
import { Playlist, Song } from '@/types';
import { useGooglePlaylistContext } from '@/contexts/google/GooglePlaylistContext';
import { useSpotifyPlaylistContext } from '@/contexts/spotify/SpotifyPlaylistContext';
import { useGoogleAuthContext } from '@/contexts/google/GoogleAuthContext';
import { useSpotifyAuthContext } from '@/contexts/spotify/SpotifyAuthContext';
import SongItem from './SongItem';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
}

const platformsData = [
  { id: 'google', name: 'YouTube Music', icon: <SiYoutubemusic className="text-red-600 w-6 h-6" /> },
  { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="text-green-600 w-6 h-6" /> },
  // Add more platforms as needed
];

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose }) => {
  const { fetchSongsForPlaylist: fetchGoogleSongs, findGooglePlaylist, createGooglePlaylist, matchSongsOnGoogle, addSongsToGooglePlaylist, refreshPlaylists: refreshGooglePlaylists } = useGooglePlaylistContext();
  const { fetchSongsForPlaylist: fetchSpotifySongs, findSpotifyPlaylist, createSpotifyPlaylist, matchSongsOnSpotify, addSongsToSpotifyPlaylist, refreshPlaylists: refreshSpotifyPlaylists } = useSpotifyPlaylistContext();
  const { isGoogleAuth } = useGoogleAuthContext();
  const { isSpotifyAuth } = useSpotifyAuthContext();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [openSongIndex, setOpenSongIndex] = useState<number | null>(null);

  const refreshAllPlaylists = async () => {
    setLoading(true);
    await refreshGooglePlaylists();
    await refreshSpotifyPlaylists();
    setLoading(false);
  };

  useEffect(() => {
    const loadSongs = async () => {
      if (playlist.source.includes('google')) {
        const fetchedSongs = await fetchGoogleSongs(playlist.id);
        setSongs(fetchedSongs);
      } else if (playlist.source.includes('spotify')) {
        const fetchedSongs = await fetchSpotifySongs(playlist.id);
        setSongs(fetchedSongs);
      }
      setLoading(false);
    };

    loadSongs();
  }, [playlist]);

  const handleSongClick = (index: number) => {
    setOpenSongIndex(openSongIndex === index ? null : index);
  };

  const handleAddPlatform = async (platformId: string) => {
    if (playlist.platforms.includes(platformId)) return;

    setLoading(true);

    try {
        if (platformId === 'google') {
            let googlePlaylist = await findGooglePlaylist(playlist.title);

            if (!googlePlaylist) {
                googlePlaylist = await createGooglePlaylist(playlist.title, playlist.description);
            }

            if (googlePlaylist) {
                const matchedSongs = await matchSongsOnGoogle(songs);
                await addSongsToGooglePlaylist(googlePlaylist.id, matchedSongs);
                playlist.platforms.push('google'); // Add to platforms
                toast.success('Added to YouTube Music successfully!');
            }
        }

        if (platformId === 'spotify') {
            let spotifyPlaylist = await findSpotifyPlaylist(playlist.title);

            if (!spotifyPlaylist) {
                spotifyPlaylist = await createSpotifyPlaylist(playlist.title, playlist.description);
            }

            if (spotifyPlaylist) {
                const matchedSongs = await matchSongsOnSpotify(songs);
                await addSongsToSpotifyPlaylist(spotifyPlaylist.id, matchedSongs);
                playlist.platforms.push('spotify'); // Add to platforms
                toast.success('Added to Spotify successfully!');
            }
        }

        await refreshAllPlaylists();

    } catch (error) {
        console.error('Error adding platform:', error);
        toast.error('Failed to add platform. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const availablePlatforms = platformsData.filter(
    (platform) => !playlist.platforms.includes(platform.id) && 
                  ((platform.id === 'google' && isGoogleAuth) || 
                   (platform.id === 'spotify' && isSpotifyAuth))
  );

  if (!playlist) return null;

  return (
    <>
      <input type="checkbox" id="playlist-modal" className="modal-toggle" />
      <div className="modal modal-open p-6">
        <div className="modal-box relative max-w-2xl w-full p-4">
          <label
            htmlFor="playlist-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <div className="flex items-start mb-4">
            {loading ? (
              <div className="w-24 h-24 bg-base-200 rounded-lg skeleton" />
            ) : (
              <img
                src={playlist.thumbnails.medium || playlist.thumbnails.default}
                alt={playlist.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="ml-4 flex-1">
              {loading ? (
                <>
                  <div className="h-6 bg-base-200 rounded w-3/4 skeleton mb-2" />
                  <div className="h-4 bg-base-200 rounded w-1/2 skeleton mb-1" />
                  <div className="h-4 bg-base-200 rounded w-2/3 skeleton" />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-base-content">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {playlist.accountName}
                  </p>
                  <p className="text-sm text-gray-500">{playlist.description}</p>
                  <div className="flex items-center mt-4 space-x-4">
                    {playlist.platforms.map((platformId) => {
                      const platform = platformsData.find(p => p.id === platformId);
                      return platform ? (
                        <div key={platformId} className="flex items-center">
                          {platform.icon}
                        </div>
                      ) : null;
                    })}
                    {availablePlatforms.length > 0 && (
                      <div className="dropdown">
                        <label tabIndex={0} className="btn btn-outline btn-sm flex items-center">
                          <Plus className="w-4 h-4" />
                          Add Platform
                        </label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 mt-2">
                          {availablePlatforms.map((platform) => (
                            <li key={platform.id}>
                              <button
                                className="flex items-center space-x-2 p-2 hover:bg-base-100 rounded w-full text-left"
                                onClick={() => handleAddPlatform(platform.id)}
                              >
                                {platform.icon}
                                <div className='text-base-content'>{platform.name}</div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {loading ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto border-t border-base-200 pt-2">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <li key={index} className="flex items-center p-2">
                    <div className="h-4 bg-base-200 rounded w-1/4 skeleton" />
                    <div className="h-4 bg-base-200 rounded w-1/2 ml-4 skeleton" />
                  </li>
                ))}
            </ul>
          ) : songs && songs.length > 0 ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto border-t border-base-200 pt-2 overflow-x-hidden">
              {songs.map((song, index) => (
                <SongItem
                  key={song.id}
                  song={song}
                  index={index}
                  isOpen={openSongIndex === index}
                  onClick={() => handleSongClick(index)}
                />
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
