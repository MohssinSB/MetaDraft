import { TYPE_METADATA } from '@/data/typeChart';
import type { PokemonType } from '@/types/pokemon';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const meta = TYPE_METADATA[type];

  return (
    <span
      style={{ backgroundColor: meta.colorHex }}
      className={`inline-flex items-center justify-center rounded font-semibold uppercase tracking-wider text-white shadow-sm ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {meta.labelEs}
    </span>
  );
}
