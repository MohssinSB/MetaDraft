import { ALL_TYPES } from '@/data/typeChart';
import { getMoveEffectiveness, hasMoveStab } from '@/core/effectiveness';
import type {
  OffensiveCoverageContributor,
  PokemonType,
  TeamMember,
  TypeOffensiveSummary,
} from '@/types/pokemon';

/**
 * Analiza la cobertura ofensiva del equipo (o de un único Pokémon si se pasa `[member]`)
 * comprobando a qué tipos elementales se puede golpear con eficacia súper efectiva (x2).
 */
export function analyzeTeamOffense(team: readonly TeamMember[]): TypeOffensiveSummary[] {
  return ALL_TYPES.map((targetType) => {
    let superEffectiveMoveCount = 0;
    let hasStabSuperEffective = false;
    const coveredBy: OffensiveCoverageContributor[] = [];

    for (const member of team) {
      for (const move of member.moves) {
        if (move.category === 'status') continue;

        const effectiveness = getMoveEffectiveness(move, [targetType]);
        if (effectiveness > 1) {
          superEffectiveMoveCount++;
          const isStab = hasMoveStab(member, move.type);
          if (isStab) {
            hasStabSuperEffective = true;
          }
          coveredBy.push({
            slot: member.slot,
            speciesName: member.speciesName,
            moveName: move.name,
            moveType: move.type,
            isStab,
          });
        }
      }
    }

    return {
      targetType,
      isCoveredSuperEffective: superEffectiveMoveCount > 0,
      hasStabSuperEffective,
      superEffectiveMoveCount,
      coveredBy,
    };
  });
}

/**
 * Devuelve la lista de tipos a los que un Pokémon individual golpea de forma súper efectiva (x2)
 * con sus movimientos de daño actuales.
 */
export function getMemberCoveredTypes(member: TeamMember): PokemonType[] {
  return analyzeTeamOffense([member])
    .filter((summary) => summary.isCoveredSuperEffective)
    .map((summary) => summary.targetType);
}
