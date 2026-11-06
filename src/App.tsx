import { useState } from 'react';
import { DefensiveMatrix } from '@/components/analysis/DefensiveMatrix';
import { OffensiveCoverage } from '@/components/analysis/OffensiveCoverage';
import { TeamWarnings } from '@/components/analysis/TeamWarnings';
import { PokemonEditorModal } from '@/components/team/PokemonEditorModal';
import { TeamGrid } from '@/components/team/TeamGrid';
import { useTeamCoverage } from '@/hooks/useTeamCoverage';
import type { TeamMember } from '@/types/pokemon';

export function App() {
  const {
    team,
    updateMember,
    removeMember,
    clearTeam,
    resetSampleTeam,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
  } = useTeamCoverage();

  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const memberBeingEdited =
    editingSlot !== null ? team.find((m) => m.slot === editingSlot) : undefined;

  const handleSaveMember = (updated: TeamMember) => {
    updateMember(updated);
    setEditingSlot(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              MetaDraft
            </h1>
            <p className="text-xs text-slate-400">
              Analizador de Cobertura Defensiva y Ofensiva para Torneos de Pokémon (Modo Random)
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Constructor Activo
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <TeamWarnings warnings={defensiveWarnings} />
        <TeamGrid
          team={team}
          onEditSlot={(slot) => setEditingSlot(slot)}
          onRemoveMember={removeMember}
          onClearTeam={clearTeam}
          onResetSampleTeam={resetSampleTeam}
        />
        <OffensiveCoverage summaries={offensiveSummary} />
        <DefensiveMatrix team={team} summaries={defensiveSummary} />
      </main>

      {editingSlot !== null && (
        <PokemonEditorModal
          slot={editingSlot}
          initialMember={memberBeingEdited}
          onSave={handleSaveMember}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  );
}

export default App;
