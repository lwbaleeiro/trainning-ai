/**
 * Cenários predefinidos para o simulador
 */

import { PHYSICAL_CONSTANTS } from './physics.js';

const { AU, SOLAR_MASS, EARTH_MASS } = PHYSICAL_CONSTANTS;

export const SCENARIOS = {
  'trisolaris': {
    name: 'Sistema Trisolaris',
    description: 'Inspirado no livro "O Problema dos Três Corpos" - três sóis com massas similares em configuração caótica.',
    bodies: [
      {
        id: 'sol1',
        name: 'Sol Voador',
        mass: SOLAR_MASS * 1.0,
        position: { x: AU * 2, y: 0, z: 0 },
        velocity: { x: 0, y: 12000, z: 3000 },
        color: '#ff6b6b',
      },
      {
        id: 'sol2',
        name: 'Sol Estável',
        mass: SOLAR_MASS * 1.2,
        position: { x: -AU, y: AU * 1.732, z: 0 },
        velocity: { x: -10000, y: -6000, z: -2000 },
        color: '#ffa94d',
      },
      {
        id: 'sol3',
        name: 'Sol Dançante',
        mass: SOLAR_MASS * 0.8,
        position: { x: -AU, y: -AU * 1.732, z: 0 },
        velocity: { x: 10000, y: -6000, z: -1000 },
        color: '#ffd43b',
      },
    ],
  },

  'figura-8': {
    name: 'Figura-8 (Órbita Estável)',
    description: 'Órbita periódica descoberta por Cris Moore - três corpos seguem um padrão de figura-8.',
    bodies: [
      {
        id: 'star1',
        name: 'Estrela Alpha',
        mass: SOLAR_MASS,
        position: { x: -0.97000436 * AU * 0.5, y: 0.24308753 * AU * 0.5, z: 0 },
        velocity: { x: 0.4662036850 * 30000, y: 0.4323657300 * 30000, z: 0 },
        color: '#ff6b6b',
      },
      {
        id: 'star2',
        name: 'Estrela Beta',
        mass: SOLAR_MASS,
        position: { x: 0.97000436 * AU * 0.5, y: -0.24308753 * AU * 0.5, z: 0 },
        velocity: { x: 0.4662036850 * 30000, y: 0.4323657300 * 30000, z: 0 },
        color: '#4dabf7',
      },
      {
        id: 'star3',
        name: 'Estrela Gamma',
        mass: SOLAR_MASS,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: -0.93240737 * 30000, y: -0.86473146 * 30000, z: 0 },
        color: '#ffd43b',
      },
    ],
  },

  'sistema-solar': {
    name: 'Sistema Solar Simplificado',
    description: 'Sol, Terra e Júpiter - mostra a influência gravitacional de Júpiter na órbita da Terra.',
    bodies: [
      {
        id: 'sun',
        name: 'Sol',
        mass: SOLAR_MASS,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        color: '#ffd43b',
      },
      {
        id: 'earth',
        name: 'Terra',
        mass: EARTH_MASS,
        position: { x: AU, y: 0, z: 0 },
        velocity: { x: 0, y: 29780, z: 0 },
        color: '#4dabf7',
      },
      {
        id: 'jupiter',
        name: 'Júpiter',
        mass: 1.898e27,
        position: { x: 5.2 * AU, y: 0, z: 0 },
        velocity: { x: 0, y: 13070, z: 0 },
        color: '#ffa94d',
      },
    ],
  },

  'binario': {
    name: 'Sistema Binário com Planeta',
    description: 'Duas estrelas orbitando uma à outra com um planeta distante.',
    bodies: [
      {
        id: 'star1',
        name: 'Estrela Alpha',
        mass: 0.5 * SOLAR_MASS,
        position: { x: 0.25 * AU, y: 0, z: 0 },
        velocity: { x: 0, y: 25000, z: 0 },
        color: '#ff6b6b',
      },
      {
        id: 'star2',
        name: 'Estrela Beta',
        mass: 0.5 * SOLAR_MASS,
        position: { x: -0.25 * AU, y: 0, z: 0 },
        velocity: { x: 0, y: -25000, z: 0 },
        color: '#ffa94d',
      },
      {
        id: 'planet',
        name: 'Planeta',
        mass: EARTH_MASS * 5,
        position: { x: 3 * AU, y: 0, z: 0 },
        velocity: { x: 0, y: 15000, z: 0 },
        color: '#51cf66',
      },
    ],
  },

  'caotico': {
    name: 'Sistema Caótico',
    description: 'Três estrelas em triângulo - demonstra a sensibilidade às condições iniciais.',
    bodies: (() => {
      const mass = SOLAR_MASS * 0.8;
      const distance = AU;
      const velocity = 15000;
      const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
      const colors = ['#ff6b6b', '#4dabf7', '#ffd43b'];
      const names = ['Alfa', 'Beta', 'Gama'];
      
      return angles.map((angle, i) => ({
        id: `star${i + 1}`,
        name: names[i],
        mass: mass * (1 + (i - 1) * 0.1),
        position: {
          x: distance * Math.cos(angle),
          y: distance * Math.sin(angle),
          z: 0,
        },
        velocity: {
          x: velocity * Math.cos(angle + Math.PI / 2),
          y: velocity * Math.sin(angle + Math.PI / 2),
          z: 0,
        },
        color: colors[i],
      }));
    })(),
  },

  'lagrange': {
    name: 'Pontos de Lagrange',
    description: 'Demonstra o ponto L4 de Lagrange com um asteroide troiano.',
    bodies: [
      {
        id: 'primary',
        name: 'Estrela Principal',
        mass: SOLAR_MASS,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        color: '#ffd43b',
      },
      {
        id: 'secondary',
        name: 'Planeta',
        mass: SOLAR_MASS * 0.001,
        position: { x: AU, y: 0, z: 0 },
        velocity: { x: 0, y: 29780, z: 0 },
        color: '#ffa94d',
      },
      {
        id: 'trojan',
        name: 'Asteroide Troiano',
        mass: EARTH_MASS,
        position: {
          x: AU * Math.cos(Math.PI / 3),
          y: AU * Math.sin(Math.PI / 3),
          z: 0,
        },
        velocity: {
          x: -29780 * Math.sin(Math.PI / 3),
          y: 29780 * Math.cos(Math.PI / 3),
          z: 0,
        },
        color: '#868e96',
      },
    ],
  },

  'custom': {
    name: 'Personalizado',
    description: 'Configure os corpos celestes manualmente.',
    bodies: [
      {
        id: 'body1',
        name: 'Corpo 1',
        mass: SOLAR_MASS,
        position: { x: AU, y: 0, z: 0 },
        velocity: { x: 0, y: 15000, z: 0 },
        color: '#ff6b6b',
      },
      {
        id: 'body2',
        name: 'Corpo 2',
        mass: SOLAR_MASS,
        position: { x: -AU, y: 0, z: 0 },
        velocity: { x: 0, y: -15000, z: 0 },
        color: '#4dabf7',
      },
      {
        id: 'body3',
        name: 'Corpo 3',
        mass: SOLAR_MASS * 0.5,
        position: { x: 0, y: AU * 1.5, z: 0 },
        velocity: { x: -10000, y: 0, z: 0 },
        color: '#ffd43b',
      },
    ],
  },
};
