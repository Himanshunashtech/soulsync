
import React from 'react';
import { useBouquets, type Bouquet } from '@/hooks/useBouquets';
import { X, Loader2, Flower, Flower2, Gift, Heart, Sun, Sprout } from 'lucide-react';

interface BouquetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  'Single Red Rose': Flower2,
  'Sunflower Bouquet': Sun,
  'Tulip Mix': Flower,
  'Orchid': Sprout,
  'Lilly Bunch': Gift,
  'Mixed Wildflowers': Heart,
};

const BouquetSelectionModal: React.FC<BouquetSelectionModalProps> = ({ isOpen, onClose, receiverId, receiverName }) => {
  const { bouquets, loading, sending, sendBouquet } = useBouquets(receiverId);
  const [selectedBouquet, setSelectedBouquet] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (bouquet: Bouquet) => {
    setSelectedBouquet(bouquet.id);
    const success = await sendBouquet(bouquet.id);
    setSelectedBouquet(null);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Send Flowers to {receiverName}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-pink-400" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {bouquets.map((bouquet) => {
                const Icon = iconMap[bouquet.name] || Flower;
                return (
                  <button
                    key={bouquet.id}
                    onClick={() => handleSend(bouquet)}
                    disabled={sending}
                    className="relative group bg-white/5 rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center aspect-square"
                  >
                    <Icon size={48} className="mb-3 text-pink-400 transition-transform group-hover:scale-110" />
                    <p className="text-white font-medium">{bouquet.name}</p>
                    {sending && selectedBouquet === bouquet.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                          <Loader2 className="animate-spin text-white" size={24} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BouquetSelectionModal;
