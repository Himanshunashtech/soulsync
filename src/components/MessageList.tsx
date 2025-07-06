
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import EmptyChatPlaceholder from './EmptyChatPlaceholder';
import type { Message, MatchProfile } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';

interface MessageListProps {
  messages: Message[];
  matchProfile: MatchProfile | null;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onMarkMessagesAsSeen: (messageIds: string[]) => void; // New prop
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  matchProfile,
  onDeleteMessage,
  onReactToMessage,
  onMarkMessagesAsSeen, // Destructure new prop
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const visibilityRefs = useRef<(HTMLDivElement | null)[]>([]); // For IntersectionObserver

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const unreadMessagesFromOtherUser = messages
      .filter(msg => msg.sender_id !== user.id && !msg.seen_at)
      .map(msg => msg.id);

    if (unreadMessagesFromOtherUser.length > 0) {
      // A simple approach: mark all currently unread messages from other user as seen
      // when the component mounts or messages update.
      // For more precise "visibility" based marking, IntersectionObserver would be better.
      onMarkMessagesAsSeen(unreadMessagesFromOtherUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, user, onMarkMessagesAsSeen]); // `user` and `onMarkMessagesAsSeen` are stable but good to include

  // More advanced IntersectionObserver setup (optional refinement)
  // This could be used to mark messages as seen only when they actually scroll into view.
  // For simplicity, the above useEffect handles it more broadly.
  /*
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleMessageIdsToMark = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.getAttribute('data-message-id'))
          .filter(id => id !== null) as string[];
        
        if (visibleMessageIdsToMark.length > 0) {
          onMarkMessagesAsSeen(visibleMessageIdsToMark);
        }
      },
      { threshold: 0.5 } // Mark as seen when 50% visible
    );

    visibilityRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      visibilityRefs.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [messages, onMarkMessagesAsSeen]);
  */

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-100">
      {messages.length === 0 ? (
        <EmptyChatPlaceholder matchProfileName={matchProfile?.name} />
      ) : (
        messages.map((message, index) => (
          <div 
            key={message.id}
            // ref={el => visibilityRefs.current[index] = el} // For IntersectionObserver
            // data-message-id={message.id} // For IntersectionObserver
          >
            <MessageBubble
              message={message}
              isOwnMessage={message.sender_id === user?.id}
              onDelete={onDeleteMessage}
              onReact={onReactToMessage}
              // isLastMessage={index === messages.length -1} // Example if "Seen" only for very last
            />
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

