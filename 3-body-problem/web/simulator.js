/**
 * Classe do Simulador - Motor de física gravitacional
 */

import { Vector, PHYSICAL_CONSTANTS } from './physics.js';

export class Simulator {
  constructor(bodies, config = {}) {
    this.originalBodies = this.cloneBodies(bodies);
    this.bodies = this.cloneBodies(bodies);
    this.config = {
      timeStep: config.timeStep || 3600 * 6, // 6 horas
      integrationMethod: config.integrationMethod || 'rk4',
      G: PHYSICAL_CONSTANTS.G,
      softening: 1e8,
    };
    this.currentTime = 0;
    this.stepCount = 0;
    this.initialEnergy = this.calculateTotalEnergy();
  }

  cloneBodies(bodies) {
    return bodies.map(b => ({
      ...b,
      position: Vector.clone(b.position),
      velocity: Vector.clone(b.velocity),
    }));
  }

  // Calcula aceleração de um corpo devido a todos os outros
  calculateAcceleration(body, allBodies) {
    let acceleration = Vector.zero();
    const { G, softening } = this.config;

    for (const other of allBodies) {
      if (other.id === body.id) continue;

      const r = Vector.subtract(other.position, body.position);
      const distanceSquared = Vector.magnitudeSquared(r) + softening * softening;
      const distance = Math.sqrt(distanceSquared);

      if (distance === 0) continue;

      const forceMagnitude = (G * other.mass) / distanceSquared;
      const direction = Vector.scale(r, 1 / distance);
      acceleration = Vector.add(acceleration, Vector.scale(direction, forceMagnitude));
    }

    return acceleration;
  }

  // Integrador Euler (simples, menos preciso)
  stepEuler(dt) {
    const accelerations = this.bodies.map(body => 
      this.calculateAcceleration(body, this.bodies)
    );

    this.bodies = this.bodies.map((body, i) => {
      const newVelocity = Vector.add(body.velocity, Vector.scale(accelerations[i], dt));
      const newPosition = Vector.add(body.position, Vector.scale(body.velocity, dt));
      return { ...body, position: newPosition, velocity: newVelocity };
    });
  }

  // Integrador Velocity Verlet (boa conservação de energia)
  stepVerlet(dt) {
    const currentAccelerations = this.bodies.map(body =>
      this.calculateAcceleration(body, this.bodies)
    );

    // Atualizar posições
    const newBodies = this.bodies.map((body, i) => {
      const a = currentAccelerations[i];
      const newPosition = Vector.add(
        Vector.add(body.position, Vector.scale(body.velocity, dt)),
        Vector.scale(a, 0.5 * dt * dt)
      );
      return { ...body, position: newPosition };
    });

    // Calcular novas acelerações
    const newAccelerations = newBodies.map(body =>
      this.calculateAcceleration(body, newBodies)
    );

    // Atualizar velocidades
    this.bodies = newBodies.map((body, i) => {
      const avgAccel = Vector.scale(
        Vector.add(currentAccelerations[i], newAccelerations[i]),
        0.5
      );
      const newVelocity = Vector.add(this.bodies[i].velocity, Vector.scale(avgAccel, dt));
      return { ...body, velocity: newVelocity };
    });
  }

  // Integrador Runge-Kutta 4 (mais preciso)
  stepRK4(dt) {
    const n = this.bodies.length;
    
    const bodiesToState = (bodies) => {
      const state = new Float64Array(n * 6);
      bodies.forEach((body, i) => {
        const offset = i * 6;
        state[offset] = body.position.x;
        state[offset + 1] = body.position.y;
        state[offset + 2] = body.position.z;
        state[offset + 3] = body.velocity.x;
        state[offset + 4] = body.velocity.y;
        state[offset + 5] = body.velocity.z;
      });
      return state;
    };

    const stateToBodies = (state, origBodies) => {
      return origBodies.map((body, i) => {
        const offset = i * 6;
        return {
          ...body,
          position: { x: state[offset], y: state[offset + 1], z: state[offset + 2] },
          velocity: { x: state[offset + 3], y: state[offset + 4], z: state[offset + 5] },
        };
      });
    };

    const derivative = (bodies) => {
      const deriv = new Float64Array(n * 6);
      bodies.forEach((body, i) => {
        const offset = i * 6;
        const accel = this.calculateAcceleration(body, bodies);
        deriv[offset] = body.velocity.x;
        deriv[offset + 1] = body.velocity.y;
        deriv[offset + 2] = body.velocity.z;
        deriv[offset + 3] = accel.x;
        deriv[offset + 4] = accel.y;
        deriv[offset + 5] = accel.z;
      });
      return deriv;
    };

    const addScaledState = (state, deriv, scale) => {
      const result = new Float64Array(state.length);
      for (let i = 0; i < state.length; i++) {
        result[i] = state[i] + deriv[i] * scale;
      }
      return result;
    };

    const state = bodiesToState(this.bodies);
    const k1 = derivative(this.bodies);
    
    const state2 = addScaledState(state, k1, dt / 2);
    const k2 = derivative(stateToBodies(state2, this.bodies));
    
    const state3 = addScaledState(state, k2, dt / 2);
    const k3 = derivative(stateToBodies(state3, this.bodies));
    
    const state4 = addScaledState(state, k3, dt);
    const k4 = derivative(stateToBodies(state4, this.bodies));

    const finalState = new Float64Array(state.length);
    for (let i = 0; i < state.length; i++) {
      finalState[i] = state[i] + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6;
    }

    this.bodies = stateToBodies(finalState, this.bodies);
  }

