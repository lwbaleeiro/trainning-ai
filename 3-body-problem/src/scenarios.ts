/**
 * Cenarios predefinidos para o problema de tres corpos
 */

import { CelestialBody, PHYSICAL_CONSTANTS } from './types';

const { AU, SOLAR_MASS, EARTH_MASS, YEAR_SECONDS } = PHYSICAL_CONSTANTS;

/**
 * Sistema de tres estrelas em configuracao figura-8
 * Esta e uma orbita periodica estavel descoberta por Cris Moore em 1993
 */
export function createFigureEightSystem(): CelestialBody[] {
  // Constantes para a orbita figura-8 (normalizadas)
  const mass = SOLAR_MASS;
  const scale = AU * 0.5;
  const velocityScale = 30000; // m/s

  return [
    {
      id: 'star1',
      name: 'Estrela Alpha',
      mass: mass,
      position: { x: -0.97000436 * scale, y: 0.24308753 * scale, z: 0 },
      velocity: { x: 0.4662036850 * velocityScale, y: 0.4323657300 * velocityScale, z: 0 },
      symbol: 'A',
      color: 'red',
    },
    {
      id: 'star2',
      name: 'Estrela Beta',
      mass: mass,
      position: { x: 0.97000436 * scale, y: -0.24308753 * scale, z: 0 },
      velocity: { x: 0.4662036850 * velocityScale, y: 0.4323657300 * velocityScale, z: 0 },
      symbol: 'B',
      color: 'blue',
    },
    {
      id: 'star3',
      name: 'Estrela Gamma',
      mass: mass,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: -0.93240737 * velocityScale, y: -0.86473146 * velocityScale, z: 0 },
      symbol: 'G',
      color: 'yellow',
    },
  ];
}

/**
 * Sistema Sol-Terra-Jupiter (simplificado)
 * Demonstra a influencia de Jupiter na orbita da Terra
 */
export function createSolarSystem(): CelestialBody[] {
  const jupiterMass = 1.898e27;
  const jupiterDistance = 5.2 * AU;
  const jupiterVelocity = 13070; // m/s

  const earthDistance = AU;
  const earthVelocity = 29780; // m/s

  return [
    {
      id: 'sun',
      name: 'Sol',
      mass: SOLAR_MASS,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      symbol: 'S',
      color: 'yellow',
    },
    {
      id: 'earth',
      name: 'Terra',
      mass: EARTH_MASS,
      position: { x: earthDistance, y: 0, z: 0 },
      velocity: { x: 0, y: earthVelocity, z: 0 },
      symbol: 'T',
      color: 'blue',
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      mass: jupiterMass,
      position: { x: jupiterDistance, y: 0, z: 0 },
      velocity: { x: 0, y: jupiterVelocity, z: 0 },
      symbol: 'J',
      color: 'orange',
    },
  ];
}

/**
 * Sistema binario com planeta
 * Um planeta orbitando um sistema de duas estrelas
 */
export function createBinaryWithPlanet(): CelestialBody[] {
  const starMass = 0.5 * SOLAR_MASS;
  const binaryDistance = 0.5 * AU;
  const binaryVelocity = 25000; // m/s

  const planetDistance = 3 * AU;
  const planetVelocity = 15000; // m/s

  return [
    {
      id: 'star1',
      name: 'Estrela Alpha',
      mass: starMass,
      position: { x: binaryDistance / 2, y: 0, z: 0 },
      velocity: { x: 0, y: binaryVelocity, z: 0 },
      symbol: 'A',
      color: 'red',
    },
    {
      id: 'star2',
      name: 'Estrela Beta',
      mass: starMass,
      position: { x: -binaryDistance / 2, y: 0, z: 0 },
      velocity: { x: 0, y: -binaryVelocity, z: 0 },
      symbol: 'B',
      color: 'orange',
    },
    {
      id: 'planet',
      name: 'Planeta',
      mass: EARTH_MASS * 5,
      position: { x: planetDistance, y: 0, z: 0 },
      velocity: { x: 0, y: planetVelocity, z: 0 },
      symbol: 'P',
      color: 'green',
    },
  ];
}

/**
 * Sistema caotico: tres estrelas com massas iguais em triangulo
 * Demonstra a natureza caotica do problema de tres corpos
 */
