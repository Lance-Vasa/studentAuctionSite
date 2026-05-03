import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import ListingDetailModal from '../components/ListingDetailModal';
import ListingCard, { type Listing } from '../components/ListingCard';
import { Link } from 'react-router-dom';

export default function YourListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const fetchListings = async () => {
    if (user?.userId) {
      try {
        const response = await api.get(`/listings?seller_id=${user.userId}&include_sold=true`);
        setListings(response.data);
      } catch (error) {
        console.error('Failed to fetch listings', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow py-1 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex justify-between items-center">
          <div className="min-w-0 text-left">
            <h2 className="text-[26px] font-bold leading-none text-[#C8102E] sm:text-[32px] sm:truncate font-nebraska py-1 mt-1">
              Your Listings
            </h2>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#C8102E] hover:bg-[#a00d25]"
          >
            Create New Listing
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">

      {listings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg mb-4">You haven't listed any items yet.</p>
          <Link to="/create" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Start selling today!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={(listingId) => setSelectedListingId(listingId)}
            />
          ))}
        </div>
      )}
      </div>

      {selectedListingId && (
        <ListingDetailModal
          listingId={selectedListingId}
          onClose={() => setSelectedListingId(null)}
          onListingChanged={fetchListings}
        />
      )}
    </div>
  );
}
