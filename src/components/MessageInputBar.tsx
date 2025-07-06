
import React from 'react';
import { Camera, Mic, Send, Smile } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/hooks/useAuth';
import VoiceRecorder from './VoiceRecorder';

interface MessageInputBarProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  showVoiceRecorder: boolean;
  setShowVoiceRecorder: (value: boolean) => void;
  onSendMessage: (content?: string, imageUrl?: string, voiceNoteUrl?: string) => Promise<void>;
  isSendingPossible: boolean; // To control send button disable state
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  newMessage,
  setNewMessage,
  showVoiceRecorder,
  setShowVoiceRecorder,
  onSendMessage,
  isSendingPossible,
}) => {
  const { user } = useAuth();
  const { uploadFile, uploading } = useImageUpload();

  const handleTextSend = async () => {
    if (newMessage.trim()) {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleImageSend = async (files: FileList | null) => {
    if (files && files.length > 0 && user) {
      const file = files[0];
      const url = await uploadFile(file, user.id, 'chat-media');
      if (url) {
        await onSendMessage(undefined, url);
      }
    }
  };

  const handleVoiceNoteSend = async (audioBlob: Blob) => {
    if (user) {
      const file = new File([audioBlob], `voice-note-${user.id}-${Date.now()}.webm`, { type: 'audio/webm' });
      const url = await uploadFile(file, user.id, 'chat-media');
      if (url) {
        await onSendMessage(undefined, undefined, url);
      }
    }
    setShowVoiceRecorder(false);
  };

  if (showVoiceRecorder) {
    return (
      <div className="bg-white border-t border-slate-200 p-4">
        <VoiceRecorder
          onSend={handleVoiceNoteSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
      <div className="flex items-center space-x-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSend(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <Camera size={24} className="text-slate-500 hover:text-pink-500 transition-colors" />
        </label>

        <button
          onClick={() => setShowVoiceRecorder(true)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          disabled={uploading}
        >
          <Mic size={20} className="text-slate-500 hover:text-pink-500 transition-colors" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-slate-100 border border-slate-300 rounded-full py-3 px-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            onKeyPress={(e) => e.key === 'Enter' && !uploading && handleTextSend()}
            disabled={uploading}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Smile size={20} className="text-slate-500 hover:text-pink-500 transition-colors" />
          </button>
        </div>

        <button
          onClick={handleTextSend}
          disabled={!isSendingPossible || uploading || !newMessage.trim()}
          className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default MessageInputBar;
