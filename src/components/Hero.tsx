import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Free delivery on first order</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
              Your favorite food, <span className="text-transparent bg-clip-text gradient-hero">delivered fast</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Discover the best restaurants near you and order with ease. From local favorites to national chains, we bring the food you love to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/" className="inline-flex items-center justify-center px-8 py-4 rounded-full gradient-hero text-white font-semibold text-lg shadow-glow hover:shadow-lg hover:scale-105 transition-all">
                Order Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all">
                View Restaurants
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
              <div><span className="block text-2xl font-bold text-foreground">500+</span>Restaurants</div>
              <div className="w-px h-10 bg-border" />
              <div><span className="block text-2xl font-bold text-foreground">30min</span>Avg Delivery</div>
              <div className="w-px h-10 bg-border" />
              <div><span className="block text-2xl font-bold text-foreground">4.9</span>App Rating</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop" alt="Delicious food spread" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-8 left-8 bg-white dark:bg-card p-4 rounded-2xl shadow-elevated">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><span className="text-2xl">🚀</span></div>
                  <div><p className="font-semibold text-foreground">Fast Delivery</p><p className="text-sm text-muted-foreground">25-35 min</p></div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute top-8 right-8 bg-white dark:bg-card p-4 rounded-2xl shadow-elevated">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span><span className="font-bold text-foreground">4.9</span><span className="text-muted-foreground">(2.4k reviews)</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
