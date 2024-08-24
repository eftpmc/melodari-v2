import { PlaylistItem } from '@/types';
import YouTubeMusicPlaylistCard from '@/app/components/YouTubeMusicPlaylistCard';

interface YouTubeMusicAccordionProps {
  playlists: PlaylistItem[];
}

export default function YouTubeMusicAccordion({ playlists }: YouTubeMusicAccordionProps) {
  return (
    <div className="w-full">
      <YouTubeMusicPlaylistCard playlists={playlists} />
    </div>
  );
}
