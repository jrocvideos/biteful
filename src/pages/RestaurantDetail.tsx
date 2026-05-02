import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Bike, ArrowLeft, Plus, Heart, Share2, MapPin } from 'lucide-react';
import { restaurants } from '../data/restaurants';
import { getRestaurants } from '../lib/api';
import { MenuItem } from '../types';

interface RestaurantDetailProps {
  onAddToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
}

export const RestaurantDetail = ({ onAddToCart }: RestaurantDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(
    restaurants.find(r => r.id === id) || null
  );

  useEffect(() => {
    getRestaurants().then(data => {
      if (data) {
        const found = data.find((r: any) => r.id === id);
        if (found) setRestaurant(found);
      }
    });
  }, [id]);

  const [activeCategory, setActiveCategory] = useState('all');

  if (!restaurant) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const popularItems = restaurant.menu.filter(m => m.popular);
  const regularItems = restaurant.menu.filter(m => !m.popular);

  return (
    <main className="pt-24 pb-20">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate('/')} className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-4 right-4 md:left-8 md:right-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium mb-3 inline-block">
              {restaurant.cuisine}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
            <p className="text-white/80 mb-4 max-w-xl">{restaurant.description}</p>
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="font-bold">{restaurant.rating}</span><span>({restaurant.reviewCount})</span></div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{restaurant.deliveryTime}</span></div>
              <div className="flex items-center gap-1"><Bike className="w-4 h-4" /><span>{restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee} delivery`}</span></div>
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>0.8 mi away</span></div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Menu Categories */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
          {['all', 'popular', 'mains', 'sides'].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeCategory === cat ? 'gradient-hero text-white shadow-glow' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Popular Section */}
        {popularItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Items</h2>
            <div className="space-y-4">
              {popularItems.map((item) => (
                <MenuItemCard key={item.id} item={item} restaurant={restaurant} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        )}

        {/* Full Menu */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Full Menu</h2>
          <div className="space-y-4">
            {regularItems.map((item) => (
              <MenuItemCard key={item.id} item={item} restaurant={restaurant} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

const MenuItemCard = ({ item, restaurant, onAddToCart }: { item: MenuItem; restaurant: any; onAddToCart: any }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border hover:shadow-soft transition-all group">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-foreground">{item.name}</h3>
        {item.popular && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Popular</span>}
      </div>
      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
      <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
    </div>
    <button onClick={() => onAddToCart(item, restaurant.id, restaurant.name)}
      className="ml-4 p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-glow">
      <Plus className="w-5 h-5" />
    </button>
  </motion.div>
);
