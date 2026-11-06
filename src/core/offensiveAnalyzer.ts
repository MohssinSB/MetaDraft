import { ALL_TYPES } from '@/data/typeChart';
import { getMoveEffectiveness, hasMoveStab } from '@/core/effectiveness';
import type { TeamMember, TypeOffensiveSummary } from '@/types/pokemon';

/**
 * Analiza la cobertura ofensiva del equipo comprobando a qué tipos elementales
 * se puede golpear con eficacia súper efectiva (x2) usando movimientos de daño
 * (incluyendo movimientos especiales como Liofilización y STAB de Teratipo).
 */
export function analyzeTeamOffense(team: readonly TeamMember[]): TypeOffensiveSummary[] {
  return ALL_TYPES.map((targetType) => {
    let superEffectiveMoveCount = 0;
    let hasStabSuperEffective = false;

    for (const member of team) {
      for (const move of member.moves) {
        if (move.category === 'status') continue;

        const effectiveness = getMoveEffectiveness(move, [targetType]);
        if (effectiveness > 1) {
          superEffectiveMoveCount++;
          if (hasMoveStab(member, move.type)) {
            hasStabSuperEffective = true;
          }
        }
      }
    }

    return {
      targetType,
      isCoveredSuperEffective: superEffectiveMoveCount > 0,
      hasStabSuperEffective,
      superEffectiveMoveCount,
    };
  });
}
