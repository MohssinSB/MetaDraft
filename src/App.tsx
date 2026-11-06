import { DefensiveMatrix } from '@/components/analysis/DefensiveMatrix';
import { OffensiveCoverage } from '@/components/analysis/OffensiveCoverage';
import { TeamWarnings } from '@/components/analysis/TeamWarnings';
import { TeamGrid } from '@/components/team/TeamGrid';
import { useTeamCoverage } from '@/hooks/useTeamCoverage';

export function App() {
  const {
    team,
    removeMember,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
  } = useTeamCoverage();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              MetaDraft
            </h1>
            <p className="text-xs text-slate-400">
              Analizador de Cobertura Defensiva y Ofensiva para Torneos de Pokémon
            </p>
          </div>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Fase 1: Base Lista
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <TeamWarnings warnings={defensiveWarnings} />
        <TeamGrid team={team} onRemoveMember={removeMember} />
        <OffensiveCoverage summaries={offensiveSummary} />
        <DefensiveMatrix team={team} summaries={defensiveSummary} />
      </main>
    </div>
  );
}

export default App;
