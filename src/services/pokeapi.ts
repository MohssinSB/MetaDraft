import { getCachedItem, setCachedItem } from '@/services/storage';
import type { CatalogEntry, Move, PokemonType } from '@/types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokeApiSpeciesSummary {
  name: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  abilities: string[];
  spriteUrl: string | null;
}

/**
 * Caché en memoria para acceso instantáneo durante la sesión actual.
 */
const pokemonMemoryCache = new Map<string, PokeApiSpeciesSummary>();
const moveMemoryCache = new Map<string, Move>();

/**
 * Convierte un slug de PokéAPI (ej. "rotom-wash") en un nombre legible ("Rotom Wash").
 */
export function formatSlugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Descarga el catálogo completo de Pokémon (~1300 especies y formas) para el autocompletado.
 */
export async function fetchPokemonCatalog(): Promise<CatalogEntry[]> {
  const cached = getCachedItem<CatalogEntry[]>('pokemon_catalog');
  if (cached) return cached;

  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1500`);
  if (!response.ok) {
    throw new Error('No se pudo descargar el catálogo de Pokémon desde PokéAPI.');
  }

  const data = (await response.json()) as { results: Array<{ name: string }> };
  const catalog: CatalogEntry[] = data.results.map((item) => ({
    id: item.name,
    displayName: formatSlugToDisplayName(item.name),
  }));

  setCachedItem('pokemon_catalog', catalog);
  return catalog;
}

/**
 * Descarga el catálogo global de TODOS los movimientos del juego (~900+ movimientos).
 * Ideal para torneos en modo Random donde cualquier Pokémon puede tener cualquier ataque.
 */
export async function fetchMoveCatalog(): Promise<CatalogEntry[]> {
  const cached = getCachedItem<CatalogEntry[]>('move_catalog');
  if (cached) return cached;

  const response = await fetch(`${POKEAPI_BASE_URL}/move?limit=1000`);
  if (!response.ok) {
    throw new Error('No se pudo descargar el catálogo de movimientos desde PokéAPI.');
  }

  const data = (await response.json()) as { results: Array<{ name: string }> };
  const catalog: CatalogEntry[] = data.results.map((item) => ({
    id: item.name,
    displayName: formatSlugToDisplayName(item.name),
  }));

  setCachedItem('move_catalog', catalog);
  return catalog;
}

/**
 * Filtra un catálogo (de Pokémon o de Movimientos) según el texto que escribe el usuario.
 */
export function searchCatalog(
  query: string,
  catalog: readonly CatalogEntry[],
  limit = 10,
): CatalogEntry[] {
  const cleanQuery = query.trim().toLowerCase();
  if(cleanQuery === ''){return [];}
  const matches = catalog.filter((entry) => {
    const matchingId = entry.id.toLowerCase().includes(cleanQuery);
    const matchingName = entry.displayName.toLowerCase().includes(cleanQuery);
    return matchingId || matchingName
  })
  return matches.slice(0, limit);
}

/**
 * Obtiene los tipos, habilidades y sprite de un Pokémon desde PokéAPI.
 */
export async function fetchPokemonByName(nameOrId: string): Promise<PokeApiSpeciesSummary> {
  const normalized = nameOrId.trim().toLowerCase();

  const cachedInMemory = pokemonMemoryCache.get(normalized);
  if(cachedInMemory){ return cachedInMemory;}

  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${normalized}`);

  if (!response.ok) {
    throw new Error(`No se encontró el Pokémon "${nameOrId}" en PokéAPI.`);
  }

  const data = await response.json();
  const types = data.types
    .sort((a: { slot: number }, b: { slot: number }) => a.slot - b.slot)
    .map((t: { type: { name: PokemonType } }) => t.type.name) as [PokemonType] | [PokemonType, PokemonType];

  const abilities = data.abilities.map((a: { ability: { name: string } }) => a.ability.name);
  const spriteUrl =
    data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default ?? null;

  const summary: PokeApiSpeciesSummary = {
    name: data.name,
    types,
    abilities,
    spriteUrl,
  };

  pokemonMemoryCache.set(normalized,summary);

  return summary;
}

/**
 * Obtiene el tipo, categoría (physical/special/status) y potencia de un movimiento desde PokéAPI.
 */
export async function fetchMoveByName(moveNameOrId: string): Promise<Move> {
  const normalized = moveNameOrId.trim().toLowerCase().replace(/\s+/g, '-');

  const cachedInMemory = moveMemoryCache.get(normalized);
  if(cachedInMemory){return cachedInMemory};
  const response = await fetch(`${POKEAPI_BASE_URL}/move/${normalized}`);

  if (!response.ok) {
    throw new Error(`No se encontró el movimiento "${moveNameOrId}" en PokéAPI.`);
  }

  const data = await response.json();

  const spanishEntry = data.names?.find(
  (entry: { name: string; language: { name: string } }) => entry.language.name === 'es'
  );
  const translatedName: string = spanishEntry?.name ?? formatSlugToDisplayName(data.name);


  const move: Move = {
    id: data.name,
    name: translatedName,
    type: data.type.name as PokemonType,
    category: data.damage_class.name,
    power: data.power,
  };

  moveMemoryCache.set(normalized, move);    
  return move;
}

/**
 * Limpia la caché en memoria (útil para tests unitarios).
 */
export function clearPokeApiMemoryCache(): void {
  pokemonMemoryCache.clear();
  moveMemoryCache.clear();
}
