'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, type Property } from '@/lib/api';

interface FavoritesContextType {
  favorites: Property[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (propertyId: string) => boolean;
  addFavorite: (property: Property) => Promise<void>;
  removeFavorite: (propertyId: string) => Promise<void>;
  toggleFavorite: (property: Property) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'surf_or_sound_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);

      // Check if user is authenticated
      const token = api.getToken();
      setIsAuthenticated(!!token);

      if (token) {
        try {
          // Load from server for authenticated users
          const serverFavorites = await api.getFavorites();
          setFavorites(serverFavorites);

          // Also sync any local favorites to server
          const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localData) {
            const localFavorites: Property[] = JSON.parse(localData);
            const localIds = new Set(localFavorites.map((f) => f.id));
            const serverIds = new Set(serverFavorites.map((f) => f.id));

            // Add local favorites that aren't on server
            for (const local of localFavorites) {
              if (!serverIds.has(local.id)) {
                try {
                  await api.addFavorite(local.id);
                } catch {
                  // Ignore errors for individual items
                }
              }
            }

            // Clear local storage after sync
            localStorage.removeItem(LOCAL_STORAGE_KEY);

            // Refresh from server
            const updatedFavorites = await api.getFavorites();
            setFavorites(updatedFavorites);
          }
        } catch (error) {
          console.error('Failed to load favorites from server:', error);
          // Fall back to local storage
          loadFromLocalStorage();
        }
      } else {
        // Load from local storage for guests
        loadFromLocalStorage();
      }

      setIsLoading(false);
    };

    const loadFromLocalStorage = () => {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        try {
          setFavorites(JSON.parse(data));
        } catch {
          setFavorites([]);
        }
      }
    };

    loadFavorites();
  }, []);

  // Save to local storage when favorites change (for guests)
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated, isLoading]);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.has(propertyId),
    [favoriteIds]
  );

  const addFavorite = useCallback(
    async (property: Property) => {
      // Optimistic update
      setFavorites((prev) => {
        if (prev.some((f) => f.id === property.id)) return prev;
        return [...prev, property];
      });

      if (isAuthenticated) {
        try {
          await api.addFavorite(property.id);
        } catch (error) {
          // Revert on error
          setFavorites((prev) => prev.filter((f) => f.id !== property.id));
          throw error;
        }
      }
    },
    [isAuthenticated]
  );

  const removeFavorite = useCallback(
    async (propertyId: string) => {
      const removedProperty = favorites.find((f) => f.id === propertyId);

      // Optimistic update
      setFavorites((prev) => prev.filter((f) => f.id !== propertyId));

      if (isAuthenticated) {
        try {
          await api.removeFavorite(propertyId);
        } catch (error) {
          // Revert on error
          if (removedProperty) {
            setFavorites((prev) => [...prev, removedProperty]);
          }
          throw error;
        }
      }
    },
    [isAuthenticated, favorites]
  );

  const toggleFavorite = useCallback(
    async (property: Property) => {
      if (isFavorite(property.id)) {
        await removeFavorite(property.id);
      } else {
        await addFavorite(property);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const syncWithServer = useCallback(async () => {
    const token = api.getToken();
    if (!token) return;

    setIsAuthenticated(true);
    setIsLoading(true);

    try {
      // Upload local favorites to server
      const localFavorites = favorites;
      for (const favorite of localFavorites) {
        try {
          await api.addFavorite(favorite.id);
        } catch {
          // Ignore individual errors
        }
      }

      // Fetch merged favorites from server
      const serverFavorites = await api.getFavorites();
      setFavorites(serverFavorites);

      // Clear local storage
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to sync favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isLoading,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        syncWithServer,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
