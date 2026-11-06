import type { TeamMember } from '@/types/pokemon';

/**
 * Convierte un texto en formato Pokémon Showdown (Pokepaste) en una lista parcial de miembros del equipo.
 *
 * Ejemplo de formato Showdown:
 * Garchomp @ Life Orb
 * Ability: Rough Skin
 * Tera Type: Steel
 * - Earthquake
 * - Dragon Claw
 * - Swords Dance
 * - Protect
 */
export function parseShowdownTeam(rawPaste: string): Partial<TeamMember>[] {
  // TODO (Fase 4): Implementar el parser de bloques separados por doble salto de línea (\n\n)
  if (!rawPaste.trim()) return [];
  return [];
}

/**
 * Exporta el equipo actual al formato estándar de Pokémon Showdown.
 */
export function exportToShowdown(team: readonly TeamMember[]): string {
  // TODO (Fase 4): Formatear especie, habilidad y movimientos en texto plano
  return team
    .map((member) => {
      const movesText = member.moves.map((m) => `- ${m.name}`).join('\n');
      return `${member.speciesName}\nAbility: ${member.ability ?? 'None'}\n${movesText}`;
    })
    .join('\n\n');
}
