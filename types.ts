export interface PlaylistItemSnippet {
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
  }
  
export interface PlaylistItem {
    songs: any;
    id: string;
    snippet: PlaylistItemSnippet;
  }