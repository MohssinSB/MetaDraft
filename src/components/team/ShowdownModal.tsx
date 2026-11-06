import { useState } from 'react';
import { exportToShowdown, hydrateShowdownTeam } from '@/core/showdownParser';
import type { TeamMember } from '@/types/pokemon';

interface ShowdownModalProps {
  team: readonly TeamMember[];
  targetLabel: string;
  onImport: (newTeam: TeamMember[]) => void;
  onClose: () => void;
}

export function ShowdownModal({
  team,
  targetLabel,
  onImport,
  onClose,
}: ShowdownModalProps) {
  const [text, setText] = useState(() => exportToShowdown(team));
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar automáticamente al portapapeles.');
    }
  };

  const handleImport = async () => {
    if (!text.trim()) {
      setError('Pega primero un equipo en formato Pokémon Showdown.');
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      const importedTeam = await hydrateShowdownTeam(text);
      if (importedTeam.length === 0) {
        setError('No se detectó ningún Pokémon válido en el texto.');
      } else {
        onImport(importedTeam);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al importar el equipo');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Formato Pokepaste — {targetLabel}
            </span>
            <h2 className="text-xl font-bold text-white">
              Importar / Exportar Pokémon Showdown
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cerrar ✕
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Copia este texto para llevar tu equipo a Pokémon Showdown, o pega aquí el equipo de un amigo/rival y pulsa <strong>Importar desde texto</strong> para cargarlo automáticamente con PokéAPI.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-800 bg-rose-950/40 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <textarea
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Garchomp @ Life Orb\nAbility: Rough Skin\nTera Type: Steel\n- Earthquake\n- Dragon Claw\n- Swords Dance\n- Protect`}
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            {copied ? '✓ ¡Copiado al portapapeles!' : 'Copiar texto actual'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isImporting}
              onClick={handleImport}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
            >
              {isImporting ? 'Consultando PokéAPI...' : `Importar en ${targetLabel}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
