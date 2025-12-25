import { Link } from 'react-router-dom';
import clsx from 'clsx';

export interface Listing {
  id: string;
  title: string;
  price: number;
  listing_type: 'fixed' | 'auction';
  market_type: 'university' | 'general';
  expires_at?: string;
  is_sold?: boolean;
  image_url?: string;
}

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listings/${listing.id}`} className="block group relative aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
      {listing.image_url ? (
        <img 
          src={`http://localhost:3000${listing.image_url}`} 
          alt={listing.title} 
          className={clsx(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
            listing.is_sold && "opacity-50 grayscale"
          )}
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex gap-2 mb-1">
            <span className={clsx(
              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              listing.listing_type === 'auction' ? "bg-white text-[#C8102E]" : "bg-white text-[#C8102E]"
            )}>
              {listing.listing_type}
            </span>
            {listing.is_sold && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
                Sold
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold leading-tight truncate w-full drop-shadow-md">{listing.title}</h3>
          <div className="flex justify-between items-end w-full mt-1">
            <p className="text-xl font-bold text-white drop-shadow-md">${listing.price}</p>
            {listing.listing_type === 'auction' && listing.expires_at && (
              <p className="text-xs text-gray-300">Ends: {new Date(listing.expires_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
