import type { TeamMember } from '@/types/pokemon';

const TEAM_STORAGE_KEY = 'metadraft_saved_team_v1';
const CACHE_PREFIX = 'metadraft_cache_v1_';

export function saveTeamToStorage(team: readonly TeamMember[]): void {
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  } catch (error) {
    console.error('Error al guardar el equipo en localStorage:', error);
  }
}

export function loadTeamFromStorage(): TeamMember[] | null {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeamMember[];
  } catch (error) {
    console.error('Error al leer el equipo desde localStorage:', error);
    return null;
  }
}

/**
 * Lee un elemento de la caché persistente en localStorage.
 */
export function getCachedItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Guarda un elemento en la caché persistente en localStorage.
 */
export function setCachedItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn('No se pudo guardar en caché de localStorage:', error);
  }
}
