import { cn } from '../lib/utils';
import { UtensilsCrossed, Beef, Fish, Pizza, Salad, Flame, Soup } from 'lucide-react';

interface CategoryPillProps {
  category: { id: string; name: string; icon: string };
  isActive: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Beef, Fish, Pizza, Salad, Flame, Soup,
};

export const CategoryPill = ({ category, isActive, onClick }: CategoryPillProps) => {
  const Icon = iconMap[category.icon] || UtensilsCrossed;
  return (
    <button onClick={onClick}
      className={cn("flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap",
        isActive ? "gradient-hero text-white shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
      <Icon className="w-4 h-4" />
      <span className="font-medium">{category.name}</span>
    </button>
  );
};
