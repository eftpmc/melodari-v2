import { createClient } from '@/utils/supabase/client';
import { User, FriendRequest } from '@/types';

const supabase = createClient();

export const supabaseOperations = {
  getUserProfile: async (googleUserId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, avatar_url, username, platforms, play_count, friends, google_playlists, spotify_playlists')
      .eq('google_user_id', googleUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  createUserProfile: async (googleUserId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ google_user_id: googleUserId })
      .select('id, avatar_url, username, platforms, play_count, friends, google_playlists, spotify_playlists')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  updateGooglePlaylists: async (userId: string, googlePlaylists: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ google_playlists: googlePlaylists, updated_at: new Date() })
      .eq('id', userId)
      .select('google_playlists')
      .single();

    if (error) {
      throw error;
    }

    return data.google_playlists;
  },

  updateSpotifyPlaylists: async (userId: string, spotifyPlaylists: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ spotify_playlists: spotifyPlaylists, updated_at: new Date() })
      .eq('id', userId)
      .select('spotify_playlists')
      .single();

    if (error) {
      throw error;
    }

    return data.spotify_playlists;
  },

  updateGooglePlaylistSongs: async (userId: string, playlistId: string, newSongs: any) => {
  const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('google_playlists')
      .eq('id', userId)
      .single();
  
    if (fetchError) {
      throw fetchError;
    }
  
    const googlePlaylists = userProfile.google_playlists || {};
    const playlist = googlePlaylists[playlistId] || {};
    playlist.songs = newSongs;
    googlePlaylists[playlistId] = playlist;
  
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        google_playlists: googlePlaylists,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select('google_playlists')
      .single();
  
    if (updateError) {
      throw updateError;
    }
  
    return data.google_playlists;
  },

  updateSpotifyPlaylistSongs: async (userId: string, playlistId: string, newSongs: any) => {
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('spotify_playlists')
      .eq('id', userId)
      .single();
  
    if (fetchError) {
      throw fetchError;
    }
  
    const spotifyPlaylists = userProfile.spotify_playlists || {};
    const playlist = spotifyPlaylists[playlistId] || {};
    playlist.songs = newSongs;
    spotifyPlaylists[playlistId] = playlist;
  
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        google_playlists: spotifyPlaylists,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select('spotify_playlists')
      .single();
  
    if (updateError) {
      throw updateError;
    }
  
    return data.spotify_playlists;
  },

  updateProfile: async (userId: string, newUsername: string, newAvatarUrl: string, newPlatforms: string[]) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: newUsername, avatar_url: newAvatarUrl, platforms: newPlatforms })
      .eq('id', userId)
      .select('username, avatar_url, platforms');

    if (error) {
      throw error;
    }

    return data[0];
  },

  getPlayCount: async (userId: string, playlistId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('play_count')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data.play_count[playlistId] || 0;
  },

  incrementPlayCount: async (userId: string, playlistId: string) => {
    const { data: currentData, error: fetchError } = await supabase
      .from('profiles')
      .select('play_count')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const updatedPlayCounts = {
      ...currentData.play_count,
      [playlistId]: (currentData.play_count[playlistId] || 0) + 1,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ play_count: updatedPlayCounts, updated_at: new Date() })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return updatedPlayCounts[playlistId];
  },

  getFriends: async (userId: string) => {
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (userProfile && userProfile.friends.length > 0) {
      const { data: friendProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, platforms')
        .in('id', userProfile.friends);

      if (profilesError) {
        throw profilesError;
      }

      return friendProfiles.filter((friend: User) => friend.id !== userId);
    }

    return [];
  },

  getFriendRequests: async (userId: string): Promise<FriendRequest[]> => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        profiles:profiles!sender_id (username, avatar_url, platforms)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw error;
    }

    return data as any[];
  },

  getOutgoingFriendRequests: async (userId: string): Promise<FriendRequest[]> => {
    const { data, error } = await supabase
        .from('friend_requests')
        .select(`
            id,
            receiver_id,
            profiles:profiles!receiver_id (username, avatar_url, platforms)
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending');

    if (error) {
        throw error;
    }

    return data as any[];
},

  sendFriendRequest: async (senderId: string, receiverUsername: string) => {
    const { data: receiverProfile, error: receiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', receiverUsername)
      .single();

    if (receiverError) {
      throw receiverError;
    }

    const { error: insertError } = await supabase
      .from('friend_requests')
      .insert({ sender_id: senderId, receiver_id: receiverProfile.id, status: 'pending' });

    if (insertError) {
      throw insertError;
    }

    return true;
  },

  acceptFriendRequest: async (userId: string, requestId: string, senderId: string) => {
    const { data: userProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('friends')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentFriends = Array.isArray(userProfile.friends) ? userProfile.friends : [];
    const updatedFriendsForReceiver = [...currentFriends, senderId];

    const { data: senderProfile, error: senderFetchError } = await supabase
      .from('profiles')
      .select('friends, username, avatar_url, platforms')
      .eq('id', senderId)
      .single();

    if (senderFetchError) {
      throw senderFetchError;
    }

    const senderFriends = Array.isArray(senderProfile.friends) ? senderProfile.friends : [];
    const updatedFriendsForSender = [...senderFriends, userId];

    await supabase.from('profiles').update({ friends: updatedFriendsForReceiver }).eq('id', userId);
    await supabase.from('profiles').update({ friends: updatedFriendsForSender }).eq('id', senderId);
    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);

    return { senderId, senderProfile };
  },

  declineFriendRequest: async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      throw error;
    }
  },
};
