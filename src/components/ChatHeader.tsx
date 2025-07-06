
import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, UserX } from 'lucide-react';
import type { MatchProfile } from '@/types/chat';
import ChatOptionsMenu from './ChatOptionsMenu'; // Import ChatOptionsMenu

interface ChatHeaderProps {
  matchProfile: MatchProfile | null;
  otherUserOnlineStatus: 'Online' | 'Offline';
  onNavigateBack: () => void;
  onDeleteChat: () => void;
  onBlockUser: () => void;
  isBlocked: boolean;
  onViewProfile: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  matchProfile,
  otherUserOnlineStatus,
  onNavigateBack,
  onDeleteChat,
  onBlockUser,
  isBlocked,
  onViewProfile,
}) => {
  const [showChatOptions, setShowChatOptions] = useState(false);

  return (
    <div className="bg-slate-50 border-b border-slate-200 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          
          <div 
            className={`flex items-center space-x-3 ${!isBlocked ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={!isBlocked ? onViewProfile : undefined}
            aria-label={!isBlocked ? `View ${matchProfile?.name}'s profile` : "User is blocked"}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500 p-0.5 flex items-center justify-center bg-slate-200">
              {isBlocked ? (
                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                  <UserX size={24} className="text-slate-500" />
                </div>
              ) : (
                <img
                  src={matchProfile?.images?.[0] || '/placeholder.svg'}
                  alt={matchProfile?.name || 'Profile'}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">{isBlocked ? "User Blocked" : matchProfile?.name}</h2>
              {!isBlocked && (
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${otherUserOnlineStatus === 'Online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                  <span className="text-slate-500 text-sm">{otherUserOnlineStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isBlocked && (
          <div className="relative">
            <button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <MoreVertical size={20} className="text-slate-700" />
            </button>
            {showChatOptions && (
              <ChatOptionsMenu 
                onDeleteChat={() => {
                  onDeleteChat();
                  setShowChatOptions(false);
                }}
                onBlockUser={() => {
                  onBlockUser();
                  setShowChatOptions(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
