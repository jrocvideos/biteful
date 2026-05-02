const API_URL = ( import.meta as any).env.VITE_API_URL || 'https://api.boufet.com';

export async function getRestaurants() {
  try {
    const res = await fetch(`${API_URL}/api/restaurants`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    // Normalize API response to match frontend Restaurant type
    return data.map((r: any) => ({
      ...r,
      description: r.description || 'Fresh, local cuisine delivered to your door',
      rating: r.rating || 4.5,
      reviewCount: r.review_count || 0,
      deliveryTime: r.delivery_time || '25-35 min',
      deliveryFee: r.delivery_fee || 2.99,
      minOrder: r.min_order || 15.00,
      image: r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
      featured: r.is_featured || false,
      open: r.is_open,
      menu: r.menu || [],
    }));
  } catch {
    return null;
  }
}

export async function getMenu(restaurantId: string) {
  try {
    const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      price: parseFloat(item.price),
      popular: item.is_popular,
    }));
  } catch {
    return null;
  }
}
