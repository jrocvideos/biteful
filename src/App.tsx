import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { OrderHistory } from './pages/OrderHistory';
import { DriverApp } from './pages/DriverApp';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTracking } from './pages/OrderTracking';
import { useCart } from './hooks/useCart';

function App() {
  const cart = useCart();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Header cartCount={cart.itemCount} onCartClick={() => cart.setIsOpen(true)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage onAddToCart={cart.addToCart} />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail onAddToCart={cart.addToCart} />} />
          <Route path="/checkout" element={
            <CheckoutPage 
              items={cart.items} 
              total={cart.total} 
              onUpdateQuantity={cart.updateQuantity}
              onRemove={cart.removeFromCart}
              onClearCart={cart.clearCart}
            />
          } />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/driver" element={<DriverApp />} />
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
