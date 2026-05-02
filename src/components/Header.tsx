import { Link, useLocation } from 'react-router-dom';
import { MapPin, ShoppingCart, Search, Bike, Store } from 'lucide-react';
import { useCity } from '../hooks/useCity';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const { city } = useCity();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Boufet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/restaurants" className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors ${location.pathname === '/restaurants' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
              Restaurants
            </Link>
            <Link to="/orders" className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 ${location.pathname === '/orders' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
              <Store className="w-4 h-4" /> My Restaurant
            </Link>
            <Link to="/driver" className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 ${location.pathname === '/driver' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
              <Bike className="w-4 h-4" /> Driver
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">{city.shortName}</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative" onClick={onCartClick}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
