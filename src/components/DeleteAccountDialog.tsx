
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserX } from 'lucide-react';

export const DeleteAccountDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAccount } = useAuth();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount(reason);
      toast.success('Account deleted successfully.');
      // The auth provider will handle redirecting the user out of the app.
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 hover:bg-red-900/20 transition-colors text-red-500">
            <div className="flex items-start space-x-4">
              <UserX size={22} className="text-red-500 mt-1" />
              <div className="text-left">
                <span className="font-medium">Delete Account</span>
                <p className="text-sm text-slate-400">Permanently delete your account and all data.</p>
              </div>
            </div>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full gap-2 py-4">
          <Label htmlFor="reason" className="text-slate-300">
            Please tell us why you're leaving (optional)
          </Label>
          <Textarea
            id="reason"
            placeholder="Your feedback helps us improve."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-slate-900 border-slate-700 focus:ring-pink-500 resize-none"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