export function createChaoticSystem(): CelestialBody[] {
  const mass = SOLAR_MASS * 0.8;
  const distance = AU;
  const velocity = 15000; // m/s

  // Posicoes formando um triangulo equilatero
  const angle1 = 0;
  const angle2 = (2 * Math.PI) / 3;
  const angle3 = (4 * Math.PI) / 3;

  return [
    {
      id: 'star1',
      name: 'Alfa',
      mass: mass,
      position: {
        x: distance * Math.cos(angle1),
        y: distance * Math.sin(angle1),
        z: 0,
      },
      velocity: {
        x: velocity * Math.cos(angle1 + Math.PI / 2),
        y: velocity * Math.sin(angle1 + Math.PI / 2),
        z: 0,
      },
      symbol: '1',
      color: 'red',
    },
    {
      id: 'star2',
      name: 'Beta',
      mass: mass * 1.1, // Pequena diferenca para aumentar o caos
      position: {
        x: distance * Math.cos(angle2),
        y: distance * Math.sin(angle2),
        z: 0,
      },
      velocity: {
        x: velocity * Math.cos(angle2 + Math.PI / 2),
        y: velocity * Math.sin(angle2 + Math.PI / 2),
        z: 0,
      },
      symbol: '2',
      color: 'blue',
    },
    {
      id: 'star3',
      name: 'Gama',
      mass: mass * 0.9,
      position: {
        x: distance * Math.cos(angle3),
        y: distance * Math.sin(angle3),
        z: 0,
      },
      velocity: {
        x: velocity * Math.cos(angle3 + Math.PI / 2),
        y: velocity * Math.sin(angle3 + Math.PI / 2),
        z: 0,
      },
      symbol: '3',
      color: 'yellow',
    },
  ];
}

/**
 * Sistema Lagrange L4/L5
 * Configuracao estavel com massas desiguais
 */
export function createLagrangeSystem(): CelestialBody[] {
  const primaryMass = SOLAR_MASS;
  const secondaryMass = SOLAR_MASS * 0.001; // Muito menor que a primaria
  const trojaMass = EARTH_MASS;

  const orbitRadius = AU;
  const orbitVelocity = 29780; // m/s (aproximado)

  // Posicao L4 (60 graus a frente)
  const l4Angle = Math.PI / 3;

  return [
    {
      id: 'primary',
      name: 'Estrela Principal',
      mass: primaryMass,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      symbol: 'S',
      color: 'yellow',
    },
    {
      id: 'secondary',
      name: 'Estrela Secundaria',
      mass: secondaryMass,
      position: { x: orbitRadius, y: 0, z: 0 },
      velocity: { x: 0, y: orbitVelocity, z: 0 },
      symbol: 's',
      color: 'orange',
    },
    {
      id: 'trojan',
      name: 'Asteroide Troiano',
      mass: trojaMass,
      position: {
        x: orbitRadius * Math.cos(l4Angle),
        y: orbitRadius * Math.sin(l4Angle),
        z: 0,
      },
      velocity: {
        x: -orbitVelocity * Math.sin(l4Angle),
        y: orbitVelocity * Math.cos(l4Angle),
        z: 0,
      },
      symbol: 'T',
      color: 'gray',
    },
  ];
}

/**
 * Sistema Trisolaris (inspirado no livro "O Problema dos Tres Corpos")
 * Tres sois com massas similares em configuracao caotica
 */
export function createTrisolarisSystem(): CelestialBody[] {
  const mass1 = SOLAR_MASS * 1.0;
  const mass2 = SOLAR_MASS * 1.2;
  const mass3 = SOLAR_MASS * 0.8;

  const scale = AU * 2;

  return [
    {
      id: 'sol1',
      name: 'Sol Voador',
      mass: mass1,
      position: { x: scale, y: 0, z: 0 },
      velocity: { x: 0, y: 12000, z: 3000 },
      symbol: '1',
      color: 'red',
    },
    {
      id: 'sol2',
      name: 'Sol Estavel',
      mass: mass2,
      position: { x: -scale * 0.5, y: scale * 0.866, z: 0 },
      velocity: { x: -10000, y: -6000, z: -2000 },
      symbol: '2',
      color: 'orange',
    },
    {
      id: 'sol3',
      name: 'Sol Dancante',
      mass: mass3,
      position: { x: -scale * 0.5, y: -scale * 0.866, z: 0 },
      velocity: { x: 10000, y: -6000, z: -1000 },
      symbol: '3',
      color: 'yellow',
    },
  ];
}

/**
 * Lista de todos os cenarios disponiveis
 */
export const SCENARIOS = {
  'figura-8': {
    name: 'Figura-8 (Orbita Estavel)',
    description: 'Orbita periodica descoberta por Cris Moore - tres corpos seguem um padrao de figura-8',
    create: createFigureEightSystem,
  },
  'sistema-solar': {
    name: 'Sistema Solar Simplificado',
    description: 'Sol, Terra e Jupiter - mostra a influencia gravitacional de Jupiter',
    create: createSolarSystem,
  },
  'binario': {
    name: 'Sistema Binario com Planeta',
    description: 'Duas estrelas orbitando uma a outra com um planeta distante',
    create: createBinaryWithPlanet,
  },
  'caotico': {
    name: 'Sistema Caotico',
    description: 'Tres estrelas em triangulo - demonstra a sensibilidade a condicoes iniciais',
    create: createChaoticSystem,
  },
  'lagrange': {
    name: 'Pontos de Lagrange',
    description: 'Demonstra o ponto L4 de Lagrange com um asteroide troiano',
    create: createLagrangeSystem,
  },
  'trisolaris': {
    name: 'Sistema Trisolaris',
    description: 'Inspirado no livro "O Problema dos Tres Corpos" - tres sois com massas similares',
    create: createTrisolarisSystem,
  },
} as const;

export type ScenarioName = keyof typeof SCENARIOS;
