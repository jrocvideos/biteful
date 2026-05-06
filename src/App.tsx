import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { OrderHistory } from './pages/OrderHistory';
import { DriverApp } from './pages/DriverApp';
import { DriverSignup } from './pages/DriverSignup';
import { BusinessSignup } from './pages/BusinessSignup';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider } from './lib/auth';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { RestaurantKDS } from './pages/RestaurantKDS';
import { KDSDownload } from './pages/KDSDownload';
import { KDSDownload } from './pages/KDSDownload';
import { KDSDownload } from './pages/KDSDownload';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTracking } from './pages/OrderTracking';
import { useCart } from './hooks/useCart';
import { DriverDownload } from './pages/DriverDownload';
import { YolandaDashboard } from './pages/YolandaDashboard';
import { PeterDashboard } from './pages/PeterDashboard';
import { CTODashboard } from './pages/CTODashboard';

function AppInner() {
  const cart = useCart();
  const location = useLocation();
  const isBiz = location.pathname === '/biz' || location.pathname === '/cgo' || location.pathname === '/cto' || location.pathname.startsWith('/r/');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isBiz && <Header cartCount={cart.itemCount} onCartClick={() => cart.setIsOpen(true)} />}
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
          <Route path="/driver/signup" element={<DriverSignup />} />
          <Route path="/business" element={<BusinessSignup />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/r/:slug/orders" element={<RestaurantKDS />} />
          <Route path="/biz" element={<YolandaDashboard />} />
          <Route path="/cgo" element={<PeterDashboard />} />
          <Route path="/cto" element={<CTODashboard />} />
          <Route path="/driver-download" element={<DriverDownload />} />
          <Route path="/kds-download" element={<KDSDownload />} />
          
              </Routes>
      {!isBiz && <Footer />}
      {!isBiz && <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        total={cart.total}
      />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
