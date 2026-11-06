import type { TeamMember } from '@/types/pokemon';

const STORAGE_KEY = 'metadraft_saved_team_v1';

export function saveTeamToStorage(team: readonly TeamMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  } catch (error) {
    console.error('Error al guardar el equipo en localStorage:', error);
  }
}

export function loadTeamFromStorage(): TeamMember[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeamMember[];
  } catch (error) {
    console.error('Error al leer el equipo desde localStorage:', error);
    return null;
  }
}
