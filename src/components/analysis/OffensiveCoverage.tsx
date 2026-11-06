import { useMemo, useState } from 'react';
import { analyzeTeamOffense } from '@/core/offensiveAnalyzer';
import { TypeBadge } from '@/components/team/TypeBadge';
import type { TeamMember, TypeOffensiveSummary } from '@/types/pokemon';

interface OffensiveCoverageProps {
  team: readonly TeamMember[];
  summaries: readonly TypeOffensiveSummary[];
}

export function OffensiveCoverage({ team, summaries }: OffensiveCoverageProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | 'all'>('all');

  const selectedMember =
    selectedSlot === 'all' ? undefined : team.find((m) => m.slot === selectedSlot);

  // Si el usuario filtra por un Pokémon concreto (y ese Pokémon sigue en el equipo),
  // calculamos la cobertura solo para ese Pokémon; si no, mostramos la del equipo completo.
  const activeSummaries = useMemo(() => {
    if (!selectedMember) return summaries;
    return analyzeTeamOffense([selectedMember]);
  }, [selectedMember, summaries]);

  const coveredCount = activeSummaries.filter((s) => s.isCoveredSuperEffective).length;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            Cobertura Ofensiva{' '}
            {selectedMember ? `de ${selectedMember.speciesName}` : '(Equipo Completo)'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Tipos a los que{' '}
            {selectedMember ? selectedMember.speciesName : 'tu equipo'} golpea de forma súper
            efectiva (x2) con ataques físicos o especiales.
          </p>
        </div>
        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-bold text-emerald-400">
          {coveredCount} / 18 tipos cubiertos
        </span>
      </div>

      {/* Selector para ver la cobertura de todo el equipo o de un Pokémon individual */}
      {team.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800 pt-3">
          <span className="mr-1 text-xs font-medium text-slate-400">Filtrar por:</span>
          <button
            type="button"
            onClick={() => setSelectedSlot('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              !selectedMember
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todo el Equipo ({team.length})
          </button>
          {team.map((member) => {
            const isSelected = selectedMember?.slot === member.slot;
            return (
              <button
                key={member.slot}
                type="button"
                onClick={() => setSelectedSlot(member.slot)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {member.spriteUrl && (
                  <img
                    src={member.spriteUrl}
                    alt={member.speciesName}
                    className="h-4 w-4 object-contain"
                  />
                )}
                <span>{member.speciesName}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
        {activeSummaries.map((item) => (
          <div
            key={item.targetType}
            className={`flex flex-col justify-between rounded-lg border p-2.5 text-center ${
              item.isCoveredSuperEffective
                ? 'border-emerald-800/60 bg-emerald-950/20'
                : 'border-rose-900/50 bg-rose-950/20 opacity-75'
            }`}
          >
            <div className="flex flex-col items-center">
              <TypeBadge type={item.targetType} size="sm" />
              <div className="mt-1.5 text-xs">
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

            {item.coveredBy.length > 0 && (
              <ul className="mt-2 space-y-0.5 border-t border-emerald-900/40 pt-1.5 text-left text-[10px] text-slate-300">
                {item.coveredBy.map((c, idx) => (
                  <li
                    key={`${c.slot}-${c.moveName}-${idx}`}
                    className="truncate"
                    title={`${c.speciesName}: ${c.moveName}${c.isStab ? ' (STAB)' : ''}`}
                  >
                    {selectedMember ? (
                      <span className="font-medium text-emerald-200">{c.moveName}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-white">{c.speciesName}</span>:{' '}
                        <span className="text-slate-400">{c.moveName}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
