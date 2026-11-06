import { useEffect, useMemo, useState } from 'react';
import {
  fetchMoveByName,
  fetchMoveCatalog,
  fetchPokemonByName,
  fetchPokemonCatalog,
  searchCatalog,
  type PokeApiSpeciesSummary,
} from '@/services/pokeapi';
import type { CatalogEntry, Move } from '@/types/pokemon';

/**
 * Hook para buscar cualquier Pokémon y cualquier movimiento (Modo Random).
 * Conecta los catálogos de PokéAPI con los componentes de interfaz que haremos en la Fase 3.
 */
export function usePokemonSearch() {
  const [pokemonCatalog, setPokemonCatalog] = useState<CatalogEntry[]>([]);
  const [moveCatalog, setMoveCatalog] = useState<CatalogEntry[]>([]);
  const [pokemonQuery, setPokemonQuery] = useState('');
  const [moveQuery, setMoveQuery] = useState('');
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al montar el hook, descargamos (o leemos de caché) los catálogos completos de Pokémon y Movimientos
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCatalogs(true);

    Promise.all([fetchPokemonCatalog(), fetchMoveCatalog()])
      .then(([pokeList, moveList]) => {
        if (!isMounted) return;
        setPokemonCatalog(pokeList);
        setMoveCatalog(moveList);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar catálogos');
      })
      .finally(() => {
        if (isMounted) setIsLoadingCatalogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sugerencias en tiempo real usando `searchCatalog`
  const pokemonSuggestions = useMemo(
    () => searchCatalog(pokemonQuery, pokemonCatalog, 8),
    [pokemonQuery, pokemonCatalog],
  );

  const moveSuggestions = useMemo(
    () => searchCatalog(moveQuery, moveCatalog, 8),
    [moveQuery, moveCatalog],
  );

  const getPokemonDetails = async (nameOrId: string): Promise<PokeApiSpeciesSummary | null> => {
    try {
      setError(null);
      return await fetchPokemonByName(nameOrId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar el Pokémon');
      return null;
    }
  };

  const getMoveDetails = async (moveNameOrId: string): Promise<Move | null> => {
    try {
      setError(null);
      return await fetchMoveByName(moveNameOrId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar el movimiento');
      return null;
    }
  };

  return {
    pokemonQuery,
    setPokemonQuery,
    pokemonSuggestions,
    moveQuery,
    setMoveQuery,
    moveSuggestions,
    isLoadingCatalogs,
    error,
    getPokemonDetails,
    getMoveDetails,
  };
}
