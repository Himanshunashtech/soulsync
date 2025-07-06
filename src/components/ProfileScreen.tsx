import React, { useState, useEffect } from 'react';
import { Camera, Edit, MapPin, Users, Heart, Eye, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useReceivedBouquets } from '@/hooks/useReceivedBouquets';
import ReceivedBouquets from '@/components/ReceivedBouquets';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

interface Profile {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  bio: string | null;
  location: string | null;
  interests: string[] | null;
  mbti: string | null;
  zodiac: string | null;
  images: string[] | null;
  interested_in: string | null;
}

interface UserStats {
  total_matches: number;
  left_swipes: number;
  right_swipes: number;
}

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  likes_count: number;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ total_matches: 0, left_swipes: 0, right_swipes: 0 });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const { bouquets: receivedBouquets, loading: bouquetsLoading } = useReceivedBouquets(user?.id);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserStats();
      loadUserPosts();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const profileData: Profile = {
        ...data,
        interested_in: data.interested_in || null
      };
      
      setProfile(profileData);
      setEditForm(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setUserStats(data || { total_matches: 0, left_swipes: 0, right_swipes: 0 });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes count for each post
      const postsWithStats = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: likesData } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id);

          return {
            ...post,
            likes_count: likesData?.length || 0
          };
        })
      );

      setUserPosts(postsWithStats);
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (files && user && profile) {
      const file = files[0];
      const url = await uploadImage(file, user.id);
      if (url) {
        const newImages = profile.images ? [...profile.images, url] : [url];
        const updatedProfile = { ...profile, images: newImages };
        setProfile(updatedProfile);
        setEditForm(updatedProfile);
        
        // Update in database
        await supabase
          .from('profiles')
          .update({ images: newImages })
          .eq('user_id', user.id);
      }
    }
  };

  const removeImage = async (index: number) => {
    if (!profile?.images) return;
    
    const newImages = profile.images.filter((_, i) => i !== index);
    const updatedProfile = { ...profile, images: newImages };
    setProfile(updatedProfile);
    setEditForm(updatedProfile);
    
    // Update in database
    await supabase
      .from('profiles')
      .update({ images: newImages })
      .eq('user_id', user.id);
  };

  if (loading) {
    return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4 bubble-effect">👻</div>
                 <div className="text-white text-xl font-medium">Loading profile...</div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('settings')}
            className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all duration-200 shadow-sm"
          >
            <Settings size={20} className="text-purple-400" />
          </button>
          <button
            onClick={() => editing ? updateProfile() : setEditing(true)}
            className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <Edit size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm mt-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shadow-lg">
              <img
                src={profile?.images?.[0] || '/placeholder.svg'}
                alt={profile?.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
              <p className="text-slate-300">{profile?.age ? `${profile.age} years old` : 'Age not set'}</p>
              {profile?.location && (
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin size={16} className="text-purple-400" />
                  <p className="text-slate-300">{profile.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-2xl font-bold text-pink-500">{userStats.total_matches}</p>
              <p className="text-slate-300 text-sm">Matches</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-2xl font-bold text-pink-500">{userStats.right_swipes}</p>
              <p className="text-slate-300 text-sm">Likes</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-2xl font-bold text-pink-500">{userPosts.length}</p>
              <p className="text-slate-300 text-sm">Posts</p>
            </div>
          </div>

          {/* Bio */}
          {editing ? (
            <textarea
              value={editForm.bio || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself..."
              className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
          ) : (
            <p className="text-white">{profile?.bio || 'No bio yet'}</p>
          )}
        </div>

        {/* Photos Grid */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Photos</h3>
            {editing && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <Plus size={20} className="text-purple-400 hover:text-purple-300" />
              </label>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {profile?.images?.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 shadow-sm">
                <img src={image} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                {editing && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-slate-900/90 rounded-full p-1 text-white hover:bg-slate-800 shadow-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <label className="aspect-square bg-white/5 border-2 border-dashed border-purple-500/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                <Camera size={24} className="text-purple-400" />
              </label>
            )}
          </div>
        </div>

        {/* Received Bouquets */}
        <ReceivedBouquets bouquets={receivedBouquets} loading={bouquetsLoading} />

        {/* Editable Fields */}
        {editing && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Information</h3>
            
            <div>
              <label className="text-white text-sm font-medium">Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full mt-1 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium">Age</label>
                <input
                  type="number"
                  value={editForm.age || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full mt-1 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Gender</label>
                <select
                  value={editForm.gender || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full mt-1 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium">Location</label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full mt-1 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium">Interested In</label>
              <select
                value={editForm.interested_in || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, interested_in: e.target.value }))}
                className="w-full mt-1 bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Preference</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Everyone">Everyone</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                disabled={uploading}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl disabled:opacity-50 font-medium shadow-sm hover:opacity-90 transition-opacity"
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Posts</h3>
            <button
              onClick={() => onNavigate('feed')}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Create Post
            </button>
          </div>
          
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {userPosts.map((post) => (
                <div key={post.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 shadow-sm">
                  {post.image_url ? (
                    <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white text-xs text-center p-2">{post.content}</p>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-slate-900/90 rounded-full px-2 py-1 flex items-center space-x-1 shadow-sm">
                    <Heart size={12} className="text-pink-500" />
                    <span className="text-white text-xs">{post.likes_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-300 mb-4">No posts yet</p>
              <button
                onClick={() => onNavigate('feed')}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Create your first post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
