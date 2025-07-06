
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      cleanup();
    }
  };

  const handleCancel = () => {
    stopRecording();
    cleanup();
    onCancel();
  };

  const cleanup = () => {
    setRecordingTime(0);
    setAudioBlob(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!isRecording && !audioBlob ? (
            <button
              onClick={startRecording}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Mic size={20} className="text-white" />
            </button>
          ) : isRecording ? (
            <button
              onClick={stopRecording}
              className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors animate-pulse"
            >
              <MicOff size={20} className="text-white" />
            </button>
          ) : (
            <div className="p-3 bg-green-500 rounded-full">
              <Mic size={20} className="text-white" />
            </div>
          )}
          
          <div className="text-white">
            {isRecording ? (
              <div>
                <p className="font-semibold">Recording...</p>
                <p className="text-sm text-gray-300">{formatTime(recordingTime)}</p>
              </div>
            ) : audioBlob ? (
              <div>
                <p className="font-semibold">Voice note ready</p>
                <p className="text-sm text-gray-300">{formatTime(recordingTime)}</p>
              </div>
            ) : (
              <p className="font-semibold">Tap to record</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {audioBlob && (
            <button
              onClick={handleSend}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          )}
          
          <button
            onClick={handleCancel}
            className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
          >
            <X size={16} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
