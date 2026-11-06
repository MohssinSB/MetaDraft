import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPokeApiMemoryCache,
  fetchMoveByName,
  fetchPokemonByName,
  formatSlugToDisplayName,
  searchCatalog,
} from '@/services/pokeapi';
import type { CatalogEntry } from '@/types/pokemon';

const SAMPLE_CATALOG: CatalogEntry[] = [
  { id: 'garchomp', displayName: 'Garchomp' },
  { id: 'gardevoir', displayName: 'Gardevoir' },
  { id: 'rotom', displayName: 'Rotom' },
  { id: 'rotom-wash', displayName: 'Rotom Wash' },
  { id: 'rotom-heat', displayName: 'Rotom Heat' },
];

// Mock ligero de localStorage para el entorno Node de Vitest
const mockStorage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
});

describe('Fase 2: Servicios de PokéAPI y Buscador (pokeapi.ts)', () => {
  beforeEach(() => {
    clearPokeApiMemoryCache();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('formatea correctamente slugs de PokéAPI a nombres legibles', () => {
    expect(formatSlugToDisplayName('rotom-wash')).toBe('Rotom Wash');
    expect(formatSlugToDisplayName('will-o-wisp')).toBe('Will O Wisp');
  });

  it('obtiene tipos, habilidades y sprite de un Pokémon desde PokéAPI', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'garchomp',
        types: [
          { slot: 1, type: { name: 'dragon' } },
          { slot: 2, type: { name: 'ground' } },
        ],
        abilities: [{ ability: { name: 'sand-veil' } }, { ability: { name: 'rough-skin' } }],
        sprites: { front_default: 'https://example.com/garchomp.png' },
      }),
    } as Response);

    const result = await fetchPokemonByName('Garchomp');
    expect(result.name).toBe('garchomp');
    expect(result.types).toEqual(['dragon', 'ground']);
    expect(result.abilities).toContain('rough-skin');
    expect(result.spriteUrl).toBe('https://example.com/garchomp.png');
  });

  it('searchCatalog filtra por texto ignorando mayúsculas y respeta el límite', () => {
    const results = searchCatalog('rotom', SAMPLE_CATALOG, 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('rotom');
    expect(searchCatalog('   ', SAMPLE_CATALOG)).toEqual([]);
  });

  it('fetchPokemonByName guarda en caché y no repite la petición HTTP', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'heatran',
        types: [
          { slot: 1, type: { name: 'fire' } },
          { slot: 2, type: { name: 'steel' } },
        ],
        abilities: [{ ability: { name: 'flash-fire' } }],
        sprites: { front_default: null },
      }),
    } as Response);

    await fetchPokemonByName('heatran');
    await fetchPokemonByName('heatran');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('fetchMoveByName extrae el nombre en español desde data.names y usa caché', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'earthquake',
        type: { name: 'ground' },
        damage_class: { name: 'physical' },
        power: 100,
        names: [
          { name: 'Earthquake', language: { name: 'en' } },
          { name: 'Terremoto', language: { name: 'es' } },
        ],
      }),
    } as Response);

    const move = await fetchMoveByName('earthquake');
    const cachedMove = await fetchMoveByName('earthquake');

    expect(move.name).toBe('Terremoto');
    expect(move.type).toBe('ground');
    expect(move.category).toBe('physical');
    expect(cachedMove.name).toBe('Terremoto');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
