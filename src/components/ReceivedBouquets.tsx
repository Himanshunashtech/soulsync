
import React from 'react';
import type { ReceivedBouquet } from '@/hooks/useReceivedBouquets';
import { Gift, Flower, Flower2, Sun, Sprout, Heart } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  'Single Red Rose': Flower2,
  'Sunflower Bouquet': Sun,
  'Tulip Mix': Flower,
  'Orchid': Sprout,
  'Lilly Bunch': Gift,
  'Mixed Wildflowers': Heart,
};

interface ReceivedBouquetsProps {
    bouquets: ReceivedBouquet[];
    loading: boolean;
}

const ReceivedBouquets: React.FC<ReceivedBouquetsProps> = ({ bouquets, loading }) => {
    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm text-center">
                <p className="text-slate-300">Loading flowers...</p>
            </div>
        );
    }

    return (
         <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Flowers Received</h3>
            {bouquets.length === 0 ? (
                <div className="text-center py-8">
                    <Gift size={32} className="text-purple-400 mx-auto mb-4" />
                    <p className="text-slate-300">No flowers received yet.</p>
                    <p className="text-slate-400 text-sm">When someone sends you flowers, they'll appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {bouquets.map((item) => {
                        const Icon = iconMap[item.bouquet_name] || Flower;
                        return (
                        <div key={`${item.sender_id}-${item.bouquet_id}`} className="flex flex-col items-center bg-white/5 p-3 rounded-xl text-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <Icon size={40} className="text-pink-400" />
                                {item.bouquet_count > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                        x{item.bouquet_count}
                                    </span>
                                )}
                            </div>
                            <p className="text-white mt-2 text-sm font-medium">{item.bouquet_name}</p>
                            <p className="text-slate-400 text-xs">from</p>
                            <div className="flex items-center space-x-2 mt-1">
                               <img src={item.sender_image || '/placeholder.svg'} alt={item.sender_name} className="w-6 h-6 rounded-full object-cover" />
                               <p className="text-purple-400 text-sm font-semibold truncate">{item.sender_name}</p>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    )
};

export default ReceivedBouquets;
