import { ABILITY_MODIFIERS } from '@/data/abilityModifiers';
import { ALL_TYPES, TYPE_METADATA } from '@/data/typeChart';
import { fetchMoveByName, fetchPokemonByName, formatSlugToDisplayName } from '@/services/pokeapi';
import type { Move, PokemonType, TeamMember } from '@/types/pokemon';

export interface ParsedShowdownSet {
  speciesName: string;
  speciesSlug: string;
  abilitySlug?: string;
  teraType?: PokemonType;
  moveSlugs: string[];
}

function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function parseTypeString(raw: string): PokemonType | undefined {
  const cleaned = raw.trim().toLowerCase();
  const byId = ALL_TYPES.find((t) => t === cleaned);
  if (byId) return byId;

  const byEs = ALL_TYPES.find((t) => TYPE_METADATA[t].labelEs.toLowerCase() === cleaned);
  return byEs;
}

/**
 * Extrae el nombre de la especie de la primera línea de un bloque de Pokémon Showdown.
 * Soporta formatos como:
 * - "Garchomp @ Life Orb"
 * - "Chompy (Garchomp) (M) @ Choice Scarf"
 * - "Rotom-Wash (F)"
 */
function extractSpeciesFromHeader(headerLine: string): string {
  const withoutItem = headerLine.split('@')[0].trim();
  const withoutGender = withoutItem.replace(/\s*\([MF]\)\s*$/i, '').trim();
  const parenMatch = withoutGender.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) {
    return parenMatch[1].trim();
  }
  return withoutGender;
}

/**
 * Convierte un texto en formato Pokémon Showdown (Pokepaste) en una lista estructurada de sets.
 */
export function parseShowdownTeam(rawPaste: string): ParsedShowdownSet[] {
  const trimmed = rawPaste.trim();
  if (!trimmed) return [];

  const blocks = trimmed.split(/\r?\n\s*\r?\n/).filter((b) => b.trim().length > 0);
  const parsedSets: ParsedShowdownSet[] = [];

  for (const block of blocks.slice(0, 8)) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const speciesName = extractSpeciesFromHeader(lines[0]);
    const speciesSlug = toSlug(speciesName);
    let abilitySlug: string | undefined;
    let teraType: PokemonType | undefined;
    const moveSlugs: string[] = [];

    for (const line of lines.slice(1)) {
      if (/^ability:/i.test(line)) {
        const rawAb = line.replace(/^ability:\s*/i, '');
        abilitySlug = toSlug(rawAb);
      } else if (/^tera\s*type:/i.test(line)) {
        const rawTera = line.replace(/^tera\s*type:\s*/i, '');
        teraType = parseTypeString(rawTera);
      } else if (line.startsWith('-')) {
        const rawMove = line.replace(/^-\s*/, '').split('/')[0].trim();
        if (rawMove && moveSlugs.length < 4) {
          moveSlugs.push(toSlug(rawMove));
        }
      }
    }

    parsedSets.push({
      speciesName,
      speciesSlug,
      abilitySlug,
      teraType,
      moveSlugs,
    });
  }

  return parsedSets;
}

/**
 * Construye un equipo completo de `TeamMember[]` consultando PokéAPI para cada set de Showdown.
 * Si algún Pokémon o ataque es personalizado y no existe en PokéAPI, usa valores seguros de respaldo.
 */
export async function hydrateShowdownTeam(rawPaste: string): Promise<TeamMember[]> {
  const parsedSets = parseShowdownTeam(rawPaste);
  const hydrated: TeamMember[] = [];

  for (let i = 0; i < parsedSets.length; i++) {
    const set = parsedSets[i];
    const slot = i + 1;

    let types: [PokemonType] | [PokemonType, PokemonType] = ['normal'];
    let spriteUrl: string | null = null;
    let resolvedAbility = set.abilitySlug && set.abilitySlug in ABILITY_MODIFIERS ? set.abilitySlug : undefined;

    try {
      const pokeData = await fetchPokemonByName(set.speciesSlug);
      types = pokeData.types;
      spriteUrl = pokeData.spriteUrl;
      if (!resolvedAbility) {
        const matchingAb = pokeData.abilities.find((ab) => ab in ABILITY_MODIFIERS);
        if (matchingAb) resolvedAbility = matchingAb;
      }
    } catch {
      // Si el nombre no existe en PokéAPI, mantenemos el nombre del texto con tipo Normal editable
    }

    const moves: Move[] = [];
    for (const moveSlug of set.moveSlugs) {
      try {
        const moveData = await fetchMoveByName(moveSlug);
        moves.push(moveData);
      } catch {
        moves.push({
          id: moveSlug,
          name: formatSlugToDisplayName(moveSlug),
          type: 'normal',
          category: 'physical',
          power: 80,
        });
      }
    }

    hydrated.push({
      slot,
      speciesName: set.speciesName,
      types,
      ability: resolvedAbility,
      teraType: set.teraType,
      isTeraActive: false,
      spriteUrl,
      moves,
    });
  }

  return hydrated;
}

/**
 * Exporta el equipo actual al formato estándar de Pokémon Showdown.
 */
export function exportToShowdown(team: readonly TeamMember[]): string {
  return team
    .map((member) => {
      const lines: string[] = [member.speciesName];
      if (member.ability) {
        lines.push(`Ability: ${formatSlugToDisplayName(member.ability)}`);
      }
      if (member.teraType) {
        lines.push(`Tera Type: ${formatSlugToDisplayName(member.teraType)}`);
      }
      for (const move of member.moves) {
        lines.push(`- ${formatSlugToDisplayName(move.id)}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}
