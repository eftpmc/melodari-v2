import { Dispatch } from 'redux';
import { Playlist } from '@/types';
import { setSpotifyPlaylists, setPlaylistSongs } from '@/utils/redux/playlistSlice';

interface PlaylistsResponse {
  items: any[];
}

interface SongsResponse {
  items: any[];
}

// Function to fetch Spotify playlists
export const fetchSpotifyPlaylists = async (
  accessToken: string,
  storedSpotifyPlaylists: { [key: string]: Playlist },
  dispatch: Dispatch
): Promise<void> => {
  if (accessToken && Object.keys(storedSpotifyPlaylists).length === 0) {
    try {
      const res = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data: PlaylistsResponse = await res.json();
        const transformedPlaylists = data.items.map((playlist) => ({
          id: playlist.id,
          title: playlist.name,
          description: playlist.description,
          thumbnails: {
            default: playlist.images[0]?.url || '',
            medium: playlist.images[0]?.url || '',
            high: playlist.images[0]?.url || '',
          },
          songs: [],
        }));
        dispatch(setSpotifyPlaylists(transformedPlaylists));
      } else {
        console.error('Failed to fetch Spotify playlists:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching Spotify playlists:', error);
    }
  }
};

// Function to fetch songs for a specific Spotify playlist
export const fetchSpotifyPlaylistSongs = async (
  accessToken: string,
  playlistId: string,
  dispatch: Dispatch
): Promise<void> => {
  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data: SongsResponse = await res.json();
      const fetchedSongs = data.items.map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        thumbnails: {
          default: item.track.album.images[0]?.url || '',
          medium: item.track.album.images[0]?.url || '',
          high: item.track.album.images[0]?.url || '',
        },
        artists: item.track.artists.map((artist: any) => artist.name),
      }));
      dispatch(setPlaylistSongs({ playlistId, songs: fetchedSongs }));
    } else {
      console.error('Failed to fetch playlist songs:', res.statusText);
    }
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
  }
};
