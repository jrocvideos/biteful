import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { MapPin, ShoppingCart, Search, Bike, Store, User, LogOut, Menu, X } from 'lucide-react';
import { useCity } from '../hooks/useCity';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

            <Link to="/driver/signup" className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-bold hover:bg-teal-50 transition-colors">Drive with Boufet
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">{city.shortName}</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="w-5 h-5" />
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground hidden md:block">Hi, {user.first_name || user.email.split('@')[0]}</span>
                <button onClick={logout} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Sign out">
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">Sign In</Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Sign Up</Link>
              </div>
            )}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border bg-background px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); } }}>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, dishes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium">Search</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          <Link to="/restaurants" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Restaurants</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"><Store className="w-4 h-4" /> My Restaurant</Link>

          <Link to="/driver/signup" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium border border-teal-600 text-teal-600 hover:bg-teal-50 transition-colors">Drive with Boufet</Link>
          <Link to="/driver-download" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Download Driver App</Link>
          {user ? (
            <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-left"><LogOut className="w-4 h-4" /> Sign Out</button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">Sign In</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
