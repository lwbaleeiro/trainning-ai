/**
 * Tipos e interfaces para o Simulador do Problema de Tres Corpos
 */

/**
 * Representa um vetor 3D para posicao e velocidade
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Representa um corpo celeste no espaco
 */
export interface CelestialBody {
  id: string;
  name: string;
  mass: number; // em kg
  position: Vector3D; // em metros
  velocity: Vector3D; // em metros/segundo
  color?: string; // para visualizacao
  symbol?: string; // simbolo ASCII para representacao
}

/**
 * Estado do sistema em um determinado momento
 */
export interface SystemState {
  time: number; // tempo em segundos
  bodies: CelestialBody[];
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

/**
 * Configuracoes da simulacao
 */
export interface SimulationConfig {
  timeStep: number; // passo de tempo em segundos
  totalTime: number; // tempo total de simulacao
  integrationMethod: IntegrationMethod;
  gravitationalConstant: number; // constante G
  softening: number; // fator de suavizacao para evitar singularidades
}

/**
 * Metodos de integracao numerica disponiveis
 */
export type IntegrationMethod = 'euler' | 'verlet' | 'rk4';

/**
 * Configuracoes de visualizacao
 */
export interface VisualizationConfig {
  width: number;
  height: number;
  scale: number; // escala de metros para caracteres
  centerX: number;
  centerY: number;
  showTrails: boolean;
  trailLength: number;
}

/**
 * Registro de historico de posicoes para trilhas
 */
export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Historico de um corpo celeste
 */
export interface BodyHistory {
  bodyId: string;
  positions: TrailPoint[];
}

/**
 * Resultado da simulacao
 */
export interface SimulationResult {
  states: SystemState[];
  initialEnergy: number;
  finalEnergy: number;
  energyDrift: number;
  totalSteps: number;
  elapsedRealTime: number;
}

/**
 * Constantes fisicas
 */
export const PHYSICAL_CONSTANTS = {
  G: 6.67430e-11, // Constante gravitacional (m^3 kg^-1 s^-2)
  AU: 1.496e11, // Unidade Astronomica em metros
  SOLAR_MASS: 1.989e30, // Massa do Sol em kg
  EARTH_MASS: 5.972e24, // Massa da Terra em kg
  DAY_SECONDS: 86400, // Segundos em um dia
  YEAR_SECONDS: 31557600, // Segundos em um ano
} as const;
