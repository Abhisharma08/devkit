import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { tools } from './registry';
const knownToolIds = new Set(tools.map(tool => tool.id));
interface Preferences { theme: 'light' | 'dark'; favorites: string[]; toggleTheme: () => void; toggleFavorite: (id: string) => void }
export function mergePreferences(persisted: unknown, current: Preferences): Preferences {
  const value = persisted as Partial<Preferences> | null;
  return { ...current, theme: value?.theme === 'light' ? 'light' : 'dark', favorites: Array.isArray(value?.favorites) ? [...new Set(value.favorites.filter((id): id is string => typeof id === 'string' && knownToolIds.has(id)))] : [] };
}
// Explicit allowlist: no inputs, outputs, tokens, passwords, or history enter storage.
export const usePreferences = create<Preferences>()(persist((set) => ({
  theme: 'dark', favorites: [],
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleFavorite: id => set(state => ({ favorites: state.favorites.includes(id) ? state.favorites.filter(item => item !== id) : [...state.favorites, id] }))
}), { name: 'devkit-preferences', storage: createJSONStorage(() => localStorage), skipHydration: true,
  partialize: state => ({ theme: state.theme, favorites: state.favorites }),
  merge: mergePreferences
}));
