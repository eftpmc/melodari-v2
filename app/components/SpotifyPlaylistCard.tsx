import { ChevronUp, ChevronDown } from 'lucide-react';

interface SpotifyPlaylistCardProps {
  isConnected: boolean;
}

export default function SpotifyPlaylistCard({ isConnected }: SpotifyPlaylistCardProps) {
  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md w-full my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-lg font-semibold text-base-content">Spotify Playlists</div>
          <span className={`ml-2 badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {isConnected && (
          <button className="focus:outline-none">
            <ChevronDown className="w-6 h-6 text-base-content" />
          </button>
        )}
      </div>
      {/* You can add additional content here if Spotify is connected */}
    </div>
  );
}
