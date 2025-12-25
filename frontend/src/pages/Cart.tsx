import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import type { Listing } from '../components/ListingCard';

interface CartItem {
  id: string;
  listing: Listing;
}

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

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
  const total = validItems.reduce((sum, item) => sum + Number(item.listing.price), 0);

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
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {validItems.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link to={`/listings/${item.listing.id}`} className="hover:underline">
                        {item.listing.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">${item.listing.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Checkout
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
