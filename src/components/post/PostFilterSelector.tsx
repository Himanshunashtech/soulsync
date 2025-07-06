
import React from 'react';

interface Filter {
  name: string;
  class: string;
}

interface PostFilterSelectorProps {
  filters: Filter[];
  selectedFilter: string;
  onSelectFilter: (filterClass: string) => void;
  previewImage: string;
}

const PostFilterSelector: React.FC<PostFilterSelectorProps> = ({
  filters,
  selectedFilter,
  onSelectFilter,
  previewImage,
}) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-slate-400 mb-2">Apply a filter</p>
      <div className="flex overflow-x-auto space-x-3 pb-2">
        {filters.map((filter) => (
          <div key={filter.name} className="text-center flex-shrink-0">
            <button
              onClick={() => onSelectFilter(filter.class)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedFilter === filter.class ? 'border-pink-500 scale-105' : 'border-transparent'
              }`}
            >
              <img
                src={previewImage}
                alt={`${filter.name} filter preview`}
                className={`w-full h-full object-cover ${filter.class}`}
              />
            </button>
            <p className={`text-xs mt-1 transition-colors ${selectedFilter === filter.class ? 'text-white' : 'text-slate-400'}`}>
              {filter.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFilterSelector;
