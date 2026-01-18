/**
 * Integradores numericos para a simulacao
 */

import { CelestialBody, Vector3D, IntegrationMethod } from './types';
import { Vector, GravityPhysics } from './physics';

/**
 * Interface para integradores
 */
export interface Integrator {
  step(bodies: CelestialBody[], dt: number): CelestialBody[];
}

/**
 * Integrador de Euler (primeira ordem)
 * Simples mas menos preciso, pode acumular erro
 */
export class EulerIntegrator implements Integrator {
  private physics: GravityPhysics;

  constructor(physics: GravityPhysics) {
    this.physics = physics;
  }

  step(bodies: CelestialBody[], dt: number): CelestialBody[] {
    // Primeiro, calcular todas as aceleracoes
    const accelerations = bodies.map((body) =>
      this.physics.calculateAcceleration(body, bodies)
    );

    // Atualizar posicoes e velocidades
    return bodies.map((body, i) => {
      const acceleration = accelerations[i];
      
      // v_new = v + a * dt
      const newVelocity = Vector.add(
        body.velocity,
        Vector.scale(acceleration, dt)
      );
      
      // x_new = x + v * dt
      const newPosition = Vector.add(
        body.position,
        Vector.scale(body.velocity, dt)
      );

      return {
        ...body,
        position: newPosition,
        velocity: newVelocity,
      };
    });
  }
}

/**
 * Integrador Velocity Verlet (segunda ordem)
 * Melhor conservacao de energia que Euler
 */
export class VerletIntegrator implements Integrator {
  private physics: GravityPhysics;
  private previousAccelerations: Map<string, Vector3D> = new Map();

  constructor(physics: GravityPhysics) {
    this.physics = physics;
  }

  step(bodies: CelestialBody[], dt: number): CelestialBody[] {
    // Calcular aceleracoes atuais
    const currentAccelerations = bodies.map((body) =>
      this.physics.calculateAcceleration(body, bodies)
    );

    // Atualizar posicoes usando Verlet
    const newBodies = bodies.map((body, i) => {
      const a = currentAccelerations[i];
      
      // x_new = x + v*dt + 0.5*a*dt^2
      const newPosition = Vector.add(
        Vector.add(body.position, Vector.scale(body.velocity, dt)),
        Vector.scale(a, 0.5 * dt * dt)
      );

      return {
        ...body,
        position: newPosition,
      };
    });

    // Calcular novas aceleracoes
    const newAccelerations = newBodies.map((body) =>
      this.physics.calculateAcceleration(body, newBodies)
    );

    // Atualizar velocidades
    return newBodies.map((body, i) => {
      // v_new = v + 0.5*(a_old + a_new)*dt
      const avgAcceleration = Vector.scale(
        Vector.add(currentAccelerations[i], newAccelerations[i]),
        0.5
      );
      
      const newVelocity = Vector.add(
        bodies[i].velocity,
        Vector.scale(avgAcceleration, dt)
      );

      this.previousAccelerations.set(body.id, newAccelerations[i]);

      return {
        ...body,
        velocity: newVelocity,
      };
    });
  }
}

/**
 * Integrador Runge-Kutta de 4a ordem (RK4)
 * Mais preciso, melhor para sistemas caoticos
 */
export class RK4Integrator implements Integrator {
  private physics: GravityPhysics;

  constructor(physics: GravityPhysics) {
    this.physics = physics;
  }

  step(bodies: CelestialBody[], dt: number): CelestialBody[] {
    const n = bodies.length;

    // Estado atual
    const state = this.bodiesToState(bodies);

    // k1 = f(t, y)
    const k1 = this.derivative(bodies);

    // k2 = f(t + dt/2, y + k1*dt/2)
    const state2 = this.addScaledState(state, k1, dt / 2);
    const bodies2 = this.stateToBodies(state2, bodies);
    const k2 = this.derivative(bodies2);

    // k3 = f(t + dt/2, y + k2*dt/2)
    const state3 = this.addScaledState(state, k2, dt / 2);
    const bodies3 = this.stateToBodies(state3, bodies);
    const k3 = this.derivative(bodies3);

    // k4 = f(t + dt, y + k3*dt)
    const state4 = this.addScaledState(state, k3, dt);
    const bodies4 = this.stateToBodies(state4, bodies);
    const k4 = this.derivative(bodies4);

    // y_new = y + (k1 + 2*k2 + 2*k3 + k4) * dt/6
    const finalState = new Float64Array(state.length);
    for (let i = 0; i < state.length; i++) {
      finalState[i] = state[i] + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6;
    }

    return this.stateToBodies(finalState, bodies);
  }

  private bodiesToState(bodies: CelestialBody[]): Float64Array {
    // [x1, y1, z1, vx1, vy1, vz1, x2, y2, z2, vx2, vy2, vz2, ...]
    const state = new Float64Array(bodies.length * 6);
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
  }

  private stateToBodies(state: Float64Array, originalBodies: CelestialBody[]): CelestialBody[] {
    return originalBodies.map((body, i) => {
      const offset = i * 6;
      return {
        ...body,
        position: {
          x: state[offset],
          y: state[offset + 1],
          z: state[offset + 2],
        },
        velocity: {
          x: state[offset + 3],
          y: state[offset + 4],
          z: state[offset + 5],
        },
      };
    });
  }

  private derivative(bodies: CelestialBody[]): Float64Array {
    const deriv = new Float64Array(bodies.length * 6);
    
    bodies.forEach((body, i) => {
      const offset = i * 6;
      const acceleration = this.physics.calculateAcceleration(body, bodies);
      
      // dx/dt = v
      deriv[offset] = body.velocity.x;
      deriv[offset + 1] = body.velocity.y;
      deriv[offset + 2] = body.velocity.z;
      
      // dv/dt = a
      deriv[offset + 3] = acceleration.x;
      deriv[offset + 4] = acceleration.y;
      deriv[offset + 5] = acceleration.z;
    });

    return deriv;
  }

  private addScaledState(state: Float64Array, deriv: Float64Array, scale: number): Float64Array {
    const result = new Float64Array(state.length);
    for (let i = 0; i < state.length; i++) {
      result[i] = state[i] + deriv[i] * scale;
    }
    return result;
  }
}

/**
 * Fabrica de integradores
 */
export function createIntegrator(method: IntegrationMethod, physics: GravityPhysics): Integrator {
  switch (method) {
    case 'euler':
      return new EulerIntegrator(physics);
    case 'verlet':
      return new VerletIntegrator(physics);
    case 'rk4':
      return new RK4Integrator(physics);
    default:
      throw new Error(`Metodo de integracao desconhecido: ${method}`);
  }
}
