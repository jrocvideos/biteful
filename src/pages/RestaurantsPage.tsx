import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Clock, MapPin, Bike, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurants as mockRestaurants, categories } from '../data/restaurants';
import { getRestaurants } from '../lib/api';
import { MenuItem } from '../types';

interface RestaurantsPageProps {
  onAddToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
}

type SortOption = 'recommended' | 'rating' | 'delivery_time' | 'distance';

export const RestaurantsPage = ({ onAddToCart }: RestaurantsPageProps) => {
  const [restaurants, setRestaurants] = useState<any[]>(mockRestaurants);

  useEffect(() => {
    getRestaurants().then(data => {
      if (data && data.length > 0) {
        setRestaurants([...mockRestaurants, ...data.filter((r: any) => !mockRestaurants.find(m => m.name === r.name))]);
      }
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
 const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [deliveryFilter, setDeliveryFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = [...restaurants];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.cuisine.toLowerCase().includes(q) ||
        (r as any).tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== 'all') {
      result = result.filter(r => r.cuisine.toLowerCase() === activeCategory);
    }
    if (priceFilter.length > 0) {
      result = result.filter(r => priceFilter.includes((r as any).priceRange || '$$'));
    }
    if (ratingFilter > 0) {
      result = result.filter(r => (r.rating || 0) >= ratingFilter);
    }
    if (deliveryFilter) {
      result = result.filter(r => r.deliveryFee === 0 || r.deliveryFee === undefined);
    }
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'delivery_time':
        result.sort((a, b) => ((a as any).deliveryTime || 45) - ((b as any).deliveryTime || 45));
        break;
      case 'distance':
        result.sort((a, b) => ((a as any).distance || 5) - ((b as any).distance || 5));
        break;
      default:
        break;
    }
    return result;
  }, [searchQuery, activeCategory, sortBy, priceFilter, ratingFilter, deliveryFilter]);

  const togglePrice = (p: string) => {
    setPriceFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Search restaurants, cuisines, dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}>
              <SlidersHorizontal className="w-4 h-4" /><span className="font-medium">Filters</span>
              {(priceFilter.length > 0 || ratingFilter > 0 || deliveryFilter) && <span className="w-5 h-5 bg-primary-foreground text-primary text-xs font-bold rounded-full flex items-center justify-center">{priceFilter.length + (ratingFilter > 0 ? 1 : 0) + (deliveryFilter ? 1 : 0)}</span>}
            </button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none w-full sm:w-auto px-4 py-3 pr-10 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium cursor-pointer">
                <option value="recommended">Recommended</option><option value="rating">Top Rated</option><option value="delivery_time">Fastest Delivery</option><option value="distance">Nearest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4 hide-scrollbar">
            <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>All</button>
            {categories.map((cat) => <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? 'all' : cat.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{cat.name}</button>)}
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 pb-2 border-t border-border mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div><p className="text-sm font-semibold mb-2">Price Range</p><div className="flex gap-2">{['$', '$$', '$$$', '$$$$'].map(p => <button key={p} onClick={() => togglePrice(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${priceFilter.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}>{p}</button>)}</div></div>
                  <div><p className="text-sm font-semibold mb-2">Minimum Rating</p><div className="flex gap-2">{[4.0, 4.5].map(r => <button key={r} onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${ratingFilter === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}><Star className="w-3 h-3 fill-current" /> {r}+</button>)}</div></div>
                  <div><p className="text-sm font-semibold mb-2">Delivery</p><button onClick={() => setDeliveryFilter(!deliveryFilter)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${deliveryFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border hover:bg-muted/80'}`}><Bike className="w-3 h-3" /> Free Delivery</button></div>
                </div>
                <button onClick={() => { setPriceFilter([]); setRatingFilter(0); setDeliveryFilter(false); }} className="text-sm text-primary font-medium hover:underline mt-2">Clear all filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} {filtered.length === 1 ? 'restaurant' : 'restaurants'} found</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div><span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg mb-1">{restaurant.cuisine}</span><h3 className="text-white font-bold text-lg">{restaurant.name}</h3></div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /><span className="text-sm font-bold text-foreground">{restaurant.rating || '4.5'}</span></div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {(restaurant as any).deliveryTime || '30-45'} min</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {(restaurant as any).distance || '2.3'} km</span>
                  <span className="flex items-center gap-1"><Bike className="w-4 h-4" /> ${restaurant.deliveryFee ?? 2.99} delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  {((restaurant as any).tags as string[])?.slice(0, 3).map((tag, i) => <span key={i} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">{tag}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-20"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">No restaurants found</h3><p className="text-muted-foreground">Try adjusting your search or filters</p><button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setPriceFilter([]); setRatingFilter(0); setDeliveryFilter(false); }} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium">Clear all</button></div>}
      </div>
    </div>
  );
};
