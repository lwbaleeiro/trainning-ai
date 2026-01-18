/**
 * Exportacoes publicas do Simulador do Problema de Tres Corpos
 */

// Tipos
export type {
  Vector3D,
  CelestialBody,
  SystemState,
  SimulationConfig,
  IntegrationMethod,
  VisualizationConfig,
  SimulationResult,
  TrailPoint,
  BodyHistory,
} from './types';

export { PHYSICAL_CONSTANTS } from './types';

// Fisica
export { Vector, GravityPhysics } from './physics';

// Integradores
export type { Integrator } from './integrators';
export {
  EulerIntegrator,
  VerletIntegrator,
  RK4Integrator,
  createIntegrator,
} from './integrators';

// Simulador
export { ThreeBodySimulator, DEFAULT_CONFIG } from './simulator';

// Visualizacao
export { ASCIIRenderer, renderProgressBar, formatDuration } from './visualization';

// Cenarios
export {
  SCENARIOS,
  createFigureEightSystem,
  createSolarSystem,
  createBinaryWithPlanet,
  createChaoticSystem,
  createLagrangeSystem,
  createTrisolarisSystem,
} from './scenarios';
export type { ScenarioName } from './scenarios';
