import { Restaurant } from '../types';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Burger Vault',
    description: 'Gourmet burgers with premium ingredients',
    cuisine: 'American',
    rating: 4.8,
    reviewCount: 2341,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    featured: true,
    open: true,
    menu: [
      { id: 'b1', name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, lettuce, tomato, special sauce', price: 12.99, popular: true },
      { id: 'b2', name: 'Truffle Burger', description: 'Wagyu beef, truffle aioli, caramelized onions, gruyere', price: 18.99 },
      { id: 'b3', name: 'Spicy Chicken Sandwich', description: 'Crispy chicken, pickles, slaw, spicy mayo', price: 13.99, popular: true },
    ]
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    description: 'Authentic Japanese cuisine and fresh sashimi',
    cuisine: 'Japanese',
    rating: 4.9,
    reviewCount: 1892,
    deliveryTime: '35-45 min',
    deliveryFee: 0,
    minOrder: 25.00,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop',
    featured: true,
    open: true,
    menu: [
      { id: 's1', name: 'Dragon Roll', description: 'Eel, cucumber, avocado, topped with tobiko', price: 16.99, popular: true },
      { id: 's2', name: 'Salmon Sashimi (5pc)', description: 'Fresh Atlantic salmon', price: 14.99 },
      { id: 's3', name: 'Spicy Tuna Roll', description: 'Spicy tuna, cucumber, sesame seeds', price: 8.99 },
    ]
  },
  {
    id: '3',
    name: 'Mama\'s Pizza',
    description: 'Wood-fired Neapolitan pizza',
    cuisine: 'Italian',
    rating: 4.6,
    reviewCount: 3421,
    deliveryTime: '30-40 min',
    deliveryFee: 1.99,
    minOrder: 12.00,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
    open: true,
    menu: [
      { id: 'p1', name: 'Margherita', description: 'San Marzano tomato, mozzarella, basil', price: 14.99, popular: true },
      { id: 'p2', name: 'Pepperoni Supreme', description: 'Double pepperoni, mozzarella, oregano', price: 16.99 },
      { id: 'p3', name: 'Truffle Mushroom', description: 'Wild mushrooms, truffle oil, ricotta, arugula', price: 18.99 },
    ]
  },
  {
    id: '4',
    name: 'Green Bowl',
    description: 'Healthy bowls and salads',
    cuisine: 'Healthy',
    rating: 4.7,
    reviewCount: 1234,
    deliveryTime: '20-30 min',
    deliveryFee: 1.49,
    minOrder: 10.00,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    featured: true,
    open: true,
    menu: [
      { id: 'g1', name: 'Buddha Bowl', description: 'Quinoa, chickpeas, avocado, tahini dressing', price: 13.99, popular: true },
      { id: 'g2', name: 'Kale Caesar', description: 'Kale, parmesan, croutons, lemon caesar dressing', price: 11.99 },
    ]
  },
  {
    id: '5',
    name: 'Taco Loco',
    description: 'Street-style Mexican tacos',
    cuisine: 'Mexican',
    rating: 4.5,
    reviewCount: 876,
    deliveryTime: '25-35 min',
    deliveryFee: 2.49,
    minOrder: 12.00,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop',
    open: true,
    menu: [
      { id: 't1', name: 'Carne Asada Tacos (3)', description: 'Grilled steak, onions, cilantro, salsa verde', price: 10.99, popular: true },
      { id: 't2', name: 'Fish Tacos (2)', description: 'Baja-style fish, cabbage slaw, chipotle crema', price: 11.99 },
    ]
  },
  {
    id: '6',
    name: 'Curry House',
    description: 'Authentic Indian curries and biryanis',
    cuisine: 'Indian',
    rating: 4.7,
    reviewCount: 1567,
    deliveryTime: '40-50 min',
    deliveryFee: 0,
    minOrder: 20.00,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
    open: true,
    menu: [
      { id: 'c1', name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 16.99, popular: true },
      { id: 'c2', name: 'Vegetable Biryani', description: 'Fragrant rice with mixed vegetables, raita', price: 14.99 },
    ]
  },{
    id: '7',
    name: 'Papa Johns',
    description: 'Fresh ingredients, better pizza',
    cuisine: 'Italian',
    rating: 4.5,
    reviewCount: 0,
    deliveryTime: '30-40 min',
    deliveryFee: 2.99,
    minOrder: 15.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop',
    featured: true,
    open: true,
    menu: [
      { id: 'pj1', name: 'Pepperoni Pizza', description: 'Classic pepperoni with Papa Johns signature sauce', price: 16.99, popular: true },
      { id: 'pj2', name: 'Cheese Pizza', description: 'Fresh mozzarella, signature tomato sauce', price: 13.99 },
      { id: 'pj3', name: 'BBQ Chicken Pizza', description: 'Grilled chicken, BBQ sauce, red onions, cilantro', price: 17.99 },
    ]
  },

];

  {
    id: '8',
    name: 'Smoke2Snack',
    description: 'Premium vapes, e-liquids, accessories and snacks delivered fast',
    cuisine: 'Vape & Convenience',
    rating: 4.7,
    reviewCount: 412,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    minOrder: 10.00,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop',
    featured: true,
    open: true,
    menu: [
      { id: 'v1', name: 'Disposable Vape', description: 'Assorted flavours — ask driver for options', price: 19.99, popular: true },
      { id: 'v2', name: 'E-Liquid 30ml', description: 'Premium e-juice, various nicotine levels', price: 14.99, popular: true },
      { id: 'v3', name: 'Vape Pod Pack', description: 'Compatible pods, assorted flavours', price: 24.99 },
      { id: 'v4', name: 'Snack Bundle', description: 'Chips, candy, energy drink — the essentials', price: 12.99 },
      { id: 'v5', name: 'Rolling Papers + Tips', description: 'King size papers with filter tips', price: 4.99 },
    ]
  },
export const categories: { id: string; name: string; icon: string }[] = [
  { id: 'all', name: 'All', icon: 'UtensilsCrossed' },
  { id: 'american', name: 'American', icon: 'Beef' },
  { id: 'japanese', name: 'Japanese', icon: 'Fish' },
  { id: 'italian', name: 'Italian', icon: 'Pizza' },
  { id: 'healthy', name: 'Healthy', icon: 'Salad' },
  { id: 'mexican', name: 'Mexican', icon: 'Flame' },
  { id: 'indian', name: 'Indian', icon: 'Soup' },
  { id: 'korean', name: 'Korean', icon: 'Flame' },
  { id: 'vietnamese', name: 'Vietnamese', icon: 'Soup' },
  { id: 'chinese', name: 'Chinese', icon: 'UtensilsCrossed' },
  { id: 'bakery', name: 'Bakery', icon: 'Croissant' },

];
