import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import HuskerMarketplace from './pages/HuskerMarketplace';
import DormMarketplace from './pages/DormMarketplace';
import About from './pages/About';
import Help from './pages/Help';
import YourListings from './pages/YourListings';
import Cart from './pages/Cart';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="husker-gear" element={<HuskerMarketplace />} />
            <Route path="dorm-market" element={<DormMarketplace />} />
            <Route path="about" element={<About />} />
            <Route path="help" element={<Help />} />
            <Route path="your-listings" element={<YourListings />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="create" element={<CreateListing />} />
            <Route path="listings/:id" element={<ListingDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
