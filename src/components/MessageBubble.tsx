import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Heart, Play, Pause, Trash2, Check, CheckCheck } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    content: string | null;
    created_at: string;
    image_url?: string | null;
    voice_note_url?: string | null;
    reactions: Json | null;
    seen_at?: string | null;
  };
  isOwnMessage: boolean;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  isLastMessage?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  onDelete,
  onReact,
  isLastMessage 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const availableReactions = ['❤️', '😂', '👍', '😢', '😡', '😮'];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReactionClick = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactionsPicker(false);
    setShowOptions(false);
  };

  const handleDeleteClick = () => {
    onDelete(message.id);
    setShowOptions(false);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => {
        if (audio.duration !== Infinity) { 
           setAudioDuration(audio.duration);
        }
      }
      const setAudioTime = () => {
        setAudioProgress(audio.currentTime);
      }
      const handleAudioEnd = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };

      audio.addEventListener('loadedmetadata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', handleAudioEnd);
      
      if (audio.duration === Infinity && message.voice_note_url?.startsWith('blob:')) {
        audio.load();
      }

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [message.voice_note_url]);


  const formatAudioTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderReactions = () => {
    if (!message.reactions || typeof message.reactions !== 'object' || Array.isArray(message.reactions)) {
      return null;
    }
    const reactionsMap = message.reactions as { [key: string]: string[] };
    const reactionEntries = Object.entries(reactionsMap).filter(([, users]) => users && users.length > 0);

    if (reactionEntries.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-0.5 mt-1.5 absolute -bottom-3 right-2">
        {reactionEntries.map(([emoji, users]) => (
          <div
            key={emoji}
            className={`flex items-center text-xs space-x-0.5 ${isOwnMessage ? 'bg-purple-600' : 'bg-slate-300'} shadow-md rounded-full px-1.5 py-0.5`}
          >
            <span>{emoji}</span>
            <span className={isOwnMessage ? 'text-white' : 'text-slate-700'}>{users.length > 1 ? users.length : ''}</span>
          </div>
        ))}
      </div>
    );
  };

  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;
    if (message.seen_at) {
        return <CheckCheck size={16} className="text-blue-400 ml-1" />;
    }
    return <Check size={16} className="text-slate-400 ml-1" />;
  };

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="relative group max-w-[70%]">
        
        <div
          className={`px-3 py-2 rounded-2xl shadow-sm relative ${
            isOwnMessage
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-none' 
              : 'bg-slate-200 text-slate-800 rounded-bl-none'
          }`}
          onClick={() => { 
            if (showReactionsPicker) setShowReactionsPicker(false);
            else setShowOptions(!showOptions);
          }}
        >
          {/* Voice Note */}
          {message.voice_note_url && (
            <div className="flex items-center space-x-2 mb-1 p-1 rounded-lg bg-black/10">
              <button
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                className={`p-2 rounded-full transition-colors ${isOwnMessage ? 'hover:bg-white/20' : 'hover:bg-slate-300'}`}
              >
                {isPlaying ? <Pause size={16} className={isOwnMessage ? "text-white" : "text-slate-700"} /> : <Play size={16} className={isOwnMessage ? "text-white" : "text-slate-700"} />}
              </button>
              <div className="flex-1 h-1.5 bg-black/20 rounded-full relative">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: audioDuration > 0 && audioDuration !== Infinity ? `${(audioProgress / audioDuration) * 100}%` : '0%' }}
                ></div>
              </div>
              <span className={`text-xs ${isOwnMessage ? 'text-slate-200' : 'text-slate-600'}`}>
                {formatAudioTime(audioDuration > 0 && audioDuration !== Infinity ? (isPlaying ? audioProgress : audioDuration) : 0)}
              </span>
              <audio
                ref={audioRef}
                src={message.voice_note_url}
                className="hidden"
                preload="metadata"
              />
            </div>
          )}

          {/* Image */}
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Shared media"
              className="max-w-full h-auto max-h-64 object-contain rounded-lg mb-1"
            />
          )}

          {/* Text Content */}
          {message.content && <p className="text-sm break-words">{message.content}</p>}

          {/* Reactions Display */}
          {renderReactions()}
        </div>
        <div className={`flex items-center mt-1 ${isOwnMessage ? 'justify-end text-slate-400 mr-1' : 'justify-start text-slate-400 ml-1'}`}>
          <p className="text-xs">
            {formatTime(message.created_at)}
          </p>
          {isOwnMessage && getMessageStatusIcon()} 
        </div>
        
        {/* Message Options Popover (Heart & Trash) */}
        {(showOptions || showReactionsPicker) && (
          <div 
            className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} -top-10 z-20 flex items-center space-x-1 bg-white shadow-xl rounded-full border border-slate-200 p-1`}
            onClick={(e) => e.stopPropagation()}
          >
            {!showReactionsPicker && (
              <>
                <button
                  onClick={() => { setShowReactionsPicker(true); setShowOptions(false); }}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Heart size={16} className="text-slate-600" />
                </button>
                {isOwnMessage && (
                  <button
                    onClick={handleDeleteClick}
                    className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
              </>
            )}
            
            {showReactionsPicker && (
              <div 
                className="flex items-center space-x-0.5"
              >
                {availableReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className="p-1 hover:bg-slate-200 rounded-full text-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
