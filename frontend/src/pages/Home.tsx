import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Listing } from '../components/ListingCard';
import ListingDetailModal from '../components/ListingDetailModal';
import { useAuth } from '../context/AuthContext';

const SimpleListingPreview = ({ listing, onOpen }: { listing: Listing; onOpen: (listingId: string) => void }) => (
  <button
    type="button"
    onClick={() => onOpen(listing.id)}
    className="block group relative aspect-[3/1] rounded-lg overflow-hidden bg-gray-200 w-full text-left"
  >
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
  </button>
);

export default function Home() {
  const { user } = useAuth();
  const [uniListings, setUniListings] = useState<Listing[]>([]);
  const [genListings, setGenListings] = useState<Listing[]>([]);
  const [uniPopularListings, setUniPopularListings] = useState<Listing[]>([]);
  const [genPopularListings, setGenPopularListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [uniTab, setUniTab] = useState<'recent' | 'popular'>('recent');
  const [genTab, setGenTab] = useState<'recent' | 'popular'>('recent');

  // Dashboard State (logged-in)
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);

  // Chat State
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatTab, setChatTab] = useState<'global' | 'private'>('global');

  useEffect(() => {
    fetchPreviews();
  }, []);

  // Fetch dashboard data when user is logged in
  useEffect(() => {
    if (!user) return;
    const fetchDashboard = async () => {
      try {
        const [listingsRes, bidsRes, cartRes] = await Promise.all([
          api.get('/listings', { params: { seller_id: user.userId, include_sold: 'true' } }),
          api.get('/bids/my-bids'),
          api.get('/cart'),
        ]);
        setMyListings(listingsRes.data.slice(0, 3));
        setMyBids(bidsRes.data.slice(0, 4));
        setCartCount(cartRes.data.length);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchDashboard();
  }, [user]);

  // Poll for public messages
  useEffect(() => {
    const fetchPublicMessages = async () => {
      try {
        const res = await api.get('/messages/public');
        setPublicMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch public messages', err);
      }
    };

    fetchPublicMessages();
    const interval = setInterval(fetchPublicMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Poll for conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user]);

  // Poll for active chat messages
  useEffect(() => {
    if (!user || !activeChatUser) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeChatUser.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [user, activeChatUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (chatTab === 'global') {
        await api.post('/messages', {
          content: newMessage
        });
        setNewMessage('');
        const res = await api.get('/messages/public');
        setPublicMessages(res.data);
      } else if (activeChatUser) {
        await api.post('/messages', {
          receiver_id: activeChatUser.id,
          content: newMessage
        });
        setNewMessage('');
        const res = await api.get(`/messages/${activeChatUser.id}`);
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

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
              <SimpleListingPreview key={listing.id} listing={listing} onOpen={setSelectedListingId} />
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
              <SimpleListingPreview key={listing.id} listing={listing} onOpen={setSelectedListingId} />
            ))}
            {(genTab === 'recent' ? genListings : genPopularListings).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No items yet.</p>}
          </div>
        </div>

      </div>

      {/* Middle Column: Hero (logged-out) or Dashboard (logged-in) */}
      <div className="lg:col-span-6 flex flex-col h-full overflow-y-auto gap-2">
        {!user ? (
          /* --- LOGGED OUT: Nebraska-branded hero --- */
          <div className="flex flex-col h-full">
            {/* Hero banner */}
            <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ minHeight: '220px' }}>
              <div className="absolute inset-0 bg-[#C8102E]" />
              {/* Decorative corn rows */}
              <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute bottom-0 w-1 bg-white rounded-t-full" style={{ left: `${8 + i * 12}%`, height: `${40 + (i % 3) * 20}%`, opacity: 0.6 }} />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full py-10 px-6 text-center">
                <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-2">University of Nebraska</p>
                <h1 className="font-nebraska text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
                  UNListings
                </h1>
                <p className="text-white/90 text-base sm:text-lg max-w-md mb-6">
                  The student marketplace for Husker Gear &amp; Dorm Essentials. Buy, sell, and bid with fellow Cornhuskers.
                </p>
                <div className="flex gap-3">
                  <Link to="/register" className="bg-white text-[#C8102E] font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors">
                    Get Started
                  </Link>
                  <Link to="/husker-gear" className="border border-white text-white font-medium px-6 py-2 rounded-full text-sm hover:bg-white/10 transition-colors">
                    Browse Listings
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature tiles */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { title: 'Husker Gear', desc: 'Jerseys, hats, flags & more', to: '/husker-gear' },
                { title: 'Dorm Market', desc: 'Furniture, bedding & essentials', to: '/dorm-market' },
                { title: 'Live Auctions', desc: 'Bid and win at your price', to: '/husker-gear' },
              ].map((tile) => (
                <Link key={tile.title} to={tile.to} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:border-[#C8102E] hover:shadow-sm transition-all group">
                  <span className="font-bold text-sm text-gray-800 group-hover:text-[#C8102E]">{tile.title}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{tile.desc}</span>
                </Link>
              ))}
            </div>

            {/* Stats row */}
            <div className="bg-white border border-gray-200 rounded-lg mt-2 grid grid-cols-3 divide-x divide-gray-100">
              {[
                { label: 'Active Listings', value: (uniListings.length + genListings.length) || '—' },
                { label: 'Live Auctions', value: [...uniListings, ...genListings].filter(l => l.listing_type === 'auction').length || '—' },
                { label: 'Categories', value: 2 },
              ].map((stat) => (
                <div key={stat.label} className="py-4 flex flex-col items-center">
                  <span className="text-2xl font-black text-[#C8102E] font-nebraska">{stat.value}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- LOGGED IN: Personal Dashboard --- */
          <div className="flex flex-col gap-2 h-full">
            {/* Welcome bar */}
            <div className="bg-[#C8102E] text-white rounded-lg px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-white/75 text-xs">Welcome back,</p>
                <p className="font-bold font-nebraska text-lg leading-tight">{user.email?.split('@')[0]}</p>
              </div>
            </div>

            {/* Two-column: Your Listings + Your Bids */}
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
              {/* Your Listings */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h3 className="font-bold text-sm text-gray-800">Your Listings</h3>
                  <Link to="/your-listings" className="text-xs text-[#C8102E] hover:underline">View all →</Link>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {myListings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-4">
                      <p className="text-gray-400 text-xs mb-2">No listings yet</p>
                      <Link to="/create" className="text-xs text-[#C8102E] font-medium hover:underline">Create your first →</Link>
                    </div>
                  ) : myListings.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedListingId(l.id)}
                      className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 text-left group"
                    >
                      <div className="w-12 h-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {l.image_url
                          ? <img src={`http://localhost:3000${l.image_url}`} alt={l.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate group-hover:text-[#C8102E]">{l.title}</p>
                        <p className="text-xs text-gray-500">${Number(l.price).toFixed(2)}</p>
                      </div>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${l.listing_type === 'auction' ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {l.listing_type === 'auction' ? 'Auction' : 'Fixed'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Your Bids */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h3 className="font-bold text-sm text-gray-800">Your Bids</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {myBids.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-4">
                      <p className="text-gray-400 text-xs mb-2">No bids placed yet</p>
                      <Link to="/husker-gear" className="text-xs text-[#C8102E] font-medium hover:underline">Browse auctions →</Link>
                    </div>
                  ) : myBids.map((bid) => (
                    <button
                      key={bid.id}
                      type="button"
                      onClick={() => bid.listing && setSelectedListingId(bid.listing.id)}
                      className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 text-left group"
                    >
                      <div className="w-12 h-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                        {bid.listing?.image_url
                          ? <img src={`http://localhost:3000${bid.listing.image_url}`} alt={bid.listing.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate group-hover:text-[#C8102E]">{bid.listing?.title ?? 'Unknown'}</p>
                        <p className="text-xs text-green-600 font-semibold">Your bid: ${Number(bid.amount).toFixed(2)}</p>
                      </div>
                      {bid.listing?.is_sold && (
                        <span className="ml-auto text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full flex-shrink-0">Ended</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Right Column: Chat (3 cols) */}
      <div className="lg:col-span-3 bg-white shadow rounded-lg p-2 flex flex-col h-full border-[0.5px] border-gray-300">
        <h2 className="text-xl font-bold text-[#C8102E] mb-2 border-b pb-2 font-nebraska">Chat</h2>
        
        {/* Chat Tabs */}
        <div className="flex space-x-4 mb-2 text-sm border-b border-gray-200">
          <button 
            onClick={() => { setChatTab('global'); setActiveChatUser(null); }}
            className={`pb-1 ${chatTab === 'global' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Global
          </button>
          <button 
            onClick={() => setChatTab('private')}
            className={`pb-1 ${chatTab === 'private' ? 'text-black font-bold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Messages
          </button>
        </div>

        {!user ? (
          <div className="flex-1 relative overflow-hidden rounded-md">
            {/* Blurred fake chat behind overlay */}
            <div className="absolute inset-0 blur-sm pointer-events-none select-none p-2 bg-gray-50 space-y-3">
              {[
                { side: 'start', name: 'husker_fan', text: 'Anyone selling Husker tickets?' },
                { side: 'end',   name: 'You',        text: 'Just listed a crewneck, check it out!' },
                { side: 'start', name: 'dorm_dweller', text: 'Need a futon for my room asap' },
                { side: 'end',   name: 'You',        text: 'I have one listed — great deal' },
                { side: 'start', name: 'husker_fan', text: 'Is the laptop still available?' },
                { side: 'start', name: 'dorm_dweller', text: 'What dorm are you in?' },
                { side: 'end',   name: 'You',        text: 'Abel, can meet anytime' },
                { side: 'start', name: 'husker_fan', text: 'GBR!' },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.side === 'end' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${msg.side === 'end' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.name}</span>
                    <div className={`rounded-lg px-3 py-1.5 text-sm ${msg.side === 'end' ? 'bg-[#C8102E] text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Login overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
              </svg>
              <p className="text-gray-600 text-sm font-medium">Log in to chat</p>
            </div>
          </div>
        ) : chatTab === 'global' ? (
          // Global Chat View
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded mb-2">
              {publicMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === user.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex flex-col ${msg.sender_id === user.userId ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-500 mb-0.5 px-1">
                      {msg.sender_id === user.userId ? 'You' : msg.sender?.email?.split('@')[0] || 'User'}
                    </span>
                    <div 
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        msg.sender_id === user.userId 
                          ? 'bg-[#C8102E] text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {publicMessages.length === 0 && <p className="text-center text-gray-400 text-xs mt-4">No messages yet.</p>}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#C8102E]"
              />
              <button 
                type="submit"
                className="bg-[#C8102E] text-white px-3 py-1 rounded text-sm hover:bg-[#a00d25]"
              >
                Send
              </button>
            </form>
          </div>
        ) : activeChatUser ? (
          // Active Private Chat View
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <span className="font-bold text-sm truncate">{activeChatUser.email}</span>
              <button 
                onClick={() => setActiveChatUser(null)}
                className="text-xs text-gray-500 hover:text-black"
              >
                Back
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded mb-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === user.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
                      msg.sender_id === user.userId 
                        ? 'bg-[#C8102E] text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-gray-400 text-xs mt-4">No messages yet.</p>}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#C8102E]"
              />
              <button 
                type="submit"
                className="bg-[#C8102E] text-white px-3 py-1 rounded text-sm hover:bg-[#a00d25]"
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          // Conversation List View
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">No conversations yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setActiveChatUser(conv.user)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <div className="font-bold text-sm text-gray-900 truncate">{conv.user.email}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedListingId && (
        <ListingDetailModal
          listingId={selectedListingId}
          onClose={() => setSelectedListingId(null)}
          onListingChanged={fetchPreviews}
        />
      )}
    </div>
  );
}
