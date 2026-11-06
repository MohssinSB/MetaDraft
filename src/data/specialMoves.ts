import type { PokemonType } from '@/types/pokemon';

export interface SpecialMoveRule {
  id: string;
  nameEs: string;
  baseType: PokemonType;
  description: string;
  /** Sobrescribe la eficacia contra determinados tipos individuales */
  overrideTargetEffectiveness?: Partial<Record<PokemonType, number>>;
  /** Si el movimiento combina un segundo tipo en su cálculo (ej. Plancha Voladora) */
  secondaryAttackType?: PokemonType;
}

/**
 * Movimientos que rompen las reglas normales de la tabla de tipos.
 * Útil para la Fase 4 de tu hoja de ruta.
 */
export const SPECIAL_MOVES: Record<string, SpecialMoveRule> = {
  'freeze-dry': {
    id: 'freeze-dry',
    nameEs: 'Liofilización',
    baseType: 'ice',
    description: 'Es tipo Hielo, pero resulta súper efectivo (x2) contra el tipo Agua.',
    overrideTargetEffectiveness: { water: 2 },
  },
  'flying-press': {
    id: 'flying-press',
    nameEs: 'Plancha Voladora',
    baseType: 'fighting',
    description: 'Combina el tipo Lucha y el tipo Volador al calcular su efectividad.',
    secondaryAttackType: 'flying',
  },
  'thousand-arrows': {
    id: 'thousand-arrows',
    nameEs: 'Mil Flechas',
    baseType: 'ground',
    description: 'Movimiento de tipo Tierra capaz de golpear de forma neutra a Pokémon de tipo Volador.',
    overrideTargetEffectiveness: { flying: 1 },
  },
};
