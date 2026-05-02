import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, TrendingUp, Sun, Zap, Star } from 'lucide-react';
import { CartItem } from '../types';

interface OrderRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'delivered' | 'cancelled';
}

function inferCuisine(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('sushi') || n.includes('ramen') || n.includes('japan') || n.includes('tokyo')) return 'japanese';
  if (n.includes('burger') || n.includes('bbq') || n.includes('american') || n.includes('diner')) return 'american';
  if (n.includes('taco') || n.includes('burrito') || n.includes('mexican') || n.includes('cantina')) return 'mexican';
  if (n.includes('pizza') || n.includes('pasta') || n.includes('italian') || n.includes('trattoria')) return 'italian';
  if (n.includes('thai') || n.includes('pad') || n.includes('bangkok')) return 'thai';
  if (n.includes('indian') || n.includes('curry') || n.includes('tandoori') || n.includes('spice')) return 'indian';
  if (n.includes('chinese') || n.includes('dim') || n.includes('wok') || n.includes('szechuan')) return 'chinese';
  if (n.includes('korean') || n.includes('bbq') || n.includes('seoul')) return 'korean';
  if (n.includes('vietnamese') || n.includes('pho') || n.includes('banh')) return 'vietnamese';
  if (n.includes('mediterranean') || n.includes('greek') || n.includes('falafel')) return 'mediterranean';
  if (n.includes('french') || n.includes('bistro') || n.includes('cafe')) return 'french';
  return 'mixed';
}

function detectDietarySignals(items: CartItem[]): string[] {
  const allNames = items.map(i => i.name.toLowerCase()).join(' ');
  const signals: string[] = [];
  if (allNames.match(/vegan|plant|tofu|beyond/)) signals.push('Plant-Forward');
  if (allNames.match(/gluten-free|gf\b|celiac/)) signals.push('Gluten-Conscious');
  if (allNames.match(/halal|kosher/)) signals.push('Religious-Dietary');
  if (allNames.match(/keto|low-carb|salad|bowl|healthy/)) signals.push('Health-Conscious');
  if (allNames.match(/spicy|hot|chili|sriracha|jalapeño/)) signals.push('Spice-Lover');
  if (allNames.match(/wings|burger|fries|poutine|loaded/)) signals.push('Comfort-Food');
  return signals;
}

function buildProfile(orders: OrderRecord[]) {
  if (!orders || orders.length === 0) return null;

  const cuisineCounts: Record<string, number> = {};
  orders.forEach(o => {
    const c = inferCuisine(o.restaurantName);
    const count = o.items.reduce((s, i) => s + i.quantity, 0);
    cuisineCounts[c] = (cuisineCounts[c] || 0) + count;
  });
  const totalC = Object.values(cuisineCounts).reduce((a, b) => a + b, 0);
  const favoriteCuisines = Object.entries(cuisineCounts).map(([c, count]) => [c, count / totalC] as [string, number]).sort((a, b) => b[1] - a[1]);

  const itemCounts: Record<string, { count: number; price: number; restaurant: string; restaurantId: string; lastDate: Date }> = {};
  orders.forEach(o => {
    const date = new Date(o.date);
    o.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, price: item.price, restaurant: o.restaurantName, restaurantId: o.restaurantId, lastDate: date };
      itemCounts[item.name].count += item.quantity;
      if (date > itemCounts[item.name].lastDate) itemCounts[item.name].lastDate = date;
    });
  });

  const totals = orders.map(o => o.total);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;

  const hourCounts: Record<number, number> = {};
  orders.forEach(o => { hourCounts[new Date(o.date).getHours()] = (hourCounts[new Date(o.date).getHours()] || 0) + 1; });
  const peakHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => parseInt(h));

  const allItems = orders.flatMap(o => o.items);
  const uniqueNames = new Set(allItems.map(i => i.name));
  const explorationScore = allItems.length > 0 ? uniqueNames.size / allItems.length : 0.5;

  return {
    favoriteCuisines,
    itemCounts,
    priceComfortZone: { low: avg * 0.6, mid: avg, high: avg * 1.4 },
    peakHours,
    explorationScore: Math.min(explorationScore, 1),
    dietarySignals: detectDietarySignals(allItems),
    totalOrders: orders.length,
    totalSpent: totals.reduce((a, b) => a + b, 0),
  };
}

interface Recommendation {
  type: 'reorder' | 'exploration' | 'temporal' | 'upsell';
  itemName: string;
  restaurant: string;
  restaurantId: string;
  price: number;
  confidence: number;
  reason: string;
  badge: string;
}

