import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { MyOrders } from './pages/MyOrders';
import { DriverApp } from './pages/DriverApp';nimport { RestaurantDashboard } from './pages/RestaurantDashboard';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { useCart } from './hooks/useCart';

function App() {
  const cart = useCart();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Header cartCount={cart.itemCount} onCartClick={() => cart.setIsOpen(true)} />
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={cart.addToCart} />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail onAddToCart={cart.addToCart} />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/driver" element={<DriverApp />} />n          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
        </Routes>
        <Footer />
        <CartDrawer 
          isOpen={cart.isOpen}
          onClose={() => cart.setIsOpen(false)}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemove={cart.removeFromCart}
          total={cart.total}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
