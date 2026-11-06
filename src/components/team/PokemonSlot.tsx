import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { TypeBadge } from '@/components/team/TypeBadge';
import type { TeamMember } from '@/types/pokemon';

interface PokemonSlotProps {
  slot: number;
  member?: TeamMember;
  onRemove?: (slot: number) => void;
}

export function PokemonSlot({ slot, member, onRemove }: PokemonSlotProps) {
  if (!member) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-slate-500">
        <span className="text-sm font-medium">Slot #{slot} vacío</span>
        <span className="mt-1 text-xs text-slate-600">
          {/* TODO (Fase 3): Añadir buscador / modal para seleccionar Pokémon y sus 4 ataques */}
          Pendiente de selector interactivo
        </span>
      </div>
    );
  }

  const abilityLabel = member.ability
    ? ABILITY_MODIFIERS[member.ability]?.nameEs ?? member.ability
    : 'Estándar';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-slate-400">Slot #{slot}</span>
            <h3 className="text-lg font-bold text-white">{member.speciesName}</h3>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(slot)}
              className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400"
              title="Quitar del equipo"
            >
              Quitar
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {member.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Habilidad: <span className="font-medium text-slate-200">{abilityLabel}</span>
        </p>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Movimientos ({member.moves.length}/4)
        </p>
        <ul className="space-y-1">
          {member.moves.map((move) => (
            <li
              key={move.id}
              className="flex items-center justify-between rounded bg-slate-950/60 px-2 py-1 text-xs"
            >
              <span className="truncate text-slate-200">{move.name}</span>
              <div className="flex items-center gap-1.5">
                {move.category === 'status' && (
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                    Estado
                  </span>
                )}
                <TypeBadge type={move.type} size="sm" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
