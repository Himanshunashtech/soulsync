
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import type { LikeRequest } from '@/types/likes';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface LikeRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: LikeRequest | null;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isProcessing: boolean;
}

const LikeRequestDialog: React.FC<LikeRequestDialogProps> = ({ isOpen, onOpenChange, request, onAccept, onReject, isProcessing }) => {
  if (!request) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 p-1 border-2 border-pink-400">
              <img
                src={request.sender_profile.images?.[0] || '/placeholder.svg'}
                alt={request.sender_profile.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <AlertDialogTitle className="mt-4 text-2xl font-bold">
              {request.sender_profile.name}
              {request.sender_profile.age ? `, ${request.sender_profile.age}` : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 mt-1">
              Sent you a {request.type === 'super_like' ? 'Super Like' : 'Like'}!
            </AlertDialogDescription>
            {request.sender_profile.bio && (
              <p className="text-slate-300 mt-4 text-center">{request.sender_profile.bio}</p>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="!flex-row !justify-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600"
            onClick={() => onReject(request.id)}
            disabled={isProcessing}
          >
            <X className="w-8 h-8 text-slate-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-white"
            onClick={() => onAccept(request.id)}
            disabled={isProcessing}
          >
            <Heart className="w-8 h-8" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LikeRequestDialog;
