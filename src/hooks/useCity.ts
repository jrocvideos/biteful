import { useState, useEffect } from 'react';

export interface City {
  id: string;
  name: string;
  neighborhoods: string;
  shortName: string;
}

const cities: City[] = [
  { id: 'van', name: 'Vancouver', neighborhoods: 'Olympic Village & Yaletown', shortName: 'Vancouver, BC' },
  { id: 'sea', name: 'Seattle', neighborhoods: 'Capitol Hill & Ballard', shortName: 'Seattle, WA' },
];

const STORAGE_KEY = 'biteful-city';

export const useCity = () => {
  const [city, setCityState] = useState<City>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = cities.find(c => c.id === saved);
      if (found) return found;
    }
    return cities[0];
  });

  const setCity = (newCity: City) => {
    localStorage.setItem(STORAGE_KEY, newCity.id);
    setCityState(newCity);
    window.dispatchEvent(new Event('biteful-city-change'));
  };

  useEffect(() => {
    const handleChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = cities.find(c => c.id === saved);
        if (found && found.id !== city.id) setCityState(found);
      }
    };
    window.addEventListener('biteful-city-change', handleChange);
    return () => window.removeEventListener('biteful-city-change', handleChange);
  }, [city.id]);

  return { city, setCity, cities };
};
