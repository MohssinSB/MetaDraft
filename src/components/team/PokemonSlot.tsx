import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { TypeBadge } from '@/components/team/TypeBadge';
import type { TeamMember } from '@/types/pokemon';

interface PokemonSlotProps {
  slot: number;
  member?: TeamMember;
  onEdit: (slot: number) => void;
  onRemove?: (slot: number) => void;
}

export function PokemonSlot({ slot, member, onEdit, onRemove }: PokemonSlotProps) {
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

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md transition hover:border-slate-700">
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
              <div className="mt-1 flex flex-wrap gap-1">
                {member.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
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

        <p className="mt-2.5 text-xs text-slate-400">
          Habilidad:{' '}
          <span className={member.ability ? 'font-semibold text-amber-300' : 'text-slate-300'}>
            {abilityLabel}
          </span>
        </p>
      </div>

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
                move.category !== 'status' && member.types.includes(move.type);
              return (
                <li
                  key={move.id}
                  className="flex items-center justify-between rounded bg-slate-950/60 px-2 py-1 text-xs"
                >
                  <span className="truncate font-medium text-slate-200">{move.name}</span>
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
    </div>
  );
}
