import { PokemonSlot } from '@/components/team/PokemonSlot';
import type { TeamMember } from '@/types/pokemon';

interface TeamGridProps {
  title?: string;
  team: readonly TeamMember[];
  maxSlots: 6 | 8;
  onToggleMaxSlots: () => void;
  onEditSlot: (slot: number) => void;
  onToggleTera?: (slot: number) => void;
  onToggleBan?: (slot: number) => void;
  onRemoveMember?: (slot: number) => void;
  onClearTeam?: () => void;
  onResetSampleTeam?: () => void;
  onOpenShowdown?: () => void;
}

const SLOTS_6 = [1, 2, 3, 4, 5, 6] as const;
const SLOTS_8 = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function TeamGrid({
  title = 'Tu Equipo',
  team,
  maxSlots,
  onToggleMaxSlots,
  onEditSlot,
  onToggleTera,
  onToggleBan,
  onRemoveMember,
  onClearTeam,
  onResetSampleTeam,
  onOpenShowdown,
}: TeamGridProps) {
  const slots = maxSlots === 8 ? SLOTS_8 : SLOTS_6;
  const visibleMembers = team.filter((m) => m.slot <= maxSlots);
  const bannedCount = visibleMembers.filter((m) => m.isBanned).length;
  const activeCount = visibleMembers.length - bannedCount;

  return (
    <section aria-label={title}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {title} ({visibleMembers.length}/{maxSlots})
            </h2>
            {bannedCount > 0 && (
              <span className="rounded-full bg-rose-950/80 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                {activeCount} activos · {bannedCount} baneado{bannedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Haz clic en cualquier slot para editar, pulsa <strong>Banear</strong> para excluir un Pokémon baneado sin borrarlo, o activa <strong>8 Slots</strong> para formato con baneos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleMaxSlots}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              maxSlots === 8
                ? 'border-amber-500/60 bg-amber-950/50 text-amber-300 hover:bg-amber-900/50'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {maxSlots === 8 ? '🎯 Modo 8 Slots (Baneos): ON' : '+ Activar 8 Slots (Baneos)'}
          </button>

          {onOpenShowdown && (
            <button
              type="button"
              onClick={onOpenShowdown}
              className="rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/50"
            >
              ⇄ Importar / Exportar Showdown
            </button>
          )}
          {onResetSampleTeam && (
            <button
              type="button"
              onClick={onResetSampleTeam}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cargar ejemplo
            </button>
          )}
          {onClearTeam && team.length > 0 && (
            <button
              type="button"
              onClick={onClearTeam}
              className="rounded-lg border border-rose-900/60 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/40"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          maxSlots === 8 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {slots.map((slot) => {
          const member = team.find((m) => m.slot === slot);
          return (
            <PokemonSlot
              key={slot}
              slot={slot}
              member={member}
              onEdit={onEditSlot}
              onToggleTera={onToggleTera}
              onToggleBan={onToggleBan}
              onRemove={onRemoveMember}
            />
          );
        })}
      </div>
    </section>
  );
}
