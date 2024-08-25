import { Dispatch } from 'redux';
import { Playlist } from '@/types';
import { setGooglePlaylists, setPlaylistSongs } from '@/utils/redux/playlistSlice';

interface PlaylistsResponse {
  items: any[];
}

interface SongsResponse {
  items: any[];
}

// Function to fetch Google playlists
export const fetchGooglePlaylists = async (
  accessToken: string,
  storedGooglePlaylists: { [key: string]: Playlist },
  dispatch: Dispatch
): Promise<void> => {
  if (accessToken && Object.keys(storedGooglePlaylists).length === 0) {
    try {
      const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
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
          title: playlist.snippet.title,
          description: playlist.snippet.description,
          thumbnails: {
            default: playlist.snippet.thumbnails.default.url,
            medium: playlist.snippet.thumbnails.medium.url,
            high: playlist.snippet.thumbnails.high.url,
          },
          songs: [],
        }));
        dispatch(setGooglePlaylists(transformedPlaylists));
      } else {
        console.error('Failed to fetch Google playlists:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching Google playlists:', error);
    }
  }
};

// Function to fetch songs for a specific Google playlist
export const fetchGooglePlaylistSongs = async (
  accessToken: string,
  playlistId: string,
  dispatch: Dispatch
): Promise<void> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (res.ok) {
      const data: SongsResponse = await res.json();
      const fetchedSongs = data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnails: {
          default: item.snippet.thumbnails.default.url,
          medium: item.snippet.thumbnails.medium.url,
          high: item.snippet.thumbnails.high.url,
        },
      }));
      dispatch(setPlaylistSongs({ playlistId, songs: fetchedSongs }));
    } else {
      console.error('Failed to fetch playlist songs:', res.statusText);
    }
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
  }
};
