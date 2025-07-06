
import React, { useState } from 'react';
import { X, MapPin, Heart, Users, Grid, Gift } from 'lucide-react';
import type { MatchProfile } from '@/types/chat';
import BouquetSelectionModal from './BouquetSelectionModal';

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MatchProfile;
}

const ProfileViewModal: React.FC<ProfileViewModalProps> = ({ isOpen, onClose, profile }) => {
  const [isBouquetModalOpen, setIsBouquetModalOpen] = useState(false);

  if (!isOpen) return null;

  const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: number | string | undefined | null, label: string }) => (
    <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
      <Icon size={24} className="text-pink-400 mb-2" />
      <p className="text-xl font-bold text-white">{value ?? 0}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-300">
      <div className="relative w-full max-w-lg h-[95vh] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 gap-1">
            {profile.images?.slice(0, 4).map((img, index) => (
              <div key={index} className={`bg-slate-800 ${profile.images?.length === 1 ? 'col-span-2' : ''} ${profile.images?.length === 3 && index === 0 ? 'col-span-2' : ''}`}>
                <img src={img} alt={`${profile.name}'s photo ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
             {(!profile.images || profile.images.length === 0) && (
              <div className="col-span-2 aspect-w-1 aspect-h-1 bg-slate-800 flex items-center justify-center">
                 <img src={'/placeholder.svg'} alt="Placeholder" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Name, Age, Location */}
            <div>
              <h2 className="text-3xl font-bold text-white">
                {profile.name}{profile.age ? `, ${profile.age}` : ''}
              </h2>
              {profile.location && (
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin size={16} className="text-slate-300" />
                  <span className="text-slate-300">{profile.location}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatItem icon={Users} value={profile.total_matches} label="Matches" />
              <StatItem icon={Heart} value={profile.likes_received} label="Likes" />
              <StatItem icon={Grid} value={profile.posts_count} label="Posts" />
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">About Me</h3>
                <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-white text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-3">
              {(profile.gender || profile.mbti || profile.zodiac) && (
                  <h3 className="text-lg font-semibold text-white mb-2 pt-2 border-t border-white/10">Details</h3>
              )}
              <div className="grid grid-cols-2 gap-3">
                {profile.gender && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Gender</p>
                    <p className="text-white font-medium">{profile.gender}</p>
                  </div>
                )}
                {profile.mbti && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">MBTI</p>
                    <p className="text-white font-medium">{profile.mbti}</p>
                  </div>
                )}
                {profile.zodiac && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Zodiac</p>
                    <p className="text-white font-medium">{profile.zodiac}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Button Footer */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-white/10">
            <button 
                onClick={() => setIsBouquetModalOpen(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 text-lg hover:scale-105 transition-transform duration-300">
                <Gift size={22} />
                <span>Send Flowers</span>
            </button>
        </div>
      </div>
      <BouquetSelectionModal
        isOpen={isBouquetModalOpen}
        onClose={() => setIsBouquetModalOpen(false)}
        receiverId={profile.user_id}
        receiverName={profile.name}
      />
    </div>
  );
};

export default ProfileViewModal;
