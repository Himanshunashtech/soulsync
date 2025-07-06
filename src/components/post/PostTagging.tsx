
import React from 'react';
import { AtSign, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
}

interface PostTaggingProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isSearching: boolean;
  searchResults: User[];
  onAddTaggedUser: (user: User) => void;
  taggedUsers: User[];
  onRemoveTaggedUser: (userId: string) => void;
  searchQueryLength: number;
}

const PostTagging: React.FC<PostTaggingProps> = ({
  searchQuery,
  onSearchQueryChange,
  isSearching,
  searchResults,
  onAddTaggedUser,
  taggedUsers,
  onRemoveTaggedUser,
  searchQueryLength,
}) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <AtSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tag people..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
        />
        {(isSearching || searchResults.length > 0 || (searchQueryLength >= 2 && !isSearching)) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg z-20 shadow-lg max-h-48 overflow-y-auto">
            {isSearching && <p className="p-3 text-sm text-slate-400">Searching...</p>}
            {!isSearching && searchResults.length > 0 && (
              <ul>
                {searchResults.map(u => (
                  <li key={u.id}>
                    <button onClick={() => onAddTaggedUser(u)} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors">
                      {u.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!isSearching && searchResults.length === 0 && searchQueryLength >= 2 && (
              <p className="p-3 text-sm text-slate-400">No users found.</p>
            )}
          </div>
        )}
      </div>

      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {taggedUsers.map(u => (
            <div key={u.id} className="flex items-center bg-purple-500/20 text-purple-300 rounded-full px-3 py-1 text-sm font-medium">
              <span>@{u.name}</span>
              <button onClick={() => onRemoveTaggedUser(u.id)} className="ml-1.5 p-0.5 rounded-full hover:bg-white/20 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostTagging;
