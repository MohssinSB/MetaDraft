import { TypeBadge } from '@/components/team/TypeBadge';
import type { TypeOffensiveSummary } from '@/types/pokemon';

interface OffensiveCoverageProps {
  summaries: readonly TypeOffensiveSummary[];
}

export function OffensiveCoverage({ summaries }: OffensiveCoverageProps) {
  const coveredCount = summaries.filter((s) => s.isCoveredSuperEffective).length;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Cobertura Ofensiva (Movimientos)</h2>
          <p className="mt-1 text-xs text-slate-400">
            Tipos a los que tu equipo golpea de forma súper efectiva (x2) con ataques físicos o especiales.
          </p>
        </div>
        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-bold text-emerald-400">
          {coveredCount} / 18 tipos cubiertos
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
        {summaries.map((item) => (
          <div
            key={item.targetType}
            className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center ${
              item.isCoveredSuperEffective
                ? 'border-emerald-800/60 bg-emerald-950/20'
                : 'border-rose-900/50 bg-rose-950/20 opacity-75'
            }`}
          >
            <TypeBadge type={item.targetType} size="sm" />
            <div className="mt-2 text-xs">
              {item.isCoveredSuperEffective ? (
                <span className="font-semibold text-emerald-300">
                  {item.superEffectiveMoveCount} mov{item.superEffectiveMoveCount > 1 ? 's' : ''}
                  {item.hasStabSuperEffective ? ' (STAB)' : ''}
                </span>
              ) : (
                <span className="font-medium text-rose-400">Sin cubrir (x2)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
