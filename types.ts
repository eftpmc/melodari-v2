// Song type to represent individual items in a playlist
export interface Song {
    id: string;
    snippet: {
      title: string;
      description: string;
      position: number;
      resourceId: {
        videoId: string;
      };
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
        medium: {
          url: string;
          width: number;
          height: number;
        };
        high: {
          url: string;
          width: number;
          height: number;
        };
      };
    };
  }
  
  // Playlist type to represent the playlist itself, including an array of Song
  export interface Playlist {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
        medium: {
          url: string;
          width: number;
          height: number;
        };
        high: {
          url: string;
          width: number;
          height: number;
        };
      };
    };
    songs: Song[];  // Array of songs in the playlist
  }
  