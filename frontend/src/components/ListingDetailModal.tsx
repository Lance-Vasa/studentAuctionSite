import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AUCTION_DURATION_OPTIONS = [
  { value: '1h', label: '1 hour', hours: 1 },
  { value: '3h', label: '3 hours', hours: 3 },
  { value: '12h', label: '12 hours', hours: 12 },
  { value: '1d', label: '1 day', hours: 24 },
  { value: '2d', label: '2 days', hours: 48 },
  { value: '1w', label: '1 week', hours: 168 },
];

function deriveDurationOption(createdAt: string, expiresAt?: string) {
  if (!expiresAt) {
    return '1d';
  }

  const created = new Date(createdAt).getTime();
  const expires = new Date(expiresAt).getTime();
  const hours = Math.round((expires - created) / (1000 * 60 * 60));
  const match = AUCTION_DURATION_OPTIONS.find((option) => option.hours === hours);
  return match ? match.value : '1d';
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  views: number;
  listing_type: 'fixed' | 'auction';
  market_type: 'university' | 'general';
  expires_at?: string;
  created_at: string;
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

type ListingDetailModalProps = {
  listingId: string;
  onClose: () => void;
  onListingChanged?: () => void;
};

export default function ListingDetailModal({ listingId, onClose, onListingChanged }: ListingDetailModalProps) {
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [hasEditedBidAmount, setHasEditedBidAmount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const [showMessageSuccessModal, setShowMessageSuccessModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMarketType, setEditMarketType] = useState<'university' | 'general'>('general');
  const [editAuctionDuration, setEditAuctionDuration] = useState('1d');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const run = async () => {
      if (user) {
        try {
          await api.post(`/listings/${listingId}/view`);
        } catch (err) {
          // Non-blocking: listing modal should still open even if view tracking fails.
          console.error('Failed to track listing view', err);
        }
      }
      await fetchListing();
    };
    run();
  }, [listingId, user]);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${listingId}`);
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
      const res = await api.get(`/bids/listing/${listingId}`);
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
        listing_id: listingId,
        amount: parseFloat(bidAmount),
      });
      setHasEditedBidAmount(false);
      setBidAmount('');
      fetchBids();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place bid');
    }
  };

  const addToCart = async () => {
    setError(null);
    try {
      await api.post('/cart', { listingId });
      setShowCartSuccessModal(true);
      setTimeout(() => {
        setShowCartSuccessModal(false);
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleMessageSeller = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/messages', {
        receiver_id: listing?.seller.id,
        content: `Hi, I'm interested in your listing: ${listing?.title}`,
      });
      setShowMessageSuccessModal(true);
      setTimeout(() => setShowMessageSuccessModal(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/listings/${listingId}`);
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onListingChanged?.();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete listing');
      setShowDeleteModal(false);
    }
  };

  const canEditAuctionTime =
    !!listing &&
    listing.listing_type === 'auction' &&
    Date.now() - new Date(listing.created_at).getTime() <= 5 * 60 * 1000;

  const startEditing = () => {
    if (!listing) {
      return;
    }

    setEditTitle(listing.title);
    setEditDescription(listing.description);
    setEditMarketType(listing.market_type);
    setEditAuctionDuration(deriveDurationOption(listing.created_at, listing.expires_at));
    setEditImage(null);
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditImage(null);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) {
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const data = new FormData();
      data.append('title', editTitle);
      data.append('description', editDescription);
      data.append('market_type', editMarketType);

      if (listing.listing_type === 'auction' && canEditAuctionTime) {
        const selectedDuration = AUCTION_DURATION_OPTIONS.find(
          (option) => option.value === editAuctionDuration,
        );
        const hoursToAdd = selectedDuration ? selectedDuration.hours : 24;
        const expiresAt = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
        data.append('expires_at', expiresAt.toISOString());
      }

      if (editImage) {
        data.append('image', editImage);
      }

      await api.patch(`/listings/${listing.id}`, data);
      await fetchListing();
      onListingChanged?.();
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to save listing updates.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const currentPrice = listing
    ? bids.length > 0
      ? Math.max(...bids.map((b) => Number(b.amount)))
      : Number(listing.price)
    : 0;
  const isOwner = user?.userId === listing?.seller.id;

  useEffect(() => {
    if (!listing || listing.listing_type !== 'auction' || !user || isOwner) {
      return;
    }

    if (!hasEditedBidAmount) {
      setBidAmount((currentPrice + 1).toFixed(2));
    }
  }, [listing, user, isOwner, currentPrice, hasEditedBidAmount]);

  if (!listing) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/95 text-gray-700 hover:bg-white shadow"
            aria-label="Close listing modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Deleted Successfully</h3>
              </div>
            </div>
          )}

          {showCartSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Added to Cart</h3>
                <p className="text-sm text-gray-500">Item successfully added to cart.</p>
              </div>
            </div>
          )}

          {showMessageSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent</h3>
                <p className="text-sm text-gray-500">Your message has been sent to the seller.</p>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gray-200">
                {listing.image_url ? (
                  <div className="w-full h-full min-h-[280px] md:min-h-[520px]">
                    <img
                      src={`http://localhost:3000${listing.image_url}`}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[280px] md:min-h-[520px] flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              <div className="border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{listing.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Sold by {listing.seller.email}</p>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={isEditing ? cancelEditing : startEditing}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25]"
                      >
                        {isEditing ? 'Cancel Edit' : 'Edit Listing'}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete Listing
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4 py-5 sm:px-6">
                  <dl className="space-y-5">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{listing.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{listing.listing_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Listing Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(listing.created_at).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Item Views</dt>
                      <dd className="mt-1 text-sm text-gray-900">{listing.views}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        {listing.listing_type === 'auction' ? 'Current Highest Bid' : 'Price'}
                      </dt>
                      <dd className="mt-1 text-gray-900 font-bold text-2xl">
                        ${listing.listing_type === 'auction' ? currentPrice.toFixed(2) : Number(listing.price).toFixed(2)}
                      </dd>
                    </div>
                    {listing.listing_type === 'auction' && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ends At</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {listing.expires_at ? new Date(listing.expires_at).toLocaleString() : 'N/A'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {isOwner && isEditing && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Edit Listing</h4>
              {editError && <p className="mb-3 text-sm text-red-700">{editError}</p>}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={100}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={editMarketType}
                    onChange={(e) => setEditMarketType(e.target.value as 'university' | 'general')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                  >
                    <option value="general">Dorm Market</option>
                    <option value="university">Husker Gear</option>
                  </select>
                </div>

                {listing.listing_type === 'auction' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auction Time</label>
                    <select
                      value={editAuctionDuration}
                      onChange={(e) => setEditAuctionDuration(e.target.value)}
                      disabled={!canEditAuctionTime}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 disabled:bg-gray-100 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                    >
                      {AUCTION_DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {!canEditAuctionTime && (
                      <p className="mt-2 text-xs text-gray-500">
                        Auction time can only be changed within 5 minutes of posting.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Replace Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#fdf2f4] file:text-[#C8102E]
                      hover:file:bg-[#fce7eb]"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25] disabled:opacity-60"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {listing.listing_type === 'auction' && !listing.is_sold && user && !isOwner && (() => {
            const isTopBidder = bids.length > 0 && bids[0].bidder?.email === user.email;
            return (
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Place a Bid</h4>
                {isTopBidder ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    You are currently the highest bidder at ${currentPrice.toFixed(2)}.
                  </div>
                ) : (
                  <>
                    {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
                    <form onSubmit={handleBid} className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          required
                          min={currentPrice + 1}
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => {
                            setHasEditedBidAmount(true);
                            setBidAmount(e.target.value);
                          }}
                          placeholder={`Enter at least $${(currentPrice + 1).toFixed(2)}`}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C8102E] focus:border-[#C8102E] sm:text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25]"
                      >
                        Place Bid
                      </button>
                      <button
                        type="button"
                        onClick={handleMessageSeller}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Message Seller
                      </button>
                    </form>
                  </>
                )}
              </div>
            );
          })()}

          {listing.listing_type === 'fixed' && !listing.is_sold && user && !isOwner && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
              <button
                onClick={addToCart}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add to Cart
              </button>
              <button
                onClick={handleMessageSeller}
                className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Message Seller
              </button>
            </div>
          )}

          {listing.listing_type === 'auction' && bids.length > 0 && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Bid History</h4>
              <div className="bg-white shadow overflow-hidden rounded-md">
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
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{new Date(bid.created_at).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
