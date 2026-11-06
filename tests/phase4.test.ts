import { describe, expect, it } from 'vitest';
import {
  getEffectiveDefensiveTypes,
  getMoveEffectiveness,
  hasMoveStab,
} from '@/core/effectiveness';
import { exportToShowdown, parseShowdownTeam } from '@/core/showdownParser';
import type { Move, TeamMember } from '@/types/pokemon';

describe('Fase 4: Movimientos Especiales y Teracristalización', () => {
  const freezeDry: Move = {
    id: 'freeze-dry',
    name: 'Liofilización',
    type: 'ice',
    category: 'special',
    power: 70,
  };

  const thousandArrows: Move = {
    id: 'thousand-arrows',
    name: 'Mil Flechas',
    type: 'ground',
    category: 'physical',
    power: 90,
  };

  const flyingPress: Move = {
    id: 'flying-press',
    name: 'Plancha Voladora',
    type: 'fighting',
    category: 'physical',
    power: 100,
  };

  it('Liofilización (freeze-dry) hace x2 a Agua y x4 a Agua/Tierra', () => {
    expect(getMoveEffectiveness(freezeDry, ['water'])).toBe(2);
    expect(getMoveEffectiveness(freezeDry, ['water', 'ground'])).toBe(4);
  });

  it('Mil Flechas (thousand-arrows) golpea neutro (x1) a Pokémon de tipo Volador', () => {
    expect(getMoveEffectiveness(thousandArrows, ['flying'])).toBe(1);
    expect(getMoveEffectiveness(thousandArrows, ['fire', 'flying'])).toBe(1);
  });

  it('Plancha Voladora (flying-press) combina Lucha y Volador', () => {
    // Contra Normal (x2 por Lucha, x1 por Volador) = x2
    expect(getMoveEffectiveness(flyingPress, ['normal'])).toBe(2);
    // Contra Planta (x1 por Lucha, x2 por Volador) = x2
    expect(getMoveEffectiveness(flyingPress, ['grass'])).toBe(2);
  });

  it('Teracristalización cambia el tipo defensivo al Teratipo y conserva/añade STAB', () => {
    const garchomp: TeamMember = {
      slot: 1,
      speciesName: 'Garchomp',
      types: ['dragon', 'ground'],
      teraType: 'steel',
      isTeraActive: true,
      moves: [],
    };

    expect(getEffectiveDefensiveTypes(garchomp)).toEqual(['steel']);
    // Conserva STAB de sus tipos originales y gana STAB de su Teratipo activo
    expect(hasMoveStab(garchomp, 'dragon')).toBe(true);
    expect(hasMoveStab(garchomp, 'steel')).toBe(true);
    expect(hasMoveStab(garchomp, 'fire')).toBe(false);
  });
});

describe('Fase 4: Importador y Exportador de Pokémon Showdown', () => {
  it('parsea bloques estándar de Pokémon Showdown (Pokepaste)', () => {
    const rawPaste = `
Chompy (Garchomp) (M) @ Life Orb
Ability: Rough Skin
Tera Type: Steel
- Earthquake
- Dragon Claw
- Swords Dance
- Protect

Rotom-Wash @ Leftovers
Ability: Levitate
Tera Type: Fairy
- Hydro Pump
- Volt Switch
    `;

    const parsed = parseShowdownTeam(rawPaste);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].speciesName).toBe('Garchomp');
    expect(parsed[0].speciesSlug).toBe('garchomp');
    expect(parsed[0].abilitySlug).toBe('rough-skin');
    expect(parsed[0].teraType).toBe('steel');
    expect(parsed[0].moveSlugs).toEqual(['earthquake', 'dragon-claw', 'swords-dance', 'protect']);

    expect(parsed[1].speciesSlug).toBe('rotom-wash');
    expect(parsed[1].abilitySlug).toBe('levitate');
  });

  it('exporta un equipo al formato de texto de Pokémon Showdown', () => {
    const team: TeamMember[] = [
      {
        slot: 1,
        speciesName: 'Heatran',
        types: ['fire', 'steel'],
        ability: 'flash-fire',
        teraType: 'grass',
        moves: [
          { id: 'magma-storm', name: 'Lluvia Ígnea', type: 'fire', category: 'special', power: 100 },
          { id: 'earth-power', name: 'Tierra Viva', type: 'ground', category: 'special', power: 90 },
        ],
      },
    ];

    const exported = exportToShowdown(team);
    expect(exported).toContain('Heatran');
    expect(exported).toContain('Ability: Flash Fire');
    expect(exported).toContain('Tera Type: Grass');
    expect(exported).toContain('- Magma Storm');
    expect(exported).toContain('- Earth Power');
  });
});
