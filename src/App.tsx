import { useState } from 'react';
import { DefensiveMatrix } from '@/components/analysis/DefensiveMatrix';
import { MatchupAnalyzer } from '@/components/analysis/MatchupAnalyzer';
import { OffensiveCoverage } from '@/components/analysis/OffensiveCoverage';
import { TeamWarnings } from '@/components/analysis/TeamWarnings';
import { PokemonEditorModal } from '@/components/team/PokemonEditorModal';
import { ShowdownModal } from '@/components/team/ShowdownModal';
import { TeamGrid } from '@/components/team/TeamGrid';
import { useTeamCoverage } from '@/hooks/useTeamCoverage';
import type { TeamMember } from '@/types/pokemon';

type ActiveView = 'my-team' | 'rival-team' | 'matchup';

export function App() {
  const {
    team,
    activeTeam,
    setTeam,
    rivalTeam,
    activeRivalTeam,
    setRivalTeam,
    maxSlots,
    toggleExtendedRoster,
    updateMember,
    toggleMemberTera,
    toggleMemberBan,
    removeMember,
    clearTeam,
    resetSampleTeam,
    defensiveSummary,
    defensiveWarnings,
    offensiveSummary,
    rivalDefensiveSummary,
    rivalDefensiveWarnings,
    rivalOffensiveSummary,
  } = useTeamCoverage();

  const [activeView, setActiveView] = useState<ActiveView>('my-team');
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [showShowdownModal, setShowShowdownModal] = useState(false);

  const isRivalMode = activeView === 'rival-team';
  const currentTeam = isRivalMode ? rivalTeam : team;
  const currentActiveTeam = isRivalMode ? activeRivalTeam : activeTeam;
  const currentDefensiveSummary = isRivalMode ? rivalDefensiveSummary : defensiveSummary;
  const currentDefensiveWarnings = isRivalMode ? rivalDefensiveWarnings : defensiveWarnings;
  const currentOffensiveSummary = isRivalMode ? rivalOffensiveSummary : offensiveSummary;

  const memberBeingEdited =
    editingSlot !== null ? currentTeam.find((m) => m.slot === editingSlot) : undefined;

  const handleSaveMember = (updated: TeamMember) => {
    updateMember(updated, isRivalMode);
    setEditingSlot(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              MetaDraft
            </h1>
            <p className="text-xs text-slate-400">
              Analizador de Cobertura y Enfrentamientos para Torneos de Pokémon (Modo Random & Baneos)
            </p>
          </div>

          <nav className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setActiveView('my-team')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeView === 'my-team'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mi Equipo ({activeTeam.length}/{maxSlots})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('rival-team')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeView === 'rival-team'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Equipo Rival ({activeRivalTeam.length}/{maxSlots})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('matchup')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeView === 'matchup'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚔️ Cara a Cara vs Rival
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {activeView === 'matchup' ? (
          <MatchupAnalyzer myTeam={activeTeam} rivalTeam={activeRivalTeam} />
        ) : (
          <>
            <TeamWarnings warnings={currentDefensiveWarnings} />
            <TeamGrid
              title={isRivalMode ? 'Equipo Rival' : 'Tu Equipo'}
              team={currentTeam}
              maxSlots={maxSlots}
              onToggleMaxSlots={toggleExtendedRoster}
              onEditSlot={(slot) => setEditingSlot(slot)}
              onToggleTera={(slot) => toggleMemberTera(slot, isRivalMode)}
              onToggleBan={(slot) => toggleMemberBan(slot, isRivalMode)}
              onRemoveMember={(slot) => removeMember(slot, isRivalMode)}
              onClearTeam={() => clearTeam(isRivalMode)}
              onResetSampleTeam={() => resetSampleTeam(isRivalMode)}
              onOpenShowdown={() => setShowShowdownModal(true)}
            />
            <OffensiveCoverage team={currentActiveTeam} summaries={currentOffensiveSummary} />
            <DefensiveMatrix team={currentActiveTeam} summaries={currentDefensiveSummary} />
          </>
        )}
      </main>

      {editingSlot !== null && (
        <PokemonEditorModal
          slot={editingSlot}
          initialMember={memberBeingEdited}
          onSave={handleSaveMember}
          onClose={() => setEditingSlot(null)}
        />
      )}

      {showShowdownModal && (
        <ShowdownModal
          team={currentTeam}
          targetLabel={isRivalMode ? 'Equipo Rival' : 'Mi Equipo'}
          onImport={(newTeam) => (isRivalMode ? setRivalTeam(newTeam) : setTeam(newTeam))}
          onClose={() => setShowShowdownModal(false)}
        />
      )}
    </div>
  );
}

export default App;
