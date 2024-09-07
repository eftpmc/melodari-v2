export interface Image {
  url: string;
  width: number;
  height: number;
}

export interface Tokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export interface Song {
  id: string;
  platform: string;
  isrc?: string;
  title: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  artist: string;  // Optional artists field
}

export interface Playlist {
  id: string;
  title: string;
  accountName: string;
  source: string;
  description?: string; // Optional description field
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  songs: Song[]; // Array of Song objects
  platforms: string[];
}

export interface GoogleSong {
  id: string;
  title: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
}

export interface GooglePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  songs: GoogleSong[];
}

// Define the Spotify-specific playlist type
export interface SpotifyTrack {
  id: string;
  title: string; // Change 'name' to 'title'
  artist: string; // Change 'artists' to 'artist'
  thumbnails: {
      default: string;
      medium: string;
      high: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
};
  songs: SpotifyTrack[];
}

export interface User {
  id: string;
  username: string;
  avatar_url: string;
  platforms: string[];
  google_playlists?: {},
  spotify_playlists?: {},
}


export interface FriendRequest {
  id: string;
  sender_id: string;
  profiles: {
      username: string;
      avatar_url: string | null;
      platforms: string[];
  };
}
