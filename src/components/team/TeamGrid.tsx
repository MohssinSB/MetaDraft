import { PokemonSlot } from '@/components/team/PokemonSlot';
import type { TeamMember } from '@/types/pokemon';

interface TeamGridProps {
  team: readonly TeamMember[];
  onRemoveMember?: (slot: number) => void;
}

const SLOTS = [1, 2, 3, 4, 5, 6] as const;

export function TeamGrid({ team, onRemoveMember }: TeamGridProps) {
  return (
    <section aria-label="Equipo Pokémon">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Tu Equipo ({team.length}/6)</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SLOTS.map((slot) => {
          const member = team.find((m) => m.slot === slot);
          return (
            <PokemonSlot
              key={slot}
              slot={slot}
              member={member}
              onRemove={onRemoveMember}
            />
          );
        })}
      </div>
    </section>
  );
}
