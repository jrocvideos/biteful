import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RestaurantGrid } from './components/RestaurantGrid';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { useCart } from './hooks/useCart';

function App() {
  const cart = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header cartCount={cart.itemCount} onCartClick={() => cart.setIsOpen(true)} />
      <main>
        <Hero />
        <RestaurantGrid onAddToCart={cart.addToCart} />
      </main>
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
  );
}

export default App;
