import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
import ListingDetailModal from '../components/ListingDetailModal';
import type { Listing } from '../components/ListingCard';

export default function HuskerMarketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [priceFilter, typeFilter, dateFilter]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { market_type: 'university' };
      if (search) params.search = search;
      
      if (typeFilter !== 'all') params.listing_type = typeFilter;
      
      if (dateFilter !== 'all') {
        params.days_ago = dateFilter;
      }

      if (priceFilter !== 'all') {
        switch (priceFilter) {
          case 'under25':
            params.max_price = 25;
            break;
          case '25-50':
            params.min_price = 25;
            params.max_price = 50;
            break;
          case '50-100':
            params.min_price = 50;
            params.max_price = 100;
            break;
          case 'over100':
            params.min_price = 100;
            break;
        }
      }
      
      const res = await api.get('/listings', { params });
      setListings(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow py-1 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 items-center">
          <div className="min-w-0 text-left">
            <h2 className="text-[26px] font-bold leading-none text-[#C8102E] sm:text-[32px] sm:truncate font-nebraska py-1 mt-1">
              Husker Gear
            </h2>
          </div>
          <div className="flex justify-center w-full col-span-2 md:col-span-1">
            <div className="flex w-full max-w-4xl gap-2">
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="shadow-sm focus:ring-[#C8102E] focus:border-[#C8102E] block w-full text-base border-gray-300 rounded-l-md py-2 px-4"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-r-md shadow-sm text-base font-medium text-white bg-[#C8102E] hover:bg-[#a00d25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8102E]"
                >
                  Search
                </button>
              </form>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-[#C8102E] text-sm font-medium rounded-md text-[#C8102E] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8102E]"
              >
                Filters
              </button>
            </div>
          </div>
          <div className="hidden md:block"></div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm rounded-md"
                >
                  <option value="all">All Prices</option>
                  <option value="under25">Under $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="over100">Over $100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="auction">Auction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Listed</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm rounded-md"
                >
                  <option value="all">Any Time</option>
                  <option value="1">Last 24 Hours</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8102E]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#C8102E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : error ? (
          <p className="text-red-600 col-span-full text-center py-10">{error}</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No Husker Gear listings found.</p>
        ) : (
          listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={(listingId) => setSelectedListingId(listingId)}
            />
          ))
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
