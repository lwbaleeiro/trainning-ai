/**
 * Simulador principal do Problema de Tres Corpos
 */

import {
  CelestialBody,
  SimulationConfig,
  SystemState,
  SimulationResult,
  IntegrationMethod,
  PHYSICAL_CONSTANTS,
} from './types';
import { GravityPhysics, Vector } from './physics';
import { Integrator, createIntegrator } from './integrators';

/**
 * Configuracao padrao da simulacao
 */
const DEFAULT_CONFIG: SimulationConfig = {
  timeStep: 3600, // 1 hora
  totalTime: PHYSICAL_CONSTANTS.YEAR_SECONDS, // 1 ano
  integrationMethod: 'rk4',
  gravitationalConstant: PHYSICAL_CONSTANTS.G,
  softening: 1e8, // 100.000 km
};

/**
 * Classe principal do simulador
 */
export class ThreeBodySimulator {
  private bodies: CelestialBody[];
  private config: SimulationConfig;
  private physics: GravityPhysics;
  private integrator: Integrator;
  private currentTime: number = 0;
  private history: SystemState[] = [];

  constructor(bodies: CelestialBody[], config: Partial<SimulationConfig> = {}) {
    if (bodies.length < 2) {
      throw new Error('Sao necessarios pelo menos 2 corpos para a simulacao');
    }

    this.bodies = bodies.map((b) => ({
      ...b,
      position: Vector.clone(b.position),
      velocity: Vector.clone(b.velocity),
    }));

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.physics = new GravityPhysics(
      this.config.gravitationalConstant,
      this.config.softening
    );
    this.integrator = createIntegrator(this.config.integrationMethod, this.physics);
  }

  /**
   * Obtem o estado atual do sistema
   */
  getState(): SystemState {
    const kineticEnergy = this.physics.calculateKineticEnergy(this.bodies);
    const potentialEnergy = this.physics.calculatePotentialEnergy(this.bodies);

    return {
      time: this.currentTime,
      bodies: this.bodies.map((b) => ({
        ...b,
        position: Vector.clone(b.position),
        velocity: Vector.clone(b.velocity),
      })),
      totalEnergy: kineticEnergy + potentialEnergy,
      kineticEnergy,
      potentialEnergy,
    };
  }

  /**
   * Executa um passo da simulacao
   */
  step(): SystemState {
    this.bodies = this.integrator.step(this.bodies, this.config.timeStep);
    this.currentTime += this.config.timeStep;
    return this.getState();
  }

  /**
   * Executa a simulacao completa
   */
  run(
    progressCallback?: (state: SystemState, progress: number) => void,
    storeHistory: boolean = true
  ): SimulationResult {
    const startRealTime = Date.now();
    const initialState = this.getState();
    const initialEnergy = initialState.totalEnergy;

    if (storeHistory) {
      this.history = [initialState];
    }

    const totalSteps = Math.ceil(this.config.totalTime / this.config.timeStep);
    let stepCount = 0;

    while (this.currentTime < this.config.totalTime) {
      const state = this.step();
      stepCount++;

      if (storeHistory) {
        // Armazenar a cada N passos para economizar memoria
        if (stepCount % 100 === 0 || this.currentTime >= this.config.totalTime) {
          this.history.push(state);
        }
      }

      if (progressCallback && stepCount % 1000 === 0) {
        const progress = this.currentTime / this.config.totalTime;
        progressCallback(state, progress);
      }
    }

    const finalState = this.getState();
    const elapsedRealTime = (Date.now() - startRealTime) / 1000;

    return {
      states: this.history,
      initialEnergy,
      finalEnergy: finalState.totalEnergy,
      energyDrift: Math.abs(
        (finalState.totalEnergy - initialEnergy) / initialEnergy
      ),
      totalSteps: stepCount,
      elapsedRealTime,
    };
  }

  /**
   * Executa simulacao em tempo real com callback
   */
  async runRealtime(
    stepsPerFrame: number,
    frameCallback: (state: SystemState) => void,
    frameDelay: number = 16 // ~60fps
  ): Promise<void> {
    while (this.currentTime < this.config.totalTime) {
      for (let i = 0; i < stepsPerFrame; i++) {
        this.step();
      }

      frameCallback(this.getState());
      await this.delay(frameDelay);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reseta a simulacao para o estado inicial
   */
  reset(newBodies?: CelestialBody[]): void {
    if (newBodies) {
      this.bodies = newBodies.map((b) => ({
        ...b,
        position: Vector.clone(b.position),
        velocity: Vector.clone(b.velocity),
      }));
    }
    this.currentTime = 0;
    this.history = [];
  }

  /**
   * Altera o metodo de integracao
   */
  setIntegrationMethod(method: IntegrationMethod): void {
    this.config.integrationMethod = method;
    this.integrator = createIntegrator(method, this.physics);
  }

  /**
   * Altera o passo de tempo
   */
  setTimeStep(dt: number): void {
    this.config.timeStep = dt;
  }

  /**
   * Obtem os corpos atuais
   */
  getBodies(): CelestialBody[] {
    return this.bodies.map((b) => ({
      ...b,
      position: Vector.clone(b.position),
      velocity: Vector.clone(b.velocity),
    }));
  }

  /**
   * Obtem o tempo atual da simulacao
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Obtem o historico da simulacao
   */
  getHistory(): SystemState[] {
    return this.history;
  }

  /**
   * Obtem a configuracao atual
   */
  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  /**
   * Calcula informacoes do sistema
   */
  getSystemInfo(): {
    centerOfMass: { x: number; y: number; z: number };
    angularMomentum: { x: number; y: number; z: number };
    totalMass: number;
  } {
    const centerOfMass = this.physics.calculateCenterOfMass(this.bodies);
    const angularMomentum = this.physics.calculateAngularMomentum(this.bodies);
    const totalMass = this.bodies.reduce((sum, b) => sum + b.mass, 0);

    return { centerOfMass, angularMomentum, totalMass };
  }
}

export { DEFAULT_CONFIG };
