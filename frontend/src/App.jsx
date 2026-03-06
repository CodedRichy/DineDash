import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantMenu from './pages/RestaurantMenu';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantMenu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
