import { PokemonSlot } from '@/components/team/PokemonSlot';
import type { TeamMember } from '@/types/pokemon';

interface TeamGridProps {
  title?: string;
  team: readonly TeamMember[];
  onEditSlot: (slot: number) => void;
  onToggleTera?: (slot: number) => void;
  onRemoveMember?: (slot: number) => void;
  onClearTeam?: () => void;
  onResetSampleTeam?: () => void;
  onOpenShowdown?: () => void;
}

const SLOTS = [1, 2, 3, 4, 5, 6] as const;

export function TeamGrid({
  title = 'Tu Equipo',
  team,
  onEditSlot,
  onToggleTera,
  onRemoveMember,
  onClearTeam,
  onResetSampleTeam,
  onOpenShowdown,
}: TeamGridProps) {
  return (
    <section aria-label={title}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">
            {title} ({team.length}/6)
          </h2>
          <p className="text-xs text-slate-400">
            Haz clic en cualquier slot para editar Pokémon/ataques o pulsa 💎 Tera para simular la Teracristalización.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SLOTS.map((slot) => {
          const member = team.find((m) => m.slot === slot);
          return (
            <PokemonSlot
              key={slot}
              slot={slot}
              member={member}
              onEdit={onEditSlot}
              onToggleTera={onToggleTera}
              onRemove={onRemoveMember}
            />
          );
        })}
      </div>
    </section>
  );
}
