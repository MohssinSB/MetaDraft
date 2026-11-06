import { ALL_TYPES, TYPE_CHART } from '@/data/typeChart';
import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { SPECIAL_MOVES } from '@/data/specialMoves';
import type { EffectivenessMultiplier, Move, PokemonType, TeamMember } from '@/types/pokemon';

/**
 * Devuelve los tipos defensivos activos de un Pokémon.
 * Si tiene Teratipo asignado y la Teracristalización está activa (`isTeraActive`),
 * defiende únicamente con su Teratipo.
 */
export function getEffectiveDefensiveTypes(
  member: Pick<TeamMember, 'types' | 'teraType' | 'isTeraActive'>,
): readonly PokemonType[] {
  if (member.isTeraActive && member.teraType) {
    return [member.teraType];
  }
  return member.types;
}

/**
 * Comprueba si un movimiento recibe bonificación STAB (Same-Type Attack Bonus)
 * por coincidir con los tipos base del Pokémon o con su Teratipo activo.
 */
export function hasMoveStab(
  member: Pick<TeamMember, 'types' | 'teraType' | 'isTeraActive'>,
  moveType: PokemonType,
): boolean {
  if (member.types.includes(moveType)) return true;
  if (member.isTeraActive && member.teraType === moveType) return true;
  return false;
}

/**
 * Calcula el multiplicador de daño que recibe un Pokémon defensor (de 1 o 2 tipos)
 * ante un ataque de un tipo determinado.
 */
export function getAttackEffectiveness(
  attackType: PokemonType,
  defenderTypes: readonly PokemonType[],
  defenderAbility?: string,
): EffectivenessMultiplier {
  const uniqueDefenderTypes = Array.from(new Set(defenderTypes));

  let multiplier = uniqueDefenderTypes.reduce((acc, defType) => {
    return acc * TYPE_CHART[attackType][defType];
  }, 1);

  if (defenderAbility && ABILITY_MODIFIERS[defenderAbility]) {
    const abilityMod = ABILITY_MODIFIERS[defenderAbility].typeMultipliers[attackType];
    if (abilityMod !== undefined) {
      multiplier *= abilityMod;
    }
  }

  return multiplier as EffectivenessMultiplier;
}

/**
 * Calcula la efectividad de un movimiento concreto frente a un defensor,
 * soportando reglas de movimientos especiales (Liofilización, Plancha Voladora, Mil Flechas).
 */
export function getMoveEffectiveness(
  move: Pick<Move, 'id' | 'type' | 'category'>,
  defenderTypes: readonly PokemonType[],
  defenderAbility?: string,
): EffectivenessMultiplier {
  if (move.category === 'status') return 1;

  const specialRule = SPECIAL_MOVES[move.id];
  if (!specialRule) {
    return getAttackEffectiveness(move.type, defenderTypes, defenderAbility);
  }

  const uniqueDefenderTypes = Array.from(new Set(defenderTypes));

  // Caso especial: Mil Flechas (Thousand Arrows) golpea neutro (x1) si el defensor es tipo Volador
  if (move.id === 'thousand-arrows' && uniqueDefenderTypes.includes('flying')) {
    return 1;
  }

  let multiplier = uniqueDefenderTypes.reduce((acc, defType) => {
    const override = specialRule.overrideTargetEffectiveness?.[defType];
    const baseEff = override !== undefined ? override : TYPE_CHART[move.type][defType];
    const secondaryEff = specialRule.secondaryAttackType
      ? TYPE_CHART[specialRule.secondaryAttackType][defType]
      : 1;
    return acc * baseEff * secondaryEff;
  }, 1);

  if (defenderAbility && ABILITY_MODIFIERS[defenderAbility]) {
    const abilityMod = ABILITY_MODIFIERS[defenderAbility].typeMultipliers[move.type];
    if (abilityMod !== undefined) {
      multiplier *= abilityMod;
    }
  }

  return multiplier as EffectivenessMultiplier;
}

/**
 * Devuelve el perfil defensivo completo de un Pokémon contra los 18 tipos de ataque.
 */
export function getPokemonDefensiveProfile(
  defenderTypes: readonly PokemonType[],
  defenderAbility?: string,
): Record<PokemonType, EffectivenessMultiplier> {
  const profile = {} as Record<PokemonType, EffectivenessMultiplier>;

  for (const attackType of ALL_TYPES) {
    profile[attackType] = getAttackEffectiveness(attackType, defenderTypes, defenderAbility);
  }

  return profile;
}
