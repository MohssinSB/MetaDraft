import { describe, expect, it } from 'vitest';
import { getAttackEffectiveness } from '@/core/effectiveness';
import { analyzeTeamOffense } from '@/core/offensiveAnalyzer';
import type { TeamMember } from '@/types/pokemon';

describe('Motor de Efectividad de Tipos (effectiveness.ts)', () => {
  it('calcula eficacia simple (Agua vs Fuego = x2)', () => {
    expect(getAttackEffectiveness('water', ['fire'])).toBe(2);
  });

  it('calcula inmunidades naturales (Tierra vs Volador = x0)', () => {
    expect(getAttackEffectiveness('ground', ['flying'])).toBe(0);
  });

  it('calcula doble debilidad en Pokémon de doble tipo (Hielo vs Dragón/Tierra = x4)', () => {
    expect(getAttackEffectiveness('ice', ['dragon', 'ground'])).toBe(4);
  });

  it('calcula doble resistencia (Fuego vs Agua/Dragón = x0.25)', () => {
    expect(getAttackEffectiveness('fire', ['water', 'dragon'])).toBe(0.25);
  });

  it('compensa debilidad y resistencia a neutro (Fuego vs Planta/Agua = x1)', () => {
    expect(getAttackEffectiveness('fire', ['grass', 'water'])).toBe(1);
  });

  it('aplica modificadores de habilidad (Tierra vs Eléctrico/Agua con Levitación = x0)', () => {
    expect(getAttackEffectiveness('ground', ['electric', 'water'], 'levitate')).toBe(0);
  });

  it('aplica reducción por habilidad Sebo / Thick Fat (Hielo vs Planta/Veneno con thick-fat = x1)', () => {
    expect(getAttackEffectiveness('ice', ['grass', 'poison'], 'thick-fat')).toBe(1);
  });
});

describe('Analizador de Cobertura Ofensiva (offensiveAnalyzer.ts)', () => {
  const sampleTeam: TeamMember[] = [
    {
      slot: 1,
      speciesName: 'Garchomp',
      types: ['dragon', 'ground'],
      moves: [
        { id: 'earthquake', name: 'Terremoto', type: 'ground', category: 'physical', power: 100 },
        // Will-O-Wisp es tipo Fuego pero de categoría 'status', NO debe contar como cobertura ofensiva contra Planta
        { id: 'will-o-wisp', name: 'Fuego Fatuo', type: 'fire', category: 'status', power: null },
      ],
    },
  ];

  it('detecta cobertura súper efectiva con STAB (Tierra golpea x2 a Fuego, Eléctrico, Veneno, Roca y Acero)', () => {
    const report = analyzeTeamOffense(sampleTeam);
    const fireSummary = report.find((r) => r.targetType === 'fire');
    expect(fireSummary?.isCoveredSuperEffective).toBe(true);
    expect(fireSummary?.hasStabSuperEffective).toBe(true);
  });

  it('ignora los movimientos de estado (Status) al calcular la cobertura ofensiva', () => {
    const report = analyzeTeamOffense(sampleTeam);
    const grassSummary = report.find((r) => r.targetType === 'grass');
    expect(grassSummary?.isCoveredSuperEffective).toBe(false);
  });
});
