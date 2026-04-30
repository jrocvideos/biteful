import { Hero } from '../components/Hero';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { MenuItem } from '../types';

interface HomePageProps {
  onAddToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
}

export const HomePage = ({ onAddToCart }: HomePageProps) => {
  return (
    <main>
      <Hero />
      <RestaurantGrid onAddToCart={onAddToCart} />
    </main>
  );
};
