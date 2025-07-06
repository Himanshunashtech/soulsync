
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserMatches } from '@/hooks/useUserMatches';
import type { Post } from '@/hooks/useFeed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X, Check } from 'lucide-react';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToShare: Post | null;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ isOpen, onClose, postToShare }) => {
  const { user } = useAuth();
  const { matches, loading: loadingMatches } = useUserMatches();
  const [isSending, setIsSending] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  const handleToggleMatchSelection = (matchId: string) => {
    setSelectedMatchIds(prev =>
      prev.includes(matchId)
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleShareToSelectedMatches = async () => {
    if (!user || !postToShare || isSending || selectedMatchIds.length === 0) return;

    setIsSending(true);
    let messageContent = postToShare.content || "";
    if (postToShare.content && postToShare.image_url) {
        messageContent = `${postToShare.content}\n(Shared post)`;
    } else if (!postToShare.content && postToShare.image_url) {
        messageContent = "(Shared post with image)";
    } else if (postToShare.content && !postToShare.image_url) {
         messageContent = `${postToShare.content}\n(Shared post)`;
    }


    try {
      const sharePromises = selectedMatchIds.map(matchId => {
        return supabase.from('messages').insert({
          match_id: matchId,
          sender_id: user.id,
          content: messageContent,
          image_url: postToShare.image_url,
        });
      });

      const results = await Promise.all(sharePromises);
      const errors = results.map(r => r.error).filter(Boolean);
      
      if (errors.length > 0) {
        console.error('Errors sharing post:', errors);
        throw new Error('Could not share post to all selected chats.');
      }

      console.log("Post Shared!", `The post has been sent to ${selectedMatchIds.length} chat(s).`);
      onClose();
    } catch (error) {
      console.error('Error sharing post to chat:', error);
      console.error("Error", "Could not share the post. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!postToShare) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
            setSelectedMatchIds([]);
        }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select one or more matches to share this post with.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] w-full my-4">
          {loadingMatches && <p className="text-slate-400">Loading matches...</p>}
          {!loadingMatches && matches.length === 0 && (
            <p className="text-slate-400">You have no matches to share with.</p>
          )}
          <div className="space-y-1">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="w-full flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => handleToggleMatchSelection(match.matchId)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={match.otherUserImage || '/placeholder.svg'} alt={match.otherUserName} />
                  <AvatarFallback>{match.otherUserName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-200 flex-grow">{match.otherUserName}</span>
                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedMatchIds.includes(match.matchId) ? 'bg-pink-500 border-pink-500' : 'border-slate-600 bg-slate-700'}`}>
                  {selectedMatchIds.includes(match.matchId) && <Check size={16} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between flex-row-reverse sm:flex-row">
          <Button
              type="button"
              onClick={handleShareToSelectedMatches}
              disabled={isSending || selectedMatchIds.length === 0}
              className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50"
          >
              {isSending ? (
                  <>
                      <Send size={16} className="mr-2 animate-pulse" />
                      Sending...
                  </>
              ) : (
                  `Share to ${selectedMatchIds.length || ''}`.trim()
              )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-slate-600 hover:bg-slate-700">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;
