import { ALL_TYPES } from '@/data/typeChart';
import { getAttackEffectiveness, getEffectiveDefensiveTypes } from '@/core/effectiveness';
import type { TeamMember, TypeDefensiveSummary } from '@/types/pokemon';

/**
 * Analiza las debilidades, resistencias e inmunidades de todo el equipo (hasta 6 Pokémon)
 * frente a cada uno de los 18 tipos elementales (respetando Teracristalización si está activa).
 */
export function analyzeTeamDefense(team: readonly TeamMember[]): TypeDefensiveSummary[] {
  return ALL_TYPES.map((attackType) => {
    let immuneCount = 0;
    let resistCount = 0;
    let neutralCount = 0;
    let weakCount = 0;
    const memberMultipliers: TypeDefensiveSummary['memberMultipliers'] = {};

    for (const member of team) {
      const effectiveTypes = getEffectiveDefensiveTypes(member);
      const mult = getAttackEffectiveness(attackType, effectiveTypes, member.ability);
      memberMultipliers[member.slot] = mult;

      if (mult === 0) {
        immuneCount++;
      } else if (mult < 1) {
        resistCount++;
      } else if (mult === 1) {
        neutralCount++;
      } else {
        weakCount++;
      }
    }

    return {
      attackType,
      immuneCount,
      resistCount,
      neutralCount,
      weakCount,
      memberMultipliers,
    };
  });
}

/**
 * Detecta tipos peligrosos para el equipo (por ejemplo: 3 o más debilidades, o 2+ debilidades sin resistencias).
 */
export function getDefensiveWarnings(summaries: readonly TypeDefensiveSummary[]): TypeDefensiveSummary[] {
  return summaries.filter(
    (s) => s.weakCount >= 3 || (s.weakCount >= 2 && s.resistCount + s.immuneCount === 0),
  );
}
