import { useMemo, useState } from 'react';
import { analyzeTeamDefense, getDefensiveWarnings } from '@/core/defensiveAnalyzer';
import { analyzeTeamOffense } from '@/core/offensiveAnalyzer';
import type { TeamMember } from '@/types/pokemon';

/**
 * Equipo de ejemplo inicial para visualizar cómo funciona la herramienta desde el primer arranque.
 */
const INITIAL_SAMPLE_TEAM: TeamMember[] = [
  {
    slot: 1,
    speciesName: 'Garchomp',
    types: ['dragon', 'ground'],
    moves: [
      { id: 'earthquake', name: 'Terremoto', type: 'ground', category: 'physical', power: 100 },
      { id: 'dragon-claw', name: 'Garra Dragón', type: 'dragon', category: 'physical', power: 80 },
      { id: 'swords-dance', name: 'Danza Espada', type: 'normal', category: 'status', power: null },
    ],
  },
  {
    slot: 2,
    speciesName: 'Rotom-Wash',
    types: ['electric', 'water'],
    ability: 'levitate',
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
    moves: [
      { id: 'magma-storm', name: 'Lluvia Ígnea', type: 'fire', category: 'special', power: 100 },
      { id: 'flash-cannon', name: 'Foco Resplandor', type: 'steel', category: 'special', power: 80 },
      { id: 'earth-power', name: 'Tierra Viva', type: 'ground', category: 'special', power: 90 },
    ],
  },
];

export function useTeamCoverage(initialTeam: TeamMember[] = INITIAL_SAMPLE_TEAM) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);

  const defensiveSummary = useMemo(() => analyzeTeamDefense(team), [team]);
  const defensiveWarnings = useMemo(() => getDefensiveWarnings(defensiveSummary), [defensiveSummary]);
  const offensiveSummary = useMemo(() => analyzeTeamOffense(team), [team]);

  const updateMember = (updatedMember: TeamMember) => {
    setTeam((prev) =>
      prev.some((m) => m.slot === updatedMember.slot)
        ? prev.map((m) => (m.slot === updatedMember.slot ? updatedMember : m))
        : [...prev, updatedMember],
    );
  };

  const removeMember = (slot: number) => {
    setTeam((prev) => prev.filter((m) => m.slot !== slot));
  };

  return {
    team,
    setTeam,
    updateMember,
    removeMember,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
  };
}