  // Executa um passo da simulação
  step() {
    const dt = this.config.timeStep;
    
    switch (this.config.integrationMethod) {
      case 'euler':
        this.stepEuler(dt);
        break;
      case 'verlet':
        this.stepVerlet(dt);
        break;
      case 'rk4':
      default:
        this.stepRK4(dt);
        break;
    }

    this.currentTime += dt;
    this.stepCount++;
  }

  // Calcula energia cinética total
  calculateKineticEnergy() {
    return this.bodies.reduce((total, body) => {
      const vSquared = Vector.magnitudeSquared(body.velocity);
      return total + 0.5 * body.mass * vSquared;
    }, 0);
  }

  // Calcula energia potencial gravitacional
  calculatePotentialEnergy() {
    const { G } = this.config;
    let potential = 0;

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const distance = Vector.distance(this.bodies[i].position, this.bodies[j].position);
        if (distance > 0) {
          potential -= (G * this.bodies[i].mass * this.bodies[j].mass) / distance;
        }
      }
    }

    return potential;
  }

  // Calcula energia total
  calculateTotalEnergy() {
    return this.calculateKineticEnergy() + this.calculatePotentialEnergy();
  }

  // Calcula centro de massa
  calculateCenterOfMass() {
    let totalMass = 0;
    let weightedPos = Vector.zero();

    for (const body of this.bodies) {
      totalMass += body.mass;
      weightedPos = Vector.add(weightedPos, Vector.scale(body.position, body.mass));
    }

    return totalMass > 0 ? Vector.scale(weightedPos, 1 / totalMass) : Vector.zero();
  }

  // Obtém estado atual
  getState() {
    const kineticEnergy = this.calculateKineticEnergy();
    const potentialEnergy = this.calculatePotentialEnergy();
    const totalEnergy = kineticEnergy + potentialEnergy;
    const energyDrift = this.initialEnergy !== 0 
      ? Math.abs((totalEnergy - this.initialEnergy) / this.initialEnergy) 
      : 0;

    return {
      time: this.currentTime,
      bodies: this.bodies,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      energyDrift,
      stepCount: this.stepCount,
      centerOfMass: this.calculateCenterOfMass(),
    };
  }

  // Reinicia a simulação
  reset(newBodies = null) {
    this.bodies = this.cloneBodies(newBodies || this.originalBodies);
    if (newBodies) {
      this.originalBodies = this.cloneBodies(newBodies);
    }
    this.currentTime = 0;
    this.stepCount = 0;
    this.initialEnergy = this.calculateTotalEnergy();
  }

  // Atualiza configuração
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  // Atualiza um corpo específico
  updateBody(id, updates) {
    const index = this.bodies.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bodies[index] = { ...this.bodies[index], ...updates };
      this.originalBodies[index] = { ...this.originalBodies[index], ...updates };
    }
  }

  // Adiciona um novo corpo
  addBody(body) {
    this.bodies.push({ ...body, position: Vector.clone(body.position), velocity: Vector.clone(body.velocity) });
    this.originalBodies.push({ ...body, position: Vector.clone(body.position), velocity: Vector.clone(body.velocity) });
  }

  // Remove um corpo
  removeBody(id) {
    this.bodies = this.bodies.filter(b => b.id !== id);
    this.originalBodies = this.originalBodies.filter(b => b.id !== id);
  }
}
