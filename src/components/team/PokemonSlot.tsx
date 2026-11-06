import { getEffectiveDefensiveTypes, hasMoveStab } from '@/core/effectiveness';
import { getMemberCoveredTypes } from '@/core/offensiveAnalyzer';
import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { SPECIAL_MOVES } from '@/data/specialMoves';
import { TYPE_METADATA } from '@/data/typeChart';
import { TypeBadge } from '@/components/team/TypeBadge';
import type { TeamMember } from '@/types/pokemon';

interface PokemonSlotProps {
  slot: number;
  member?: TeamMember;
  onEdit: (slot: number) => void;
  onToggleTera?: (slot: number) => void;
  onRemove?: (slot: number) => void;
}

export function PokemonSlot({
  slot,
  member,
  onEdit,
  onToggleTera,
  onRemove,
}: PokemonSlotProps) {
  if (!member) {
    return (
      <button
        type="button"
        onClick={() => onEdit(slot)}
        className="group flex min-h-[210px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-slate-400 transition hover:border-indigo-500/60 hover:bg-slate-900/80 hover:text-white"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-indigo-400 transition group-hover:bg-indigo-600 group-hover:text-white">
          +
        </span>
        <span className="mt-2.5 text-sm font-semibold">Añadir Pokémon al Slot #{slot}</span>
        <span className="mt-1 text-xs text-slate-500">
          Buscar en PokéAPI o configurar para Modo Random
        </span>
      </button>
    );
  }

  const abilityLabel = member.ability
    ? ABILITY_MODIFIERS[member.ability]?.nameEs ?? member.ability
    : 'Estándar';

  const effectiveTypes = getEffectiveDefensiveTypes(member);
  const coveredTypes = getMemberCoveredTypes(member);

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 shadow-md transition ${
        member.isTeraActive
          ? 'border-fuchsia-500/70 bg-slate-900 ring-1 ring-fuchsia-500/30'
          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {member.spriteUrl ? (
              <img
                src={member.spriteUrl}
                alt={member.speciesName}
                className="h-14 w-14 shrink-0 rounded-lg bg-slate-950/60 p-1 object-contain"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-950/60 text-xs font-bold text-slate-600">
                #{slot}
              </div>
            )}
            <div>
              <span className="text-[11px] font-medium text-slate-400">Slot #{slot}</span>
              <h3 className="text-base font-bold text-white">{member.speciesName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {effectiveTypes.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
                {member.isTeraActive && (
                  <span className="rounded bg-fuchsia-950 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                    TERA
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(slot)}
              className="rounded px-2 py-1 text-xs font-medium text-indigo-400 hover:bg-slate-800 hover:text-indigo-300"
              title="Editar Pokémon y ataques"
            >
              Editar
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(slot)}
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                title="Quitar del equipo"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            Habilidad:{' '}
            <span className={member.ability ? 'font-semibold text-amber-300' : 'text-slate-300'}>
              {abilityLabel}
            </span>
          </p>

          {member.teraType && onToggleTera && (
            <button
              type="button"
              onClick={() => onToggleTera(slot)}
              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                member.isTeraActive
                  ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-fuchsia-500/50'
              }`}
              title="Simular Teracristalización en las tablas"
            >
              💎 Tera {TYPE_METADATA[member.teraType].labelEs}
            </button>
          )}
        </div>
      </div>

      {/* Movimientos */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Movimientos ({member.moves.length}/4)
          </p>
          {member.moves.length < 4 && (
            <button
              type="button"
              onClick={() => onEdit(slot)}
              className="text-[11px] font-medium text-indigo-400 hover:underline"
            >
              + Añadir ataque
            </button>
          )}
        </div>

        {member.moves.length === 0 ? (
          <p className="py-2 text-xs italic text-slate-500">Sin movimientos asignados</p>
        ) : (
          <ul className="space-y-1">
            {member.moves.map((move) => {
              const hasStab =
                move.category !== 'status' && hasMoveStab(member, move.type);
              const isSpecialRule = move.id in SPECIAL_MOVES;
              return (
                <li
                  key={move.id}
                  className="flex items-center justify-between rounded bg-slate-950/60 px-2 py-1 text-xs"
                >
                  <span className="truncate font-medium text-slate-200">
                    {move.name}
                    {isSpecialRule && (
                      <span className="ml-1 text-amber-400" title={SPECIAL_MOVES[move.id].description}>
                        ★
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    {move.category === 'status' ? (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                        Estado
                      </span>
                    ) : (
                      hasStab && (
                        <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                          STAB
                        </span>
                      )
                    )}
                    <TypeBadge type={move.type} size="sm" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Cobertura individual de este Pokémon */}
      <div className="mt-3 border-t border-slate-800/80 pt-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Cubre (2x)
          </span>
          <span className="text-[11px] font-bold text-emerald-400">
            {coveredTypes.length} / 18 tipos
          </span>
        </div>
        {coveredTypes.length === 0 ? (
          <p className="text-[11px] italic text-slate-500">
            Ningún tipo cubierto en súper efectivo
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {coveredTypes.map((t) => (
              <TypeBadge key={t} type={t} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
