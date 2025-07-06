
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PostImageCarouselProps {
  images: { image_url: string; order: number }[];
}

const PostImageCarousel: React.FC<PostImageCarouselProps> = ({ images }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  
  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    onSelect(); // initial check
    return () => { emblaApi.off('select', onSelect) };
  }, [emblaApi]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative bg-black">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.sort((a,b) => a.order - b.order).map((image, index) => (
            <div className="flex-[0_0_100%] min-w-0 aspect-square" key={index}>
              <img src={image.image_url} alt={`Post image ${index + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
      {canScrollPrev && (
        <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10">
          <ChevronLeft size={24} />
        </button>
      )}
      {canScrollNext && (
        <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10">
          <ChevronRight size={24} />
        </button>
      )}
      {images.length > 1 &&
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index === selectedIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      }
    </div>
  );
};

export default PostImageCarousel;
