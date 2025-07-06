
import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';

interface Profile {
  user_id: string;
  name: string;
  age: number | null;
  images: string[] | null;
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_id: string;
}

interface ConversationItemProps {
  matchId: string;
  profile: Profile;
  lastMessage?: LastMessage;
  matchCreatedAt: string;
  unreadMessageCount?: number;
  currentUserId?: string;
  onNavigateToChat: (matchId: string) => void;
  getTimeAgo: (dateString: string) => string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  matchId,
  profile,
  lastMessage,
  matchCreatedAt,
  unreadMessageCount,
  currentUserId,
  onNavigateToChat,
  getTimeAgo,
}) => {
  return (
    <div
      className="bg-white/5 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer border border-white/10 shadow-sm"
      onClick={() => onNavigateToChat(matchId)}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 p-0.5 border border-white/10">
            <img
              src={profile.images?.[0] || '/placeholder.svg'}
              alt={profile.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {unreadMessageCount && unreadMessageCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center justify-center shadow-sm min-w-[20px] h-5">
              {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate">
              {profile.name}{profile.age ? `, ${profile.age}` : ''}
            </h3>
            <div className="flex items-center space-x-1 text-slate-300 text-xs">
              <Clock size={12} />
              <span>{getTimeAgo(lastMessage?.created_at || matchCreatedAt)}</span>
            </div>
          </div>
          <p className={`text-sm truncate ${unreadMessageCount && unreadMessageCount > 0 ? 'text-white font-semibold' : 'text-slate-300'}`}>
            {lastMessage
              ? (lastMessage.sender_id === currentUserId ? "You: " : "") + lastMessage.content
              : 'Say hello to your new match!'}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button className="p-2 bg-pink-500/20 rounded-full hover:bg-pink-500/30 transition-colors">
            <MessageCircle size={20} className="text-pink-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
