
import React from 'react';
import { Trash2, ShieldAlert } from 'lucide-react';

interface ChatOptionsMenuProps {
  onDeleteChat: () => void;
  onBlockUser: () => void;
}

const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({ onDeleteChat, onBlockUser }) => {
  return (
    <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border border-slate-200 p-2 z-20 min-w-max">
      <button
        onClick={onBlockUser}
        className="flex items-center space-x-2 p-2 hover:bg-yellow-100 rounded-lg transition-colors w-full text-left text-sm text-yellow-700"
      >
        <ShieldAlert size={16} className="text-yellow-600" />
        <span className="font-medium">Block & Unmatch</span>
      </button>
      <div className="my-1 border-t border-slate-100"></div>
      <button
        onClick={onDeleteChat}
        className="flex items-center space-x-2 p-2 hover:bg-red-100 rounded-lg transition-colors w-full text-left text-sm"
      >
        <Trash2 size={16} className="text-red-500" />
        <span className="text-red-500">Delete Chat</span>
      </button>
    </div>
  );
};

export default ChatOptionsMenu;
