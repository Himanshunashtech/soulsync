
import React from 'react';
import ConversationItem from './ConversationItem';

interface Profile {
  user_id: string;
  name: string;
  age: number | null;
  images: string[] | null;
  // Add other profile fields if needed by ConversationItem or its sub-logic
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_id: string;
}

interface Match {
  id: string;
  created_at: string;
  profiles: Profile;
  lastMessage?: LastMessage;
  unreadMessageCount?: number;
}

interface ConversationListProps {
  matches: Match[];
  currentUserId?: string;
  onNavigateToChat: (matchId: string) => void;
  getTimeAgo: (dateString: string) => string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  matches,
  currentUserId,
  onNavigateToChat,
  getTimeAgo,
}) => {
  return (
    <div className="px-6">
      <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
      <div className="space-y-3">
        {matches.map((match) => (
          <ConversationItem
            key={match.id}
            matchId={match.id}
            profile={match.profiles}
            lastMessage={match.lastMessage}
            matchCreatedAt={match.created_at}
            unreadMessageCount={match.unreadMessageCount}
            currentUserId={currentUserId}
            onNavigateToChat={onNavigateToChat}
            getTimeAgo={getTimeAgo}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
