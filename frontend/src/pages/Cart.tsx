import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import type { Listing } from '../components/ListingCard';
import ListingDetailModal from '../components/ListingDetailModal';

interface CartItem {
  id: string;
  listing: Listing & { is_sold?: boolean; expires_at?: string };
}

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (user?.userId) {
        try {
          const response = await api.get('/cart');
          setCartItems(response.data);
        } catch (error) {
          console.error('Failed to fetch cart', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const removeFromCart = async (id: string) => {
    try {
      await api.delete(`/cart/${id}`);
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const validItems = cartItems.filter(item => item.listing);

  const getItemPrice = (item: CartItem) => Number(item.listing.price);

  const isExpired = (item: CartItem) =>
    item.listing.listing_type === 'auction' &&
    item.listing.expires_at &&
    new Date(item.listing.expires_at) < new Date();

  const total = validItems
    .filter(item => !item.listing.is_sold && !isExpired(item))
    .reduce((sum, item) => sum + getItemPrice(item), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow py-1 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="min-w-0 text-left">
          <h2 className="text-[26px] font-bold leading-none text-[#C8102E] sm:text-[32px] sm:truncate font-nebraska py-1 mt-1">
            Your Cart
          </h2>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
      
      {validItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
          <Link to="/" className="text-[#C8102E] hover:text-[#a00d25] font-medium">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {validItems.map((item) => {
              const sold = item.listing.is_sold;
              const expired = isExpired(item);
              return (
                <li key={item.id} className="px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
                  <div className="flex items-center min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        <button
                          onClick={() => setSelectedListingId(item.listing.id)}
                          className="hover:underline text-left"
                        >
                          {item.listing.title}
                        </button>
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm text-gray-500">${getItemPrice(item).toFixed(2)}</p>
                        {sold && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Sold
                          </span>
                        )}
                        {!sold && expired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Auction Ended
                          </span>
                        )}
                        {item.listing.listing_type === 'auction' && !sold && !expired && item.listing.expires_at && (
                          <span className="text-xs text-gray-400">
                            Ends {new Date(item.listing.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex-shrink-0 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="bg-[#C8102E] text-white px-4 py-2 rounded-md hover:bg-[#a00d25]"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
      </div>

      {selectedListingId && (
        <ListingDetailModal
          listingId={selectedListingId}
          onClose={() => setSelectedListingId(null)}
        />
      )}

      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Checkout Coming Soon</h3>
            <p className="text-sm text-gray-500 mb-4">
              Online checkout is not yet available. Please contact the seller directly to arrange payment.
            </p>
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-[#C8102E] rounded-md hover:bg-[#a00d25]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
