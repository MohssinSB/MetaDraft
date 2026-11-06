import { getEffectiveDefensiveTypes, getMoveEffectiveness, hasMoveStab } from '@/core/effectiveness';
import { TypeBadge } from '@/components/team/TypeBadge';
import type { EffectivenessMultiplier, Move, TeamMember } from '@/types/pokemon';

interface MatchupAnalyzerProps {
  myTeam: readonly TeamMember[];
  rivalTeam: readonly TeamMember[];
}

interface HitOption {
  attackerName: string;
  move: Move;
  multiplier: EffectivenessMultiplier;
  isStab: boolean;
}

function getSuperEffectiveHitsAgainstTarget(
  attackers: readonly TeamMember[],
  defender: TeamMember,
): HitOption[] {
  const defenderTypes = getEffectiveDefensiveTypes(defender);
  const hits: HitOption[] = [];

  for (const attacker of attackers) {
    for (const move of attacker.moves) {
      if (move.category === 'status') continue;
      const mult = getMoveEffectiveness(move, defenderTypes, defender.ability);
      if (mult >= 2) {
        hits.push({
          attackerName: attacker.speciesName,
          move,
          multiplier: mult,
          isStab: hasMoveStab(attacker, move.type),
        });
      }
    }
  }

  return hits.sort((a, b) => b.multiplier - a.multiplier || Number(b.isStab) - Number(a.isStab));
}

export function MatchupAnalyzer({ myTeam, rivalTeam }: MatchupAnalyzerProps) {
  if (myTeam.length === 0 || rivalTeam.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
        Añade al menos un Pokémon en <strong>Mi Equipo</strong> y otro en <strong>Equipo Rival</strong> para analizar el enfrentamiento directo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Cómo golpeas tú a cada Pokémon del Rival */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h2 className="text-lg font-bold text-white">
          Tus Respuestas Ofensivas contra el Equipo Rival
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Qué movimientos de tus Pokémon golpean de forma súper efectiva (2x o 4x) a cada Pokémon concreto de tu amigo (teniendo en cuenta sus dobles tipos, habilidad y Teratipo activo).
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {rivalTeam.map((rival) => {
            const effectiveTypes = getEffectiveDefensiveTypes(rival);
            const hits = getSuperEffectiveHitsAgainstTarget(myTeam, rival);

            return (
              <div
                key={rival.slot}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {rival.spriteUrl && (
                      <img
                        src={rival.spriteUrl}
                        alt={rival.speciesName}
                        className="h-11 w-11 object-contain"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{rival.speciesName}</h3>
                        {rival.isTeraActive && rival.teraType && (
                          <span className="rounded bg-fuchsia-950 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                            TERA ACTIVO
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {effectiveTypes.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      hits.length > 0
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {hits.length} opciones
                  </span>
                </div>

                {hits.length === 0 ? (
                  <p className="mt-3 text-xs font-medium text-rose-400">
                    ⚠️ Ninguno de tus movimientos actuales le hace daño súper efectivo (2x/4x).
                  </p>
                ) : (
                  <ul className="mt-3 space-y-1.5">
                    {hits.map((hit, idx) => (
                      <li
                        key={`${hit.attackerName}-${hit.move.id}-${idx}`}
                        className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300">{hit.attackerName}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-medium text-slate-200">{hit.move.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hit.isStab && (
                            <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                              STAB
                            </span>
                          )}
                          <TypeBadge type={hit.move.type} size="sm" />
                          <span
                            className={`rounded px-1.5 py-0.5 font-bold ${
                              hit.multiplier === 4
                                ? 'bg-rose-700 text-white'
                                : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                          >
                            {hit.multiplier}x
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Peligros del Rival contra tus Pokémon */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h2 className="text-lg font-bold text-white">
          Amenazas del Rival contra Tu Equipo
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Ataques conocidos del equipo rival que golpean 2x o 4x a tus Pokémon.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {myTeam.map((member) => {
            const threats = getSuperEffectiveHitsAgainstTarget(rivalTeam, member);
            return (
              <div
                key={member.slot}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <span className="font-bold text-white">{member.speciesName}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      threats.length === 0
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {threats.length} amenazas
                  </span>
                </div>

                {threats.length === 0 ? (
                  <p className="mt-2.5 text-xs text-emerald-400">
                    ✓ Ningún ataque registrado del rival le golpea súper efectivo.
                  </p>
                ) : (
                  <ul className="mt-2.5 space-y-1">
                    {threats.map((threat, idx) => (
                      <li
                        key={`${threat.attackerName}-${threat.move.id}-${idx}`}
                        className="flex items-center justify-between rounded bg-slate-900 px-2.5 py-1 text-xs"
                      >
                        <span className="text-slate-300">
                          <strong className="text-rose-300">{threat.attackerName}</strong> con{' '}
                          {threat.move.name}
                        </span>
                        <span className="font-bold text-rose-400">{threat.multiplier}x</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
