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
    teraType: 'steel',
    isTeraActive: false,
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
    teraType: 'fairy',
    isTeraActive: false,
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
    teraType: 'grass',
    isTeraActive: false,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/485.png',
    moves: [
      { id: 'magma-storm', name: 'Lluvia Ígnea', type: 'fire', category: 'special', power: 100 },
      { id: 'flash-cannon', name: 'Foco Resplandor', type: 'steel', category: 'special', power: 80 },
      { id: 'earth-power', name: 'Tierra Viva', type: 'ground', category: 'special', power: 90 },
    ],
  },
];

export const INITIAL_SAMPLE_RIVAL_TEAM: TeamMember[] = [
  {
    slot: 1,
    speciesName: 'gyarados',
    types: ['water', 'flying'],
    teraType: 'ground',
    isTeraActive: false,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    moves: [
      { id: 'waterfall', name: 'Cascada', type: 'water', category: 'physical', power: 80 },
      { id: 'earthquake', name: 'Terremoto', type: 'ground', category: 'physical', power: 100 },
    ],
  },
  {
    slot: 2,
    speciesName: 'Ferrothorn',
    types: ['grass', 'steel'],
    teraType: 'water',
    isTeraActive: false,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/598.png',
    moves: [
      { id: 'power-whip', name: 'Latigazo', type: 'grass', category: 'physical', power: 120 },
      { id: 'gyro-ball', name: 'Giro Bola', type: 'steel', category: 'physical', power: null },
    ],
  },
];

export function useTeamCoverage(initialTeam?: TeamMember[]) {
  const [team, setTeam] = useState<TeamMember[]>(() => {
    if (initialTeam) return initialTeam;
    const saved = loadTeamFromStorage(false);
    return saved ?? INITIAL_SAMPLE_TEAM;
  });

  const [rivalTeam, setRivalTeam] = useState<TeamMember[]>(() => {
    const saved = loadTeamFromStorage(true);
    return saved ?? INITIAL_SAMPLE_RIVAL_TEAM;
  });

  useEffect(() => {
    saveTeamToStorage(team, false);
  }, [team]);

  useEffect(() => {
    saveTeamToStorage(rivalTeam, true);
  }, [rivalTeam]);

  const defensiveSummary = useMemo(() => analyzeTeamDefense(team), [team]);
  const defensiveWarnings = useMemo(() => getDefensiveWarnings(defensiveSummary), [defensiveSummary]);
  const offensiveSummary = useMemo(() => analyzeTeamOffense(team), [team]);

  const rivalDefensiveSummary = useMemo(() => analyzeTeamDefense(rivalTeam), [rivalTeam]);
  const rivalDefensiveWarnings = useMemo(
    () => getDefensiveWarnings(rivalDefensiveSummary),
    [rivalDefensiveSummary],
  );
  const rivalOffensiveSummary = useMemo(() => analyzeTeamOffense(rivalTeam), [rivalTeam]);

  const updateMember = (updatedMember: TeamMember, isRival = false) => {
    const setter = isRival ? setRivalTeam : setTeam;
    setter((prev) => {
      const next = prev.some((m) => m.slot === updatedMember.slot)
        ? prev.map((m) => (m.slot === updatedMember.slot ? updatedMember : m))
        : [...prev, updatedMember];
      return [...next].sort((a, b) => a.slot - b.slot);
    });
  };

  const toggleMemberTera = (slot: number, isRival = false) => {
    const setter = isRival ? setRivalTeam : setTeam;
    setter((prev) =>
      prev.map((m) =>
        m.slot === slot && m.teraType ? { ...m, isTeraActive: !m.isTeraActive } : m,
      ),
    );
  };

  const removeMember = (slot: number, isRival = false) => {
    const setter = isRival ? setRivalTeam : setTeam;
    setter((prev) => prev.filter((m) => m.slot !== slot));
  };

  const clearTeam = (isRival = false) => {
    const setter = isRival ? setRivalTeam : setTeam;
    setter([]);
  };

  const resetSampleTeam = (isRival = false) => {
    if (isRival) {
      setRivalTeam(INITIAL_SAMPLE_RIVAL_TEAM);
    } else {
      setTeam(INITIAL_SAMPLE_TEAM);
    }
  };

  return {
    team,
    setTeam,
    rivalTeam,
    setRivalTeam,
    updateMember,
    toggleMemberTera,
    removeMember,
    clearTeam,
    resetSampleTeam,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
    rivalDefensiveSummary,
    rivalDefensiveWarnings,
    rivalOffensiveSummary,
  };
}
