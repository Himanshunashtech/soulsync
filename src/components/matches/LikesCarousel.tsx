
import React, { useState } from 'react';
import { useLikeRequests } from '@/hooks/useLikeRequests';
import { Skeleton } from '@/components/ui/skeleton';
import type { LikeRequest } from '@/types/likes';
import LikeRequestDialog from './LikeRequestDialog';

interface LikesCarouselProps {
  onAccept: () => void;
}

const LikesCarousel: React.FC<LikesCarouselProps> = ({ onAccept }) => {
  const { likeRequests, loading, updateLikeRequestStatus } = useLikeRequests();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LikeRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const { error } = await updateLikeRequestStatus(requestId, 'accepted');
    if (!error) {
      onAccept();
    }
    setProcessingId(null);
    setIsDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    await updateLikeRequestStatus(requestId, 'rejected');
    setProcessingId(null);
    setIsDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleProfileClick = (request: LikeRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="px-6 my-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (likeRequests.length === 0) {
    return null;
  }

  return (
    <div className="px-6 my-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Likes <span className="text-slate-400 font-normal">{likeRequests.length}</span>
      </h2>
      <div className="flex overflow-x-auto space-x-4 -mx-6 px-6 pb-4">
        {likeRequests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer text-center w-20"
            onClick={() => handleProfileClick(request)}
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 p-1 border-2 border-pink-400 flex-shrink-0">
              <img
                src={request.sender_profile.images?.[0] || '/placeholder.svg'}
                alt={request.sender_profile.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <p className="font-medium text-white text-sm truncate w-full">{request.sender_profile.name}</p>
          </div>
        ))}
      </div>
      <LikeRequestDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        request={selectedRequest}
        onAccept={handleAccept}
        onReject={handleReject}
        isProcessing={!!processingId}
      />
    </div>
  );
};

export default LikesCarousel;