function generateRecs(orders: OrderRecord[], profile: any): Recommendation[] {
  const recs: Recommendation[] = [];
  const now = new Date();
  const hour = now.getHours();

  const candidates = Object.entries(profile.itemCounts)
    .filter(([_, data]: [string, any]) => data.count >= 2)
    .map(([name, data]: [string, any]) => {
      const daysSince = Math.floor((now.getTime() - data.lastDate.getTime()) / (24 * 60 * 60 * 1000));
      const freqScore = Math.min(data.count / 5, 1.0);
      const recencyScore = Math.max(0, 1 - (daysSince / 30));
      return { name, score: (freqScore * 0.6) + (recencyScore * 0.4), data, daysSince };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  candidates.forEach(c => {
    recs.push({
      type: 'reorder',
      itemName: c.name,
      restaurant: c.data.restaurant,
      restaurantId: c.data.restaurantId,
      price: c.data.price,
      confidence: c.score,
      reason: `Ordered ${c.data.count} times${c.daysSince > 0 ? ` — last time ${c.daysSince} days ago` : ''}`,
      badge: 'Order Again',
    });
  });

  let timeBadge = 'Perfect Now';
  let timeContext = 'Perfect for this time of day';
  if (hour >= 6 && hour <= 10) { timeBadge = 'Breakfast'; timeContext = 'Breakfast time — start your day right'; }
  else if (hour >= 11 && hour <= 14) { timeBadge = 'Lunch'; timeContext = 'Lunch rush — quick and satisfying'; }
  else if (hour >= 15 && hour <= 16) { timeBadge = 'Snack'; timeContext = 'Afternoon pick-me-up'; }
  else if (hour >= 17 && hour <= 21) { timeBadge = 'Dinner'; timeContext = 'Dinner time — treat yourself'; }
  else { timeBadge = 'Late Night'; timeContext = 'Late night — comfort food hits different'; }

  if (profile.favoriteCuisines.length > 0) {
    const topCuisine = profile.favoriteCuisines[0][0];
    recs.push({
      type: 'temporal',
      itemName: `${topCuisine.charAt(0).toUpperCase() + topCuisine.slice(1)} Special`,
      restaurant: 'Local Favorite',
      restaurantId: '1',
      price: profile.priceComfortZone.mid,
      confidence: 0.7,
      reason: timeContext,
      badge: timeBadge,
    });
  }

  if (profile.explorationScore > 0.3 && profile.favoriteCuisines.length > 1) {
    const secondCuisine = profile.favoriteCuisines[1][0];
    recs.push({
      type: 'exploration',
      itemName: `Try ${secondCuisine.charAt(0).toUpperCase() + secondCuisine.slice(1)}`,
      restaurant: 'New Discovery',
      restaurantId: '2',
      price: profile.priceComfortZone.mid * 0.9,
      confidence: 0.6,
      reason: `You love ${profile.favoriteCuisines[0][0]} — expand your palate`,
      badge: 'New For You',
    });
  }

  if (profile.dietarySignals.includes('Spice-Lover')) {
    recs.push({
      type: 'upsell',
      itemName: 'Extra Hot Sauce',
      restaurant: 'Add-On',
      restaurantId: 'addon',
      price: 1.99,
      confidence: 0.8,
      reason: 'You always order spicy — level up',
      badge: 'For You',
    });
  }

  return recs;
}

interface Props {
  onAddToCart: (item: any, restaurantId: string, restaurantName: string) => void;
}

export const RecommendationsSection = ({ onAddToCart }: Props) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('biteful-order-history');
    if (saved) {
      try { setOrders(JSON.parse(saved)); } catch { setOrders([]); }
    }
  }, []);

  const { profile, recommendations } = useMemo(() => {
    const profile = buildProfile(orders);
    const recommendations = profile ? generateRecs(orders, profile) : [];
    return { profile, recommendations };
  }, [orders]);

  if (!profile) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Made For You</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Place your first order</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              We'll learn your taste and recommend dishes you'll love. The more you order, the smarter we get.
            </p>
            <Link to="/restaurants" className="inline-block mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Order Again': return 'bg-green-500/10 text-green-600';
      case 'New For You': return 'bg-blue-500/10 text-blue-600';
      case 'Lunch': return 'bg-yellow-500/10 text-yellow-600';
      case 'Dinner': return 'bg-teal-600/10 text-teal-700';
      case 'Breakfast': return 'bg-pink-500/10 text-pink-600';
      case 'Late Night': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reorder': return <RotateCcw className="w-4 h-4" />;
      case 'exploration': return <Sparkles className="w-4 h-4" />;
      case 'temporal': return <Sun className="w-4 h-4" />;
      case 'upsell': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Made For You</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Based on {profile.totalOrders} orders</span>
          </div>
        </div>

        {profile.dietarySignals.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.dietarySignals.map((signal, i) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{signal}</span>
            ))}
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">Avg ${profile.priceComfortZone.mid.toFixed(0)}/order</span>
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">{profile.explorationScore > 0.5 ? 'Adventurous Eater' : 'Creature of Habit'}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={`${rec.type}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onAddToCart(
                { id: `rec-${index}`, name: rec.itemName, price: rec.price, image: '', description: rec.reason },
                rec.restaurantId,
                rec.restaurant
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${getBadgeColor(rec.badge)}`}>
                  {getIcon(rec.type)}
                  {rec.badge}
                </div>
                <span className="text-lg font-bold">${rec.price.toFixed(2)}</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{rec.itemName}</h3>
              <p className="text-sm text-muted-foreground mb-3">{rec.restaurant}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${rec.confidence * 100}%` }} />
                </div>
                <span>{Math.round(rec.confidence * 100)}% match</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">"{rec.reason}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
