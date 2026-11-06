import { useState } from 'react';
import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { SPECIAL_MOVES } from '@/data/specialMoves';
import { ALL_TYPES, TYPE_METADATA } from '@/data/typeChart';
import { TypeBadge } from '@/components/team/TypeBadge';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';
import { formatSlugToDisplayName } from '@/services/pokeapi';
import type { Move, MoveCategory, PokemonType, TeamMember } from '@/types/pokemon';

interface PokemonEditorModalProps {
  slot: number;
  initialMember?: TeamMember;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}

export function PokemonEditorModal({
  slot,
  initialMember,
  onSave,
  onClose,
}: PokemonEditorModalProps) {
  const {
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
  } = usePokemonSearch();

  const [speciesName, setSpeciesName] = useState(initialMember?.speciesName ?? '');
  const [primaryType, setPrimaryType] = useState<PokemonType>(initialMember?.types[0] ?? 'normal');
  const [secondaryType, setSecondaryType] = useState<PokemonType | ''>(
    initialMember?.types[1] ?? '',
  );
  const [ability, setAbility] = useState<string>(initialMember?.ability ?? '');
  const [teraType, setTeraType] = useState<PokemonType | ''>(initialMember?.teraType ?? '');
  const [isTeraActive, setIsTeraActive] = useState<boolean>(initialMember?.isTeraActive ?? false);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(initialMember?.spriteUrl ?? null);
  const [moves, setMoves] = useState<Move[]>(initialMember?.moves ?? []);

  const [isFetchingPokemon, setIsFetchingPokemon] = useState(false);
  const [isFetchingMove, setIsFetchingMove] = useState(false);
  const [quickMoveType, setQuickMoveType] = useState<PokemonType>('fire');
  const [quickMoveCategory, setQuickMoveCategory] = useState<MoveCategory>('physical');

  const handleSelectPokemon = async (slugId: string, displayName: string) => {
    setIsFetchingPokemon(true);
    setPokemonQuery('');
    const details = await getPokemonDetails(slugId);
    setIsFetchingPokemon(false);

    if (details) {
      setSpeciesName(displayName);
      setPrimaryType(details.types[0]);
      setSecondaryType(details.types[1] ?? '');
      setSpriteUrl(details.spriteUrl);

      const matchingDefensiveAbility = details.abilities.find((ab) => ab in ABILITY_MODIFIERS);
      setAbility(matchingDefensiveAbility ?? '');
    }
  };

  const handleSelectMove = async (moveSlug: string) => {
    if (moves.length >= 4) return;
    if (moves.some((m) => m.id === moveSlug)) {
      setMoveQuery('');
      return;
    }

    setIsFetchingMove(true);
    setMoveQuery('');
    const moveData = await getMoveDetails(moveSlug);
    setIsFetchingMove(false);

    if (moveData) {
      setMoves((prev) => [...prev, moveData]);
    }
  };

  const handleAddQuickMove = () => {
    if (moves.length >= 4) return;
    const typeLabel = TYPE_METADATA[quickMoveType].labelEs;
    const catLabel =
      quickMoveCategory === 'physical'
        ? 'Físico'
        : quickMoveCategory === 'special'
          ? 'Especial'
          : 'Estado';

    const customMove: Move = {
      id: `custom-${quickMoveType}-${quickMoveCategory}-${Date.now()}`,
      name: `Ataque ${typeLabel} (${catLabel})`,
      type: quickMoveType,
      category: quickMoveCategory,
      power: quickMoveCategory === 'status' ? null : 80,
    };

    setMoves((prev) => [...prev, customMove]);
  };

  const handleRemoveMove = (moveId: string) => {
    setMoves((prev) => prev.filter((m) => m.id !== moveId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = speciesName.trim() || `Pokémon #${slot}`;
    const finalTypes: [PokemonType] | [PokemonType, PokemonType] =
      secondaryType && secondaryType !== primaryType
        ? [primaryType, secondaryType]
        : [primaryType];

    onSave({
      slot,
      speciesName: finalName,
      types: finalTypes,
      ability: ability || undefined,
      teraType: teraType || undefined,
      isTeraActive: teraType ? isTeraActive : false,
      spriteUrl,
      moves,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Slot #{slot} — Modo Random
            </span>
            <h2 className="text-xl font-bold text-white">
              {initialMember ? `Editar a ${initialMember.speciesName}` : 'Añadir Pokémon al Equipo'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cerrar ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* 1. Buscador de Pokémon en PokéAPI */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              1. Buscar Pokémon en PokéAPI (Autocompletado)
            </label>
            <div className="relative mt-2">
              <input
                type="text"
                value={pokemonQuery}
                onChange={(e) => setPokemonQuery(e.target.value)}
                placeholder={
                  isLoadingCatalogs
                    ? 'Cargando catálogo de PokéAPI...'
                    : 'Escribe ej. Garchomp, Rotom, Dragonite, Zacian...'
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {pokemonSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-52 w-full divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
                  {pokemonSuggestions.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectPokemon(entry.id, entry.displayName)}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-slate-200 hover:bg-indigo-600/20 hover:text-white"
                      >
                        <span className="font-medium">{entry.displayName}</span>
                        <span className="text-xs text-slate-500">{entry.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                {isFetchingPokemon ? (
                  <span className="text-[11px] text-indigo-400">Cargando...</span>
                ) : spriteUrl ? (
                  <img
                    src={spriteUrl}
                    alt={speciesName}
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-600">Sin icono</span>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs text-slate-400">Nombre en tu equipo</label>
                  <input
                    type="text"
                    required
                    value={speciesName}
                    onChange={(e) => setSpeciesName(e.target.value)}
                    placeholder="Ej. Garchomp"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tipos, Habilidad y Teratipo */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Tipo Primario</label>
              <select
                value={primaryType}
                onChange={(e) => setPrimaryType(e.target.value as PokemonType)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_METADATA[t].labelEs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Tipo Secundario</label>
              <select
                value={secondaryType}
                onChange={(e) => setSecondaryType(e.target.value as PokemonType | '')}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Ninguno (Monotipo)</option>
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_METADATA[t].labelEs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Habilidad Defensiva
              </label>
              <select
                value={ability}
                onChange={(e) => setAbility(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Estándar (Sin inmunidad extra)</option>
                {Object.values(ABILITY_MODIFIERS).map((ab) => (
                  <option key={ab.id} value={ab.id}>
                    {ab.nameEs} ({formatSlugToDisplayName(ab.id)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-fuchsia-300">
                Teratipo (Opcional - 9ª Gen)
              </label>
              <select
                value={teraType}
                onChange={(e) => setTeraType(e.target.value as PokemonType | '')}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs font-medium text-white focus:border-fuchsia-500 focus:outline-none"
              >
                <option value="">Sin Teratipo</option>
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    Tera {TYPE_METADATA[t].labelEs}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Selección de hasta 4 Movimientos */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                3. Movimientos del Pokémon ({moves.length}/4)
              </label>
              {isFetchingMove && (
                <span className="text-xs text-indigo-400">Descargando movimiento...</span>
              )}
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                disabled={moves.length >= 4}
                value={moveQuery}
                onChange={(e) => setMoveQuery(e.target.value)}
                placeholder={
                  moves.length >= 4
                    ? 'Ya has asignado el máximo de 4 movimientos'
                    : 'Buscar ataque en inglés (ej. freeze-dry, earthquake, flying-press, u-turn)...'
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              {moveSuggestions.length > 0 && moves.length < 4 && (
                <ul className="absolute z-20 mt-1 max-h-48 w-full divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
                  {moveSuggestions.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectMove(entry.id)}
                        className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-slate-200 hover:bg-indigo-600/20 hover:text-white"
                      >
                        <span className="font-medium">{entry.displayName}</span>
                        <span className="text-xs text-slate-500">+ Añadir</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
              <span className="text-xs text-slate-400">¿Solo quieres cubrir un tipo rápido?</span>
              <select
                value={quickMoveType}
                onChange={(e) => setQuickMoveType(e.target.value as PokemonType)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_METADATA[t].labelEs}
                  </option>
                ))}
              </select>
              <select
                value={quickMoveCategory}
                onChange={(e) => setQuickMoveCategory(e.target.value as MoveCategory)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
              >
                <option value="physical">Físico (Daño)</option>
                <option value="special">Especial (Daño)</option>
                <option value="status">Estado (Sin daño)</option>
              </select>
              <button
                type="button"
                disabled={moves.length >= 4}
                onClick={handleAddQuickMove}
                className="rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-slate-700 disabled:opacity-40"
              >
                + Añadir por tipo
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {moves.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-500">
                  No hay movimientos añadidos todavía.
                </p>
              ) : (
                moves.map((m) => {
                  const specialRule = SPECIAL_MOVES[m.id];
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeBadge type={m.type} size="sm" />
                          <span className="font-semibold text-white">{m.name}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            {m.category === 'physical'
                              ? `Físico ${m.power ? `(${m.power})` : ''}`
                              : m.category === 'special'
                                ? `Especial ${m.power ? `(${m.power})` : ''}`
                                : 'Estado (No cubre tipos)'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMove(m.id)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          Quitar
                        </button>
                      </div>
                      {specialRule && (
                        <p className="text-[11px] text-amber-300">
                          ★ Regla especial: {specialRule.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
            >
              Guardar en Slot #{slot}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
