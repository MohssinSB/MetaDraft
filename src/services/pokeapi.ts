import type { Move, PokemonType } from '@/types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokeApiSpeciesSummary {
  name: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  abilities: string[];
  spriteUrl: string | null;
}

/**
 * Obtiene los tipos, habilidades y sprite de un Pokémon desde PokéAPI.
 * TODO (Fase 2): Añadir caché en memoria o localStorage para no repetir peticiones.
 */
export async function fetchPokemonByName(nameOrId: string): Promise<PokeApiSpeciesSummary> {
  const normalized = nameOrId.trim().toLowerCase();
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${normalized}`);

  if (!response.ok) {
    throw new Error(`No se encontró el Pokémon "${nameOrId}" en PokéAPI.`);
  }

  const data = await response.json();
  const types = data.types
    .sort((a: { slot: number }, b: { slot: number }) => a.slot - b.slot)
    .map((t: { type: { name: PokemonType } }) => t.type.name) as [PokemonType] | [PokemonType, PokemonType];

  const abilities = data.abilities.map((a: { ability: { name: string } }) => a.ability.name);
  const spriteUrl = data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default ?? null;

  return {
    name: data.name,
    types,
    abilities,
    spriteUrl,
  };
}

/**
 * Obtiene el tipo, categoría (physical/special/status) y potencia de un movimiento desde PokéAPI.
 */
export async function fetchMoveByName(moveNameOrId: string): Promise<Move> {
  const normalized = moveNameOrId.trim().toLowerCase().replace(/\s+/g, '-');
  const response = await fetch(`${POKEAPI_BASE_URL}/move/${normalized}`);

  if (!response.ok) {
    throw new Error(`No se encontró el movimiento "${moveNameOrId}" en PokéAPI.`);
  }

  const data = await response.json();
  return {
    id: data.name,
    name: data.name,
    type: data.type.name as PokemonType,
    category: data.damage_class.name,
    power: data.power,
  };
}
