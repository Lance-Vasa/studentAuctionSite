import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Listing } from '../components/ListingCard';

const SimpleListingPreview = ({ listing }: { listing: Listing }) => (
  <Link to={`/listings/${listing.id}`} className="block group relative aspect-[3/1] rounded-lg overflow-hidden bg-gray-200 w-full">
    {listing.image_url ? (
      <img 
        src={`http://localhost:3000${listing.image_url}`} 
        alt={listing.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    ) : (
      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-500 text-xs">No Image</span>
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
    <div className="absolute bottom-0 left-0 right-0 p-2">
      <h3 className="text-white text-sm font-bold truncate">{listing.title}</h3>
    </div>
  </Link>
);

export default function Home() {
  const [uniListings, setUniListings] = useState<Listing[]>([]);
  const [genListings, setGenListings] = useState<Listing[]>([]);
  const [uniPopularListings, setUniPopularListings] = useState<Listing[]>([]);
  const [genPopularListings, setGenPopularListings] = useState<Listing[]>([]);
  const [uniTab, setUniTab] = useState<'recent' | 'popular'>('recent');
  const [genTab, setGenTab] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchPreviews();
  }, []);

  const fetchPreviews = async () => {
    try {
      const [uniRes, genRes, uniPopRes, genPopRes] = await Promise.all([
        api.get('/listings', { params: { market_type: 'university' } }),
        api.get('/listings', { params: { market_type: 'general' } }),
        api.get('/listings', { params: { market_type: 'university', sort_by: 'popular' } }),
        api.get('/listings', { params: { market_type: 'general', sort_by: 'popular' } })
      ]);
      // Take only first 3 items for preview
      setUniListings(uniRes.data.slice(0, 3));
      setGenListings(genRes.data.slice(0, 3));
      setUniPopularListings(uniPopRes.data.slice(0, 3));
      setGenPopularListings(genPopRes.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="-mt-6 -mx-4 sm:-mx-6 lg:-mx-8 p-1 grid grid-cols-1 lg:grid-cols-12 gap-1 h-[calc(100vh-4rem)]">
      {/* Left Column: Market Previews (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-1 h-full overflow-hidden">
        
        {/* Top Part: University Preview */}
        <div className="bg-white shadow rounded-lg p-2 flex-1 flex flex-col min-h-0 border-[0.5px] border-gray-300">
          <div className="flex justify-between items-center mb-1 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#C8102E] font-nebraska">Husker Gear</h2>
            <Link to="/husker-gear" className="text-sm text-black hover:text-gray-700 font-medium">
              View All &rarr;
            </Link>
          </div>
          <div className="flex space-x-4 mb-3 text-sm border-b border-gray-200">
            <button 
              onClick={() => setUniTab('recent')}
              className={`pb-1 ${uniTab === 'recent' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setUniTab('popular')}
              className={`pb-1 ${uniTab === 'popular' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Popular
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {(uniTab === 'recent' ? uniListings : uniPopularListings).map(listing => (
              <SimpleListingPreview key={listing.id} listing={listing} />
            ))}
            {(uniTab === 'recent' ? uniListings : uniPopularListings).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No items yet.</p>}
          </div>
        </div>

        {/* Bottom Part: General Preview */}
        <div className="bg-white shadow rounded-lg p-2 flex-1 flex flex-col min-h-0 border-[0.5px] border-gray-300">
          <div className="flex justify-between items-center mb-1 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#C8102E] font-nebraska">Dorm Market</h2>
            <Link to="/dorm-market" className="text-sm text-black hover:text-gray-700 font-medium">
              View All &rarr;
            </Link>
          </div>
          <div className="flex space-x-4 mb-3 text-sm border-b border-gray-200">
            <button 
              onClick={() => setGenTab('recent')}
              className={`pb-1 ${genTab === 'recent' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setGenTab('popular')}
              className={`pb-1 ${genTab === 'popular' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Popular
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {(genTab === 'recent' ? genListings : genPopularListings).map(listing => (
              <SimpleListingPreview key={listing.id} listing={listing} />
            ))}
            {(genTab === 'recent' ? genListings : genPopularListings).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No items yet.</p>}
          </div>
        </div>

      </div>

      {/* Middle Column: Blank (Placeholder) (6 cols) */}
      <div className="lg:col-span-6 bg-gray-100 border-[0.5px] border-gray-300 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 font-medium">Main Content Area (Blank)</span>
      </div>

      {/* Right Column: Chat (Placeholder) (3 cols) */}
      <div className="lg:col-span-3 bg-white shadow rounded-lg p-2 flex flex-col h-full border-[0.5px] border-gray-300">
        <h2 className="text-xl font-bold text-[#C8102E] mb-4 border-b pb-2 font-nebraska">Chat</h2>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-md border border-gray-100">
          <p className="text-gray-400 text-sm">Chat functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
