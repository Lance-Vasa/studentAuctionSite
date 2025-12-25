import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  listing_type: 'fixed' | 'auction';
  market_type: 'university' | 'general';
  expires_at?: string;
  seller: { id: string; email: string };
  is_sold: boolean;
  image_url?: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder: { email: string };
  created_at: string;
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchListing();
    if (listing?.listing_type === 'auction') {
      fetchBids();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
      if (res.data.listing_type === 'auction') {
        fetchBids();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBids = async () => {
    try {
      const res = await api.get(`/bids/listing/${id}`);
      setBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/bids', {
        listing_id: id,
        amount: parseFloat(bidAmount),
      });
      setBidAmount('');
      fetchBids();
      alert('Bid placed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place bid');
    }
  };

  const addToCart = async () => {
    setError(null);
    try {
      await api.post('/cart', { listingId: id });
      alert('Added to cart!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/listings/${id}`);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete listing');
      setShowDeleteModal(false);
    }
  };

  if (!listing) return <div>Loading...</div>;

  const currentPrice = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : listing.price;
  const isOwner = user?.userId === listing.seller.id;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Listing</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Deleted Successfully</h3>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {listing.image_url && (
          <div className="w-full aspect-square overflow-hidden bg-gray-200">
            <img 
              src={`http://localhost:3000${listing.image_url}`} 
              alt={listing.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{listing.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Sold by {listing.seller.email}</p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Listing
            </button>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.description}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{listing.listing_type}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {listing.listing_type === 'auction' ? 'Current Highest Bid' : 'Price'}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold text-lg">
                ${listing.listing_type === 'auction' ? currentPrice : listing.price}
              </dd>
            </div>
            {listing.listing_type === 'auction' && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Ends At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {listing.expires_at ? new Date(listing.expires_at).toLocaleString() : 'N/A'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {listing.listing_type === 'auction' && !listing.is_sold && user && !isOwner && (
        <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Place a Bid</h4>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleBid} className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                required
                min={currentPrice + 0.01}
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Enter more than $${currentPrice}`}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Place Bid
            </button>
          </form>
        </div>
      )}

      {listing.listing_type === 'fixed' && !listing.is_sold && user && !isOwner && (
        <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={addToCart}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add to Cart
          </button>
        </div>
      )}

      {listing.listing_type === 'auction' && bids.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Bid History</h4>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bids.map((bid) => (
                <li key={bid.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">${bid.amount}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {bid.bidder.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(bid.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
