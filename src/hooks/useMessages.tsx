import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';

export const useMessages = (matchId: string | undefined) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesChannelRef = useRef<RealtimeChannel | null>(null);

  // Refs for values needed in channel callbacks that might change
  const currentMessagesRef = useRef(messages);
  useEffect(() => {
    currentMessagesRef.current = messages;
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (!matchId) {
      setLoadingMessages(false);
      setMessages([]); // Clear messages if no matchId
      return;
    }
    setLoadingMessages(true);
    try {
      const { data: msgsData, error: msgsError } = await supabase
        .from('messages')
        .select('*, reactions, seen_at') // Ensure seen_at is selected
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;
      const typedMsgsData = (msgsData || []).map(m => ({
        ...m,
        reactions: m.reactions || null,
        seen_at: m.seen_at || null, // Ensure seen_at is mapped
      })) as Message[];
      setMessages(typedMsgsData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]); // Clear messages on error
    } finally {
      setLoadingMessages(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markMessagesAsSeen = useCallback(async (messageIds: string[]) => {
    if (!user || !matchId || messageIds.length === 0) return;
    try {
      // Optimistically update UI
      const now = new Date().toISOString();
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          messageIds.includes(msg.id) && !msg.seen_at && msg.sender_id !== user.id
            ? { ...msg, seen_at: now } 
            : msg
        )
      );

      const { error } = await supabase
        .from('messages')
        .update({ seen_at: now })
        .in('id', messageIds)
        .eq('match_id', matchId) // Ensure updating messages for the current match
        .neq('sender_id', user.id); // Only mark messages from the other user

      if (error) {
        console.error('Error marking messages as seen:', error);
        // Revert optimistic update on error (optional, depends on desired UX)
        fetchMessages(); // Or more precise revert
      }
    } catch (error) {
      console.error('Error in markMessagesAsSeen:', error);
    }
  }, [user, matchId, fetchMessages]);
  
  const markMessagesAsSeenRef = useRef(markMessagesAsSeen);
  useEffect(() => {
    markMessagesAsSeenRef.current = markMessagesAsSeen;
  }, [markMessagesAsSeen]);

  useEffect(() => {
    if (!matchId || !user) {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      return;
    }

    // If channel exists but is for a different matchId, remove old and create new
    if (messagesChannelRef.current && messagesChannelRef.current.topic !== `realtime:messages:${matchId}`) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
    }
    
    if (!messagesChannelRef.current) {
      // Using a unique channel name per match to avoid Supabase client-side multiplexing issues if any
      const channelName = `realtime:messages:${matchId}`;
      const msgChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
          (payload) => {
            console.log('[Supabase RT] Received INSERT payload:', payload);
            const incomingMessage = payload.new as any;
            // Use ref for current messages to avoid stale closure
            if (currentMessagesRef.current.find(m => m.id === incomingMessage.id)) return;

            const typedMessage: Message = {
              id: incomingMessage.id,
              sender_id: incomingMessage.sender_id,
              match_id: incomingMessage.match_id,
              content: incomingMessage.content,
              created_at: incomingMessage.created_at,
              image_url: incomingMessage.image_url,
              voice_note_url: incomingMessage.voice_note_url,
              reactions: incomingMessage.reactions || null,
              seen_at: incomingMessage.seen_at || null,
            };
            setMessages(prev => [...prev, typedMessage]);
            if (typedMessage.sender_id !== user.id) {
              // Use ref for markMessagesAsSeen
              setTimeout(() => markMessagesAsSeenRef.current([typedMessage.id]), 500);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
          (payload) => {
            console.log('[Supabase RT] Received UPDATE event. Raw payload:', JSON.stringify(payload, null, 2));
            const updatedMessageFromPayload = payload.new as any; // Supabase types payload.new as {[key: string]: any}

            // Log crucial fields for debugging "seen" status
            if (updatedMessageFromPayload.id && updatedMessageFromPayload.hasOwnProperty('seen_at')) {
              console.log(`[Supabase RT] Update for Message ID: ${updatedMessageFromPayload.id}, received seen_at: ${updatedMessageFromPayload.seen_at}, content snippet: "${updatedMessageFromPayload.content ? String(updatedMessageFromPayload.content).substring(0,20) : 'N/A'}"`);
            }
            
            const typedUpdatedMessage: Message = {
              id: updatedMessageFromPayload.id,
              sender_id: updatedMessageFromPayload.sender_id,
              match_id: updatedMessageFromPayload.match_id,
              content: updatedMessageFromPayload.content,
              created_at: updatedMessageFromPayload.created_at,
              image_url: updatedMessageFromPayload.image_url,
              voice_note_url: updatedMessageFromPayload.voice_note_url,
              reactions: updatedMessageFromPayload.reactions || null,
              seen_at: updatedMessageFromPayload.seen_at || null, // Critical: ensure seen_at is correctly processed
            };
            setMessages(prevMsgs => {
              const newMsgs = prevMsgs.map(msg => {
                if (msg.id === typedUpdatedMessage.id) {
                  console.log(`[Supabase RT] Applying update to local message ID: ${msg.id}. Old seen_at: ${msg.seen_at}, New seen_at: ${typedUpdatedMessage.seen_at}`);
                  return typedUpdatedMessage;
                }
                return msg;
              });
              return newMsgs;
            });
          }
        )
        .on( 
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
          (payload) => {
            console.log('[Supabase RT] Received DELETE payload:', payload);
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        )
        .subscribe((status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Supabase channel error for ${channelName}:`, err);
            // Optionally, try to re-fetch messages or re-initiate channel after a delay
          } else if (status === 'SUBSCRIBED') {
            // console.log(`Successfully subscribed to ${channelName}`);
          }
        });
      messagesChannelRef.current = msgChannel;
    }

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [matchId, user]); // Dependencies are now more stable

  const sendMessageHandler = async (content?: string, imageUrl?: string, voiceNoteUrl?: string) => {
    if ((!content?.trim() && !imageUrl && !voiceNoteUrl) || !matchId || !user) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      match_id: matchId,
      content: content || null,
      image_url: imageUrl || null,
      voice_note_url: voiceNoteUrl || null,
      created_at: new Date().toISOString(),
      reactions: {},
      seen_at: null
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data: newMessageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          match_id: matchId,
          content: content || null,
          image_url: imageUrl,
          voice_note_url: voiceNoteUrl,
          reactions: {},
        })
        .select('*, reactions, seen_at')
        .single();

      if (error) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        throw error;
      }
      
      const typedNewMessageData = {
        ...(newMessageData as any), 
        reactions: newMessageData?.reactions || null,
        seen_at: newMessageData?.seen_at || null
      } as Message;
      setMessages(prev => prev.map(msg => msg.id === tempId ? typedNewMessageData : msg));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const deleteMessageHandler = async (messageId: string) => {
    if (!user) return;
    const originalMessages = [...messages];
    setMessages(prev => prev.filter(msg => msg.id !== messageId)); // Optimistic delete

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // RLS also enforces this, but good for clarity and client-side check

      if (error) {
        setMessages(originalMessages); // Revert on error
        throw error;
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setMessages(originalMessages); // Revert on error
    }
  };

  const reactToMessageHandler = async (messageId: string, emoji: string) => {
    const originalMessages = [...messages];
    if (!user) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const currentReactionsObject = (message.reactions && typeof message.reactions === 'object' && !Array.isArray(message.reactions))
        ? message.reactions as { [key: string]: string[] } 
        : {};
      
      const emojiReactions = currentReactionsObject[emoji] || [];
      
      let updatedReactionsForOptimisticUpdate: { [key: string]: string[] };
      if (emojiReactions.includes(user.id)) {
        updatedReactionsForOptimisticUpdate = {
          ...currentReactionsObject,
          [emoji]: emojiReactions.filter(id => id !== user.id)
        };
        if (updatedReactionsForOptimisticUpdate[emoji].length === 0) {
          delete updatedReactionsForOptimisticUpdate[emoji];
        }
      } else {
        updatedReactionsForOptimisticUpdate = {
          ...currentReactionsObject,
          [emoji]: [...emojiReactions, user.id]
        };
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: updatedReactionsForOptimisticUpdate as Json }
          : msg
      ));

      const { error } = await supabase
        .from('messages')
        .update({ reactions: updatedReactionsForOptimisticUpdate as Json })
        .eq('id', messageId);
      
      if (error) {
        setMessages(originalMessages);
        throw error;
      }

    } catch (error) {
      console.error('Error reacting to message:', error);
      setMessages(originalMessages);
    }
  };

  return { messages, setMessages, loadingMessages, sendMessageHandler, deleteMessageHandler, reactToMessageHandler, fetchMessages, markMessagesAsSeen };
};
