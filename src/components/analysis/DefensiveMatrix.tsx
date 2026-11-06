import { TypeBadge } from '@/components/team/TypeBadge';
import type { EffectivenessMultiplier, TeamMember, TypeDefensiveSummary } from '@/types/pokemon';

interface DefensiveMatrixProps {
  team: readonly TeamMember[];
  summaries: readonly TypeDefensiveSummary[];
}

function formatMultiplier(mult: EffectivenessMultiplier): { label: string; className: string } {
  switch (mult) {
    case 0:
      return { label: '0', className: 'bg-slate-800 text-slate-300 font-bold' };
    case 0.25:
      return { label: '¼', className: 'bg-emerald-950/80 text-emerald-300 font-semibold' };
    case 0.5:
      return { label: '½', className: 'bg-emerald-900/40 text-emerald-400' };
    case 1:
      return { label: '1', className: 'text-slate-600' };
    case 2:
      return { label: '2x', className: 'bg-rose-900/50 text-rose-300 font-semibold' };
    case 4:
      return { label: '4x', className: 'bg-rose-700 text-white font-bold' };
  }
}

export function DefensiveMatrix({ team, summaries }: DefensiveMatrixProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      <h2 className="text-lg font-bold text-white">Matriz de Cobertura Defensiva</h2>
      <p className="mt-1 text-xs text-slate-400">
        Multiplicador de daño que recibe cada Pokémon de tu equipo frente a los 18 tipos de ataque.
      </p>

      {team.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">
          Añade al menos un Pokémon a tu equipo para visualizar la matriz defensiva.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-3">Ataque Entrante</th>
                {team.map((m) => (
                  <th key={m.slot} className="px-2 py-2 text-center font-semibold text-slate-200">
                    {m.speciesName}
                  </th>
                ))}
                <th className="px-2 py-2 text-center text-rose-400">Débiles</th>
                <th className="px-2 py-2 text-center text-emerald-400">Resisten</th>
                <th className="px-2 py-2 text-center text-slate-300">Inmunes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summaries.map((row) => (
                <tr key={row.attackType} className="hover:bg-slate-800/30">
                  <td className="py-1.5 pr-3">
                    <TypeBadge type={row.attackType} size="sm" />
                  </td>
                  {team.map((m) => {
                    const mult = row.memberMultipliers[m.slot] ?? 1;
                    const badge = formatMultiplier(mult);
                    return (
                      <td key={m.slot} className="px-2 py-1.5 text-center">
                        <span className={`inline-block w-8 rounded py-0.5 text-center ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center font-semibold text-rose-400">
                    {row.weakCount}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-emerald-400">
                    {row.resistCount}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-slate-300">
                    {row.immuneCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
