import { ALL_TYPES, TYPE_CHART } from '@/data/typeChart';
import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import type { EffectivenessMultiplier, PokemonType } from '@/types/pokemon';

/**
 * Calcula el multiplicador de daño que recibe un Pokémon defensor (de 1 o 2 tipos)
 * ante un ataque de un tipo determinado.
 *
 * @param attackType Tipo del movimiento atacante
 * @param defenderTypes Array con 1 o 2 tipos del Pokémon defensor
 * @param defenderAbility Habilidad opcional del defensor (ej. 'levitate')
 */
export function getAttackEffectiveness(
  attackType: PokemonType,
  defenderTypes: readonly PokemonType[],
  defenderAbility?: string,
): EffectivenessMultiplier {
  // 1. Multiplicar la eficacia contra cada uno de los tipos del defensor
  // Evitamos contar dos veces el mismo tipo si por error se pasa ['fire', 'fire']
  const uniqueDefenderTypes = Array.from(new Set(defenderTypes));

  let multiplier = uniqueDefenderTypes.reduce((acc, defType) => {
    return acc * TYPE_CHART[attackType][defType];
  }, 1);

  // 2. Aplicar modificador de habilidad si existe (ej. Levitación -> Tierra x0)
  if (defenderAbility && ABILITY_MODIFIERS[defenderAbility]) {
    const abilityMod = ABILITY_MODIFIERS[defenderAbility].typeMultipliers[attackType];
    if (abilityMod !== undefined) {
      multiplier *= abilityMod;
    }
  }

  // TODO (Fase 4): Soportar movimientos especiales (ej. Liofilización / Freeze-Dry contra Agua)
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
