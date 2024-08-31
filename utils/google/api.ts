import { Tokens, GooglePlaylist, GoogleSong } from '@/types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const googleApi = {
  getCurrentUserProfile: async (accessToken: string) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  getUserPlaylists: async (accessToken: string) => {
    const response = await fetch(`${BASE_URL}/playlists?part=snippet&mine=true&maxResults=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user playlists');
    return response.json();
  },

  getPlaylistItems: async (accessToken: string, playlistId: string) => {
    const response = await fetch(`${BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch playlist items');
    return response.json();
  },

  searchVideos: async (accessToken: string, query: string) => {
    const response = await fetch(`${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to search videos');
    return response.json();
  },

  createPlaylist: async (accessToken: string, title: string, description?: string) => {
    const response = await fetch(`${BASE_URL}/playlists?part=snippet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title,
          description: description || '',
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to create playlist');
    return response.json();
  },

  addVideoToPlaylist: async (accessToken: string, playlistId: string, videoId: string) => {
    const response = await fetch(`${BASE_URL}/playlistItems?part=snippet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId,
          },
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to add video to playlist');
    return response.json();
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch('/api/auth/google/refresh', {
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