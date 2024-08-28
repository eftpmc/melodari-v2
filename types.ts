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
    isrc?: string;
    title: string;
    thumbnails: {
      default: string;
      medium: string;
      high: string;
    };
    artist: string;  // Optional artists field
  }

// Playlist type to represent the playlist itself, including an array of Song
// Create a unified Playlist type to be used across the app
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
  }
  
// Define the Google-specific playlist type
export interface GoogleSong {
    id: string;
    title: string;
    videoId: string;
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
    name: string;
    album: {
      images: {
        url: string;
      }[];
    };
    artists: {
      name: string;
    }[];
  }
  
  export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    images: {
      url: string;
    }[];
    tracks: SpotifyTrack[];
  }
  