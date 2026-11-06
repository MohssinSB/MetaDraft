import { useEffect, useMemo, useState } from 'react';
import { analyzeTeamDefense, getDefensiveWarnings } from '@/core/defensiveAnalyzer';
import { analyzeTeamOffense } from '@/core/offensiveAnalyzer';
import { loadTeamFromStorage, saveTeamToStorage } from '@/services/storage';
import type { TeamMember } from '@/types/pokemon';

/**
 * Equipo de ejemplo inicial para visualizar cómo funciona la herramienta desde el primer arranque.
 */
export const INITIAL_SAMPLE_TEAM: TeamMember[] = [
  {
    slot: 1,
    speciesName: 'Garchomp',
    types: ['dragon', 'ground'],
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png',
    moves: [
      { id: 'earthquake', name: 'Terremoto', type: 'ground', category: 'physical', power: 100 },
      { id: 'dragon-claw', name: 'Garra Dragón', type: 'dragon', category: 'physical', power: 80 },
      { id: 'swords-dance', name: 'Danza Espada', type: 'normal', category: 'status', power: null },
    ],
  },
  {
    slot: 2,
    speciesName: 'Rotom Wash',
    types: ['electric', 'water'],
    ability: 'levitate',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10008.png',
    moves: [
      { id: 'hydro-pump', name: 'Hidrobomba', type: 'water', category: 'special', power: 110 },
      { id: 'volt-switch', name: 'Voltiocambio', type: 'electric', category: 'special', power: 70 },
    ],
  },
  {
    slot: 3,
    speciesName: 'Heatran',
    types: ['fire', 'steel'],
    ability: 'flash-fire',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/485.png',
    moves: [
      { id: 'magma-storm', name: 'Lluvia Ígnea', type: 'fire', category: 'special', power: 100 },
      { id: 'flash-cannon', name: 'Foco Resplandor', type: 'steel', category: 'special', power: 80 },
      { id: 'earth-power', name: 'Tierra Viva', type: 'ground', category: 'special', power: 90 },
    ],
  },
];

export function useTeamCoverage(initialTeam?: TeamMember[]) {
  const [team, setTeam] = useState<TeamMember[]>(() => {
    if (initialTeam) return initialTeam;
    const saved = loadTeamFromStorage();
    return saved ?? INITIAL_SAMPLE_TEAM;
  });

  useEffect(() => {
    saveTeamToStorage(team);
  }, [team]);

  const defensiveSummary = useMemo(() => analyzeTeamDefense(team), [team]);
  const defensiveWarnings = useMemo(() => getDefensiveWarnings(defensiveSummary), [defensiveSummary]);
  const offensiveSummary = useMemo(() => analyzeTeamOffense(team), [team]);

  const updateMember = (updatedMember: TeamMember) => {
    setTeam((prev) => {
      const next = prev.some((m) => m.slot === updatedMember.slot)
        ? prev.map((m) => (m.slot === updatedMember.slot ? updatedMember : m))
        : [...prev, updatedMember];
      return [...next].sort((a, b) => a.slot - b.slot);
    });
  };

  const removeMember = (slot: number) => {
    setTeam((prev) => prev.filter((m) => m.slot !== slot));
  };

  const clearTeam = () => {
    setTeam([]);
  };

  const resetSampleTeam = () => {
    setTeam(INITIAL_SAMPLE_TEAM);
  };

  return {
    team,
    setTeam,
    updateMember,
    removeMember,
    clearTeam,
    resetSampleTeam,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
  };
}
