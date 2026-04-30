import { useState } from 'react';
import { RestaurantCard } from './RestaurantCard';
import { CategoryPill } from './CategoryPill';
import { restaurants, categories } from '../data/restaurants';
import { MenuItem } from '../types';

interface RestaurantGridProps {
  onAddToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
}

export const RestaurantGrid = ({ onAddToCart }: RestaurantGridProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const filteredRestaurants = activeCategory === 'all' 
    ? restaurants 
    : restaurants.filter(r => r.cuisine.toLowerCase() === activeCategory);

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Near You</h2>
          <p className="text-muted-foreground">Discover top-rated restaurants in your area</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
          {categories.map((cat) => (
            <CategoryPill key={cat.id} category={cat} isActive={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant}
              onAddToCart={(item) => onAddToCart(item, restaurant.id, restaurant.name)} />
          ))}
        </div>
      </div>
    </section>
  );
};
