
import React from 'react';
import { ArrowLeft, User, UserX, Frown } from 'lucide-react';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BlockedUsersScreenProps {
  onNavigate: (screen: string) => void;
}

const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({ onNavigate }) => {
  const { blockedUsers, isLoading, error, unblockUser, isUnblocking } = useBlockedUsers();

  const handleUnblock = (userId: string, userName: string) => {
    unblockUser(userId, {
      onSuccess: () => {
        toast.success(`${userName} has been unblocked.`);
      },
      onError: (err: any) => {
        toast.error(`Failed to unblock ${userName}: ${err.message}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('privacy-settings')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Blocked Users</h1>
      </div>

      <div className="py-6 px-6 flex-grow">
        {isLoading && <p className="text-center text-slate-400">Loading blocked users...</p>}
        {error && <p className="text-center text-red-400">Error loading blocked users.</p>}
        
        {!isLoading && !error && (
          <>
            {blockedUsers && blockedUsers.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                {blockedUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`flex items-center justify-between p-4 ${index < blockedUsers.length - 1 ? 'border-b border-white/10' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={24} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user.user_id, user.name)}
                      disabled={isUnblocking}
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      <UserX size={16} className="mr-2" />
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center">
                <Frown size={48} className="text-slate-500 mb-4" />
                <h2 className="text-lg font-semibold text-slate-300">No Blocked Users</h2>
                <p className="text-slate-400">Your block list is empty.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersScreen;
