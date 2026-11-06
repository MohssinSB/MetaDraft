import { ALL_TYPES, TYPE_CHART } from '@/data/typeChart';
import type { TeamMember, TypeOffensiveSummary } from '@/types/pokemon';

/**
 * Analiza la cobertura ofensiva del equipo comprobando a qué tipos elementales
 * se puede golpear con eficacia súper efectiva (x2) usando movimientos de daño.
 */
export function analyzeTeamOffense(team: readonly TeamMember[]): TypeOffensiveSummary[] {
  return ALL_TYPES.map((targetType) => {
    let superEffectiveMoveCount = 0;
    let hasStabSuperEffective = false;

    for (const member of team) {
      for (const move of member.moves) {
        // Regla importante: ignorar movimientos de estado ('status') como Protección o Danza Espada
        if (move.category === 'status') continue;

        const effectiveness = TYPE_CHART[move.type][targetType];
        if (effectiveness > 1) {
          superEffectiveMoveCount++;
          const isStab = member.types.includes(move.type);
          if (isStab) {
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
