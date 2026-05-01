import { motion } from 'framer-motion';
import { ArrowRight, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

type City = {
  id: string;
  name: string;
  neighborhoods: string;
};

const cities: City[] = [
  { id: 'van', name: 'Vancouver', neighborhoods: 'Olympic Village & Yaletown' },
  { id: 'sea', name: 'Seattle', neighborhoods: 'Capitol Hill & Ballard' },
];

export const Hero = () => {
  const [activeCity, setActiveCity] = useState<City>(cities[0]);
  const [showCityMenu, setShowCityMenu] = useState(false);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mb-6">
              <button
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {activeCity.name} — {activeCity.neighborhoods}
                <ChevronDown className={`w-3 h-3 transition-transform ${showCityMenu ? 'rotate-180' : ''}`} />
n              </button>
n              
              {showCityMenu && (
n                <div className="absolute top-full left-0 mt-2 bg-card rounded-xl border border-border shadow-xl p-2 z-50 min-w-[220px]">
n                  {cities.map((city) => (
n                    <button
n                      key={city.id}
n                      onClick={() => { setActiveCity(city); setShowCityMenu(false); }}
n                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${activeCity.id === city.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
n                    >
n                      <p className="font-medium">{city.name}</p>
n                      <p className="text-xs opacity-70">{city.neighborhoods}</p>
n                    </button>
n                  ))}
n                </div>
              )}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your favorite{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                food.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Order from the best local restaurants in your neighborhood. Fresh, fast, and fair — we take less so they keep more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Order Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 px-8 py-4 bg-muted text-foreground rounded-2xl font-bold text-lg hover:bg-muted/80 transition-colors"
              >
                View Restaurants
              </Link>
            </div>
            <div className="flex gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Founding Partners</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-bold">20%</p>
                <p className="text-sm text-muted-foreground">Fair Commission</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Cities</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                alt="Delicious food"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">NEW</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Now Delivering</p>
                    <p className="text-xs text-muted-foreground">{activeCity.name} — {activeCity.neighborhoods}</p>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-600 text-lg">🚀</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">25–35 min</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};