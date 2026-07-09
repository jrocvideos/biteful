import { useCart } from '../hooks/useCart';
import { Hero } from '../components/Hero';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { RecommendationsSection } from '../components/RecommendationsSection';

export const HomePage = () => {
  const cart = useCart();

  return (
    <main>
      <Hero />
      <RecommendationsSection onAddToCart={cart.addToCart} />
      <RestaurantGrid onAddToCart={cart.addToCart} />
    </main>
  );
};
