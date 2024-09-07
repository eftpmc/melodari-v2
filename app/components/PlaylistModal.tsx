import React, { useState, useEffect } from 'react';
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
  onStartLoading: () => void;
  onFinishLoading: () => void;
}

const platformsData = [
  { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="w-6 h-6 text-green-600" /> },
  { id: 'google', name: 'YouTube Music', icon: <SiYoutubemusic className="w-6 h-6 text-red-600" /> },
];

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose, onStartLoading, onFinishLoading }) => {
  const { playlists: googlePlaylists, fetchSongsForPlaylist: fetchGoogleSongs, findGooglePlaylist, createGooglePlaylist, matchSongsOnGoogle, addSongsToGooglePlaylist, refreshPlaylists: refreshGooglePlaylists } = useGooglePlaylistContext();
  const { playlists: spotifyPlaylists, fetchSongsForPlaylist: fetchSpotifySongs, findSpotifyPlaylist, createSpotifyPlaylist, matchSongsOnSpotify, addSongsToSpotifyPlaylist, refreshPlaylists: refreshSpotifyPlaylists } = useSpotifyPlaylistContext();
  const { isGoogleAuth } = useGoogleAuthContext();
  const { isSpotifyAuth } = useSpotifyAuthContext();

  const [loading, setLoading] = useState({ google: true, spotify: true });
  const [songs, setSongs] = useState<{ google: Song[], spotify: Song[] }>({ google: [], spotify: [] });
  const [openSongIndex, setOpenSongIndex] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  useEffect(() => {
    loadSongsForBothPlatforms();
  }, [playlist]);

  const getPlaylistIdForPlatform = (platform: 'google' | 'spotify'): string | null => {
    const playlists = platform === 'google' ? googlePlaylists : spotifyPlaylists;
    return playlists.find(p => p.title === playlist.title)?.id || null;
  };

  const loadSongsForBothPlatforms = async () => {
    setLoading({ google: true, spotify: true });

    const googleId = getPlaylistIdForPlatform('google');
    const spotifyId = getPlaylistIdForPlatform('spotify');

    const googleSongsPromise = googleId ? fetchGoogleSongs(googleId) : Promise.resolve([]);
    const spotifySongsPromise = spotifyId ? fetchSpotifySongs(spotifyId) : Promise.resolve([]);

    try {
      const [googleSongs, spotifySongs] = await Promise.all([googleSongsPromise, spotifySongsPromise]);
      setSongs({ google: googleSongs, spotify: spotifySongs });

      if (spotifySongs.length > 0) {
        setActivePlatform('spotify');
      } else if (googleSongs.length > 0) {
        setActivePlatform('google');
      } else {
        setActivePlatform(null);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs. Please try again.');
    } finally {
      setLoading({ google: false, spotify: false });
    }
  };

  const handleSongClick = (index: number) => {
    setOpenSongIndex(openSongIndex === index ? null : index);
  };

  const handleAddPlatform = async (platformId: 'google' | 'spotify') => {
    if (songs[platformId].length > 0) return; // Platform already added

    onStartLoading(); // Trigger loading state
    setLoading(prev => ({ ...prev, [platformId]: true }));

    try {
      let newPlaylist;
      let matchedSongs;

      if (platformId === 'google') {
        newPlaylist = await findGooglePlaylist(playlist.title) || await createGooglePlaylist(playlist.title, playlist.description || '');
        if (newPlaylist) {
          matchedSongs = await matchSongsOnGoogle(songs.spotify);
          await addSongsToGooglePlaylist(newPlaylist.id, matchedSongs);
          const fetchedSongs = await fetchGoogleSongs(newPlaylist.id);
          setSongs(prev => ({ ...prev, google: fetchedSongs }));
          toast.success('Added to YouTube Music successfully!');
        }
      } else if (platformId === 'spotify') {
        newPlaylist = await findSpotifyPlaylist(playlist.title) || await createSpotifyPlaylist(playlist.title, playlist.description || '');
        if (newPlaylist) {
          matchedSongs = await matchSongsOnSpotify(songs.google);
          await addSongsToSpotifyPlaylist(newPlaylist.id, matchedSongs);
          const fetchedSongs = await fetchSpotifySongs(newPlaylist.id);
          setSongs(prev => ({ ...prev, spotify: fetchedSongs }));
          toast.success('Added to Spotify successfully!');
        }
      }

      if (newPlaylist) {
        setActivePlatform(platformId);
        await refreshGooglePlaylists();
        await refreshSpotifyPlaylists();
      }
    } catch (error) {
      console.error('Error adding platform:', error);
      toast.error('Failed to add platform. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [platformId]: false }));
      onFinishLoading(); // Finish loading state
    }
  };

  const availablePlatforms = platformsData.filter(
    (platform) => songs[platform.id as 'google' | 'spotify'].length === 0 &&
      ((platform.id === 'google' && isGoogleAuth) ||
        (platform.id === 'spotify' && isSpotifyAuth))
  );

  const activeSongs = activePlatform ? songs[activePlatform as 'google' | 'spotify'] : [];

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
            <img
              src={playlist.thumbnails.medium || playlist.thumbnails.default}
              alt={playlist.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-bold text-base-content">
                {playlist.title}
              </h3>
              <p className="text-sm text-gray-500">
                {playlist.accountName}
              </p>
              <p className="text-sm text-gray-500">{playlist.description}</p>
              <div className="flex items-center mt-4 space-x-2">
                {platformsData.map((platform) => {
                  const hasSongs = songs[platform.id as 'spotify' | 'google'].length > 0;
                  return hasSongs ? (
                    <button
                      key={platform.id}
                      className={`btn btn-sm ${activePlatform === platform.id ? 'bg-base-content hover:bg-base-content' : ''
                        }`}
                      onClick={() => setActivePlatform(platform.id)}
                    >
                      {React.cloneElement(platform.icon, {
                        className: `${platform.icon.props.className}
                          }`
                      })}
                    </button>
                  ) : null;
                })}
                {availablePlatforms.length > 0 && (
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-circle btn-sm group">
                      <Plus className="w-4 h-4 transition-transform duration-200 ease-in-out group-hover:scale-110" />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 mt-2">
                      {availablePlatforms.map((platform) => (
                        <li key={platform.id}>
                          <button
                            className="flex items-center space-x-2 p-2 hover:bg-base-100 rounded w-full text-left text-base-content"
                            onClick={() => handleAddPlatform(platform.id as 'google' | 'spotify')}
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
            </div>
          </div>
          {loading.google || loading.spotify ? (
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
          ) : activeSongs.length > 0 ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto border-t border-base-200 pt-2 overflow-x-hidden">
              {activeSongs.map((song, index) => (
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
            <p className="text-center">No songs available for the selected platform</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistModal;