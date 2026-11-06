import { TYPE_METADATA } from '@/data/typeChart';
import type { TypeDefensiveSummary } from '@/types/pokemon';

interface TeamWarningsProps {
  warnings: readonly TypeDefensiveSummary[];
}

export function TeamWarnings({ warnings }: TeamWarningsProps) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-3 text-xs text-emerald-300">
        Balance defensivo sólido: No se detectan tipos con debilidades críticas desprotegidas.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-4">
      <h3 className="text-sm font-bold text-amber-300">
        Amenazas Defensivas Detectadas ({warnings.length})
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2 text-xs text-amber-200">
        {warnings.map((w) => (
          <li
            key={w.attackType}
            className="rounded bg-amber-900/40 px-2.5 py-1 font-medium"
          >
            {TYPE_METADATA[w.attackType].labelEs}: {w.weakCount} débiles / {w.resistCount + w.immuneCount} resistencias
          </li>
        ))}
      </ul>
    </div>
  );
}
