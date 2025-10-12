import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dog } from '../services/apiService';

const FAVORITES_STORAGE_KEY = '@homeforpup_favorites';

interface FavoriteDog extends Dog {
  savedDate: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favs: FavoriteDog[] = JSON.parse(stored);
        setFavorites(favs);
        setFavoriteIds(new Set(favs.map(f => f.id)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(async (dog: Dog) => {
    try {
      const favoriteDog: FavoriteDog = {
        ...dog,
        savedDate: new Date().toISOString(),
      };

      const updatedFavorites = [favoriteDog, ...favorites];
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      setFavoriteIds(new Set(updatedFavorites.map(f => f.id)));
      
      console.log('✅ Added to favorites:', dog.id);
      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (dogId: string) => {
    try {
      const updatedFavorites = favorites.filter(f => f.id !== dogId);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      setFavoriteIds(new Set(updatedFavorites.map(f => f.id)));
      
      console.log('✅ Removed from favorites:', dogId);
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }, [favorites]);

  const toggleFavorite = useCallback(async (dog: Dog) => {
    if (favoriteIds.has(dog.id)) {
      return await removeFavorite(dog.id);
    } else {
      return await addFavorite(dog);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((dogId: string) => {
    return favoriteIds.has(dogId);
  }, [favoriteIds]);

  const clearFavorites = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      setFavorites([]);
      setFavoriteIds(new Set());
      return true;
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      return false;
    }
  }, []);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refresh: loadFavorites,
  };
};

