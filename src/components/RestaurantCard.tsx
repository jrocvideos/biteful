import { Star, Clock, Bike, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToCart: (item: any) => void;
}

export const RestaurantCard = ({ restaurant, onAddToCart }: RestaurantCardProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 border border-border">
      <Link to={`/restaurant/${restaurant.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {restaurant.featured && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">Featured</span>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white">
              <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md text-sm font-medium">{restaurant.cuisine}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{restaurant.rating}</span>
                <span className="text-white/70">({restaurant.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/restaurant/${restaurant.id}`} className="block">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-foreground">{restaurant.name}</h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{restaurant.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{restaurant.deliveryTime}</span></div>
            <div className="flex items-center gap-1"><Bike className="w-4 h-4" /><span>{restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee}`}</span></div>
          </div>
        </Link>

        <div className="space-y-2">
          {restaurant.menu.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted group/item hover:bg-muted/80 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">${item.price}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddToCart(item); }}
                className="ml-2 p-2 rounded-full bg-primary text-primary-foreground opacity-0 group-hover/item:opacity-100 transition-opacity hover:scale-110">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
