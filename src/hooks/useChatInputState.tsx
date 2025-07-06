
import { useState } from 'react';

export const useChatInputState = () => {
  const [newMessage, setNewMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  return {
    newMessage,
    setNewMessage,
    showVoiceRecorder,
    setShowVoiceRecorder,
  };
};
