import type { PokemonType } from '@/types/pokemon';

export interface AbilityDefensiveModifier {
  id: string;
  nameEs: string;
  /** Multiplicador que aplica al tipo entrante (ej. 0 para inmunidad, 0.5 para resistencia, 2 para debilidad extra) */
  typeMultipliers: Partial<Record<PokemonType, number>>;
  /**
   * Anula las debilidades (eficacia > 1 pasa a 1) de un tipo defensor concreto.
   * Ejemplo: Ráfaga Delta ('delta-stream') atenúa las debilidades del tipo Volador ('flying').
   */
  neutralizeWeaknessesOfDefenderType?: PokemonType;
  /**
   * Si es true, cualquier ataque con efectividad <= 1 pasa a hacer 0 de daño (ej. Superguarda / Wonder Guard).
   */
  onlySuperEffectiveHits?: boolean;
}

/**
 * Diccionario de habilidades competitivas comunes que alteran las debilidades/inmunidades de un Pokémon.
 */
export const ABILITY_MODIFIERS: Record<string, AbilityDefensiveModifier> = {
  'delta-stream': {
    id: 'delta-stream',
    nameEs: 'Ráfaga Delta',
    typeMultipliers: {},
    neutralizeWeaknessesOfDefenderType: 'flying',
  },
  'desolate-land': {
    id: 'desolate-land',
    nameEs: 'Tierra del Ocaso',
    typeMultipliers: { water: 0 },
  },
  'primordial-sea': {
    id: 'primordial-sea',
    nameEs: 'Mar del Albor',
    typeMultipliers: { fire: 0 },
  },
  'wonder-guard': {
    id: 'wonder-guard',
    nameEs: 'Superguarda',
    typeMultipliers: {},
    onlySuperEffectiveHits: true,
  },
  levitate: {
    id: 'levitate',
    nameEs: 'Levitación',
    typeMultipliers: { ground: 0 },
  },
  'earth-eater': {
    id: 'earth-eater',
    nameEs: 'Comebarro',
    typeMultipliers: { ground: 0 },
  },
  'flash-fire': {
    id: 'flash-fire',
    nameEs: 'Absorbe Fuego',
    typeMultipliers: { fire: 0 },
  },
  'well-baked-body': {
    id: 'well-baked-body',
    nameEs: 'Cuerpo Horneado',
    typeMultipliers: { fire: 0 },
  },
  'water-absorb': {
    id: 'water-absorb',
    nameEs: 'Absorbe Agua',
    typeMultipliers: { water: 0 },
  },
  'storm-drain': {
    id: 'storm-drain',
    nameEs: 'Colector',
    typeMultipliers: { water: 0 },
  },
  'dry-skin': {
    id: 'dry-skin',
    nameEs: 'Piel Seca',
    typeMultipliers: { water: 0, fire: 1.25 },
  },
  'volt-absorb': {
    id: 'volt-absorb',
    nameEs: 'Absorbe Elec',
    typeMultipliers: { electric: 0 },
  },
  'lightning-rod': {
    id: 'lightning-rod',
    nameEs: 'Pararrayos',
    typeMultipliers: { electric: 0 },
  },
  'motor-drive': {
    id: 'motor-drive',
    nameEs: 'Electromotor',
    typeMultipliers: { electric: 0 },
  },
  'sap-sipper': {
    id: 'sap-sipper',
    nameEs: 'Herbívoro',
    typeMultipliers: { grass: 0 },
  },
  'thick-fat': {
    id: 'thick-fat',
    nameEs: 'Sebo',
    typeMultipliers: { fire: 0.5, ice: 0.5 },
  },
  'purifying-salt': {
    id: 'purifying-salt',
    nameEs: 'Sal Purificadora',
    typeMultipliers: { ghost: 0.5 },
  },
  heatproof: {
    id: 'heatproof',
    nameEs: 'Ignífugo',
    typeMultipliers: { fire: 0.5 },
  },
  fluffy: {
    id: 'fluffy',
    nameEs: 'Peluche',
    typeMultipliers: { fire: 2 },
  },
};
