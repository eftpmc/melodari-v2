"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseOperations } from '@/utils/supabase/operations';
import { User, Playlist } from '@/types';
import PlaylistCard from '@/app/components/PlaylistCard';
import FriendCard from '@/app/components/friends/FriendCard';
import { FaSpotify } from 'react-icons/fa';
import { SiYoutubemusic } from 'react-icons/si';

export const platformsData = [
  { id: 'google', name: 'YouTube Music', icon: <SiYoutubemusic className="text-red-600 w-6 h-6" /> },
  { id: 'spotify', name: 'Spotify', icon: <FaSpotify className="text-green-600 w-6 h-6" /> },
];

const FriendPage: React.FC = () => {
  const router = useRouter();
  const { username } = useParams();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchUserData(username as string);
    }
  }, [username]);

  const fetchUserData = async (username: string) => {
    try {
      setLoading(true);
      const profile = await supabaseOperations.getUserProfileByUsername(username);
      if (profile) {
        setUserProfile(profile);
        const userPlaylists = [...(profile.google_playlists || []), ...(profile.spotify_playlists || [])];
        setPlaylists(userPlaylists);
        const userFriends = await supabaseOperations.getFriends(profile.id);
        setFriends(userFriends);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        {/* User Information Row */}
        <div className="flex items-center mb-8">
          <div className="skeleton w-24 h-24 rounded-lg mr-4"></div>
          <div>
            <div className="skeleton h-8 w-48 mb-2"></div>
            <div className="skeleton h-6 w-32"></div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: User's Playlists */}
          <div>
            <div className="skeleton h-8 w-32 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton h-40 w-full"></div>
              ))}
            </div>
          </div>

          {/* Right Column: User's Friends */}
          <div>
            <div className="skeleton h-8 w-32 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton h-20 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <div className="p-8 text-center text-base-content">User not found</div>;
  }

  return (
    <div className="p-8">
      {/* User Information Row */}
      <div className="flex items-center mb-8">
        <img
          src={userProfile.avatar_url || "/default-avatar.png"}
          alt={`${userProfile.username}'s avatar`}
          className="w-24 h-24 object-cover rounded-lg mr-4"
        />
        <div>
          <h2 className="text-2xl font-semibold text-base-content">{userProfile.username}</h2>
          <div className="flex mt-2 space-x-2">
            {userProfile.platforms.map((platformId) => {
              const platform = platformsData.find((p) => p.id === platformId);
              return platform ? platform.icon : null;
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: User's Playlists */}
        <div>
          <h3 className="text-xl font-semibold text-base-content mb-4">Playlists</h3>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} onClick={() => {}} />
              ))}
            </div>
          ) : (
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <p className="text-base-content">No playlists found.</p>
              <p className="text-sm text-base-content mt-2">This user hasn't created any playlists yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: User's Friends */}
        <div>
          <h3 className="text-xl font-semibold text-base-content mb-4">Friends</h3>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend.id} user={friend} />
              ))}
            </div>
          ) : (
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <p className="text-base-content">No friends found.</p>
              <p className="text-sm text-base-content mt-2">This user hasn&apos;t added any friends yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendPage;