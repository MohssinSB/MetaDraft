/**
 * Los 18 tipos elementales oficiales de Pokémon (6ª Generación en adelante).
 * Se usan identificadores en inglés en minúscula para compatibilidad 1:1 con PokéAPI y Pokémon Showdown.
 */
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

/**
 * Multiplicadores posibles al recibir un ataque (considerando 1 o 2 tipos defensivos).
 */
export type EffectivenessMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

/**
 * Categoría de un movimiento:
 * - 'physical' y 'special' infligen daño directo y cuentan para cobertura ofensiva.
 * - 'status' son movimientos de estado (ej. Danza Espada, Protección) y no aportan cobertura de daño directo.
 */
export type MoveCategory = 'physical' | 'special' | 'status';

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
}

export interface TeamMember {
  /** Posición en el equipo (1 a 6) */
  slot: number;
  /** Nombre de la especie (ej. "Garchomp") */
  speciesName: string;
  /** Uno o dos tipos elementales del Pokémon */
  types: [PokemonType] | [PokemonType, PokemonType];
  /** Identificador de habilidad (ej. "levitate", "flash-fire") */
  ability?: string;
  /** Teratipo opcional para formatos de 9ª Generación */
  teraType?: PokemonType;
  /** Hasta 4 movimientos asignados */
  moves: Move[];
}

/**
 * Resumen defensivo de todo el equipo frente a un tipo de ataque concreto.
 */
export interface TypeDefensiveSummary {
  attackType: PokemonType;
  /** Miembros que reciben x0 */
  immuneCount: number;
  /** Miembros que reciben x0.25 o x0.5 */
  resistCount: number;
  /** Miembros que reciben x1 */
  neutralCount: number;
  /** Miembros que reciben x2 o x4 */
  weakCount: number;
  /** Multiplicador individual por cada slot del equipo */
  memberMultipliers: Record<number, EffectivenessMultiplier>;
}

/**
 * Resumen ofensivo de cómo golpea tu equipo a un tipo defensor concreto.
 */
export interface TypeOffensiveSummary {
  targetType: PokemonType;
  /** ¿Algún ataque de daño del equipo golpea x2 a este tipo? */
  isCoveredSuperEffective: boolean;
  /** ¿Alguno de esos ataques súper efectivos además tiene STAB? */
  hasStabSuperEffective: boolean;
  /** Número total de ataques del equipo que golpean x2 a este tipo */
  superEffectiveMoveCount: number;
}
