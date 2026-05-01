import { ShoppingBag, Search, MapPin, Menu, X, Moon, Sun, Bike, UtensilsCrossed } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">Biteful</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Restaurants</Link>
            <Link to="/orders" className="text-sm font-medium text-foreground hover:text-primary transition-colors">My Orders</Link>
            <Link to="/driver" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Bike className="w-4 h-4" /> Driver
            </Link>
            <Link to="/restaurant-dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
              <UtensilsCrossed className="w-4 h-4" /> Restaurant
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Vancouver, BC</span>
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={toggleDark} className="p-2 rounded-full hover:bg-muted transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="hidden sm:block p-2 rounded-full hover:bg-muted transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={onCartClick} className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t mt-3">
            <nav className="flex flex-col p-4 gap-4">
              <Link to="/" className="text-base font-medium">Restaurants</Link>
              <Link to="/orders" className="text-base font-medium">My Orders</Link>
              <Link to="/driver" className="text-base font-medium flex items-center gap-2">
                <Bike className="w-4 h-4" /> Driver App
              </Link>
              <Link to="/restaurant-dashboard" className="text-base font-medium flex items-center gap-2 text-primary font-bold">
                <UtensilsCrossed className="w-4 h-4" /> Restaurant Dashboard
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                <MapPin className="w-4 h-4" />
                <span>Vancouver, BC</span>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
