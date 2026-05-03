import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#C8102E] shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-4xl font-bold text-white font-nebraska pt-1"
              >
                UNListings
              </Link>
            </div>
            
            <div className="hidden sm:flex sm:space-x-8 flex-1 justify-center">
              <Link to="/" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                Home
              </Link>
              <Link to="/husker-gear" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                Husker Gear
              </Link>
              <Link to="/dorm-market" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                Dorm Market
              </Link>
              {user && (
                <>
                  <Link to="/your-listings" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                    Your Listings
                  </Link>
                  <Link to="/cart" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                    Cart
                  </Link>
                  <Link to="/create" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                    Sell
                  </Link>
                </>
              )}
              <Link to="/help" className="border-transparent text-white hover:border-white hover:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-nebraska">
                Help
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {user ? (
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center text-sm font-medium text-white hover:text-gray-200 focus:outline-none font-nebraska"
                    >
                      My Account
                      <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        {user.email}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-4">
                  <Link to="/login" className="text-white hover:text-gray-200 text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-white text-[#C8102E] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-[#a00d25]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                Home
              </Link>
              <Link to="/husker-gear" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                Husker Gear
              </Link>
              <Link to="/dorm-market" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                Dorm Market
              </Link>
              {user && (
                <>
                  <Link to="/your-listings" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    Your Listings
                  </Link>
                  <Link to="/cart" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    Cart
                  </Link>
                  <Link to="/create" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    Sell
                  </Link>
                  <Link to="/profile" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    My Profile
                  </Link>
                  <button
                    onClick={() => { closeMobileMenu(); handleLogout(); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska"
                  >
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link to="/login" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                    Register
                  </Link>
                </>
              )}
              <Link to="/help" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#a00d25] font-nebraska">
                Help
              </Link>
            </div>
          </div>
        )}
      </nav>
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
