const API_URL = import.meta.env.VITE_API_URL || 'https://api.boufet.com';

export async function getRestaurants() {
  try {
    const res = await fetch(`${API_URL}/api/restaurants`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return null;
  }
}
