import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// Hooks
import { useMatchProfile } from '@/hooks/useMatchProfile';
import { useMessages } from '@/hooks/useMessages';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useChatInputState } from '@/hooks/useChatInputState';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

// Components
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';
import ProfileViewModal from './ProfileViewModal';

interface ChatScreenProps {
  onNavigate: (screen: string, matchId?: string) => void;
  matchId?: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onNavigate, matchId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { blockedUsers } = useBlockedUsers();

  const { matchProfile, otherUserId, loadingProfile } = useMatchProfile(matchId);
  const { 
    messages, 
    loadingMessages, 
    sendMessageHandler, 
    deleteMessageHandler, 
    reactToMessageHandler, 
    fetchMessages,
    markMessagesAsSeen
  } = useMessages(matchId);
  const { otherUserOnlineStatus } = useChatPresence(matchId, otherUserId);
  const { newMessage, setNewMessage, showVoiceRecorder, setShowVoiceRecorder } = useChatInputState();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  
  const isOtherUserBlocked = !!(otherUserId && blockedUsers?.some(blockedUser => blockedUser.user_id === otherUserId));
  
  const isLoading = loadingProfile || loadingMessages;

  useEffect(() => {
    if(matchId) {
        fetchMessages();
        // When chat is opened/matchId changes, mark existing unread messages as seen
        const unreadMessageIds = messages
            .filter(msg => msg.sender_id !== user?.id && !msg.seen_at)
            .map(msg => msg.id);
        if (unreadMessageIds.length > 0 && user) {
            markMessagesAsSeen(unreadMessageIds);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, fetchMessages, user]); // messages and markMessagesAsSeen removed to avoid loop, initial load handled by MessageList


  const handleBlockUser = async () => {
    if (!otherUserId || !user || !matchProfile) return;
    const confirmBlock = window.confirm(
      `Are you sure you want to block ${matchProfile.name}? You won't be able to exchange messages anymore, but your chat history will be kept.`
    );
    if (!confirmBlock) return;

    try {
      const { error } = await supabase.rpc('block_user', {
        p_blocked_user_id: otherUserId,
      });

      if (error) throw error;

      alert(`${matchProfile.name} has been blocked.`);
      queryClient.invalidateQueries({ queryKey: ['blockedUsers', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleDeleteChat = async () => {
    if (!matchId || !user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this entire chat? This action cannot be undone.");
    if (!confirmDelete) return;
    
    try {
      // IMPORTANT: Deleting all messages for a match_id directly like this:
      // const { error: messagesError } = await supabase.from('messages').delete().eq('match_id', matchId);
      // will likely FAIL due to RLS if messages from the other user exist, as current RLS only allows deleting OWN messages.
      // The recommended way is to have ON DELETE CASCADE on the foreign key from 'messages.match_id' to 'matches.id'.
      // If ON DELETE CASCADE is set, deleting the match below will automatically delete all its messages.
      // If not, messages from the other user might be orphaned or the operation might partially fail.
      // For this implementation, we are relying on the match deletion and RLS for matches.
      console.warn("handleDeleteChat: Ensure 'messages.match_id' has ON DELETE CASCADE to 'matches.id' in the database for full message cleanup.");

      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        // RLS "Users can delete their own matches" ensures this is allowed if user1_id or user2_id is auth.uid()
        // .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`); // This part of the filter is handled by RLS

      if (matchError) throw matchError;

      onNavigate('matches'); 
    } catch (error) {
      console.error('Error deleting chat:', error);
      // Consider user feedback for error (e.g., toast notification)
    }
  };

  if (!matchId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-4">
        <div className="text-xl font-medium mb-4">Chat Not Available</div>
        <p className="text-slate-400 mb-6 text-center">
          This can happen if you've been unmatched or one of you has blocked the other.
        </p>
        <button
          onClick={() => onNavigate('matches')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="text-white text-xl font-medium">Loading chat...</div>
      </div>
    );
  }

  const isSendingDisabled = isOtherUserBlocked;

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-slate-900">
      <ChatHeader
        matchProfile={matchProfile}
        otherUserOnlineStatus={otherUserOnlineStatus}
        onNavigateBack={() => onNavigate('matches')}
        onDeleteChat={handleDeleteChat}
        onBlockUser={handleBlockUser}
        isBlocked={isOtherUserBlocked}
        onViewProfile={() => setProfileModalOpen(true)}
      />
      
      <MessageList
        messages={messages}
        matchProfile={matchProfile}
        onDeleteMessage={deleteMessageHandler}
        onReactToMessage={reactToMessageHandler}
        onMarkMessagesAsSeen={markMessagesAsSeen}
      />
      
      <MessageInputBar
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        showVoiceRecorder={showVoiceRecorder}
        setShowVoiceRecorder={setShowVoiceRecorder}
        onSendMessage={sendMessageHandler}
        isSendingPossible={!!user && !!matchId && !isSendingDisabled}
      />

      {matchProfile && (
        <ProfileViewModal
          isOpen={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          profile={matchProfile}
        />
      )}
    </div>
  );
};

export default ChatScreen;
