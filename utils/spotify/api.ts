import { Tokens, SpotifyPlaylist, SpotifyTrack } from '@/types';

const BASE_URL = 'https://api.spotify.com/v1';

export const spotifyApi = {
  getCurrentUserProfile: async (accessToken: string) => {
    const response = await fetch(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  getUserPlaylists: async (accessToken: string) => {
    const response = await fetch(`${BASE_URL}/me/playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user playlists');
    return response.json();
  },

  getPlaylistTracks: async (accessToken: string, playlistId: string) => {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch playlist tracks');
    return response.json();
  },

  searchTracks: async (accessToken: string, query: string) => {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to search tracks');
    return response.json();
  },

  createPlaylist: async (accessToken: string, name: string, description?: string) => {
    const userRes = await fetch(`https://api.spotify.com/v1/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!userRes.ok) throw new Error('Failed to fetch Spotify user info');

    const user = await userRes.json();

    const response = await fetch(`${BASE_URL}/users/${user.id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    });
    if (!response.ok) throw new Error('Failed to create playlist');
    return response.json();
  },

  addTracksToPlaylist: async (accessToken: string, playlistId: string, uris: string[]) => {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris }),
    });
    if (!response.ok) throw new Error('Failed to add tracks to playlist');
    return response.json();
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch('/api/auth/spotify/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) throw new Error('Failed to refresh token');
    return response.json() as Promise<Tokens>;
  },
};