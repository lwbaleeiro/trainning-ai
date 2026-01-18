/**
 * Modulo de Fisica - Operacoes vetoriais e calculos gravitacionais
 */

import { Vector3D, CelestialBody, PHYSICAL_CONSTANTS } from './types';

/**
 * Operacoes com vetores 3D
 */
export const Vector = {
  /**
   * Cria um vetor zero
   */
  zero(): Vector3D {
    return { x: 0, y: 0, z: 0 };
  },

  /**
   * Cria um novo vetor
   */
  create(x: number, y: number, z: number): Vector3D {
    return { x, y, z };
  },

  /**
   * Soma dois vetores
   */
  add(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },

  /**
   * Subtrai dois vetores (a - b)
   */
  subtract(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
    };
  },

  /**
   * Multiplica vetor por escalar
   */
  scale(v: Vector3D, scalar: number): Vector3D {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
      z: v.z * scalar,
    };
  },

  /**
   * Calcula o modulo (magnitude) do vetor
   */
  magnitude(v: Vector3D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  /**
   * Calcula o quadrado do modulo (evita sqrt desnecessario)
   */
  magnitudeSquared(v: Vector3D): number {
    return v.x * v.x + v.y * v.y + v.z * v.z;
  },

  /**
   * Normaliza o vetor (magnitude = 1)
   */
  normalize(v: Vector3D): Vector3D {
    const mag = Vector.magnitude(v);
    if (mag === 0) return Vector.zero();
    return Vector.scale(v, 1 / mag);
  },

  /**
   * Produto escalar
   */
  dot(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  /**
   * Produto vetorial
   */
  cross(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  /**
   * Distancia entre dois pontos
   */
  distance(a: Vector3D, b: Vector3D): number {
    return Vector.magnitude(Vector.subtract(a, b));
  },

  /**
   * Clona um vetor
   */
  clone(v: Vector3D): Vector3D {
    return { x: v.x, y: v.y, z: v.z };
  },

  /**
   * Formata vetor para exibicao
   */
  toString(v: Vector3D, precision: number = 2): string {
    return `(${v.x.toExponential(precision)}, ${v.y.toExponential(precision)}, ${v.z.toExponential(precision)})`;
  },
};

/**
 * Calculos de fisica gravitacional
 */
export class GravityPhysics {
  private G: number;
  private softening: number;

  constructor(G: number = PHYSICAL_CONSTANTS.G, softening: number = 1e8) {
    this.G = G;
    this.softening = softening;
  }

  /**
   * Calcula a forca gravitacional entre dois corpos
   * F = G * m1 * m2 / r^2 * r_hat
   */
  calculateGravitationalForce(body1: CelestialBody, body2: CelestialBody): Vector3D {
    const r = Vector.subtract(body2.position, body1.position);
    const distanceSquared = Vector.magnitudeSquared(r) + this.softening * this.softening;
    const distance = Math.sqrt(distanceSquared);
    
    if (distance === 0) return Vector.zero();

    const forceMagnitude = (this.G * body1.mass * body2.mass) / distanceSquared;
    const forceDirection = Vector.scale(r, 1 / distance);
    
    return Vector.scale(forceDirection, forceMagnitude);
  }

  /**
   * Calcula a aceleracao de um corpo devido a todos os outros
   */
  calculateAcceleration(body: CelestialBody, allBodies: CelestialBody[]): Vector3D {
    let acceleration = Vector.zero();

    for (const other of allBodies) {
      if (other.id === body.id) continue;

      const force = this.calculateGravitationalForce(body, other);
      const bodyAcceleration = Vector.scale(force, 1 / body.mass);
      acceleration = Vector.add(acceleration, bodyAcceleration);
    }

    return acceleration;
  }

  /**
   * Calcula a energia cinetica total do sistema
   * KE = 0.5 * m * v^2
   */
  calculateKineticEnergy(bodies: CelestialBody[]): number {
    return bodies.reduce((total, body) => {
      const vSquared = Vector.magnitudeSquared(body.velocity);
      return total + 0.5 * body.mass * vSquared;
    }, 0);
  }

  /**
   * Calcula a energia potencial gravitacional total
   * PE = -G * m1 * m2 / r (para cada par)
   */
  calculatePotentialEnergy(bodies: CelestialBody[]): number {
    let potential = 0;

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const distance = Vector.distance(bodies[i].position, bodies[j].position);
        if (distance > 0) {
          potential -= (this.G * bodies[i].mass * bodies[j].mass) / distance;
        }
      }
    }

    return potential;
  }

  /**
   * Calcula a energia total do sistema
   */
  calculateTotalEnergy(bodies: CelestialBody[]): number {
    return this.calculateKineticEnergy(bodies) + this.calculatePotentialEnergy(bodies);
  }

  /**
   * Calcula o momento angular total do sistema
   */
  calculateAngularMomentum(bodies: CelestialBody[]): Vector3D {
    return bodies.reduce((total, body) => {
      // L = r x p = r x (m * v)
      const momentum = Vector.scale(body.velocity, body.mass);
      const angularMomentum = Vector.cross(body.position, momentum);
      return Vector.add(total, angularMomentum);
    }, Vector.zero());
  }

  /**
   * Calcula o centro de massa do sistema
   */
  calculateCenterOfMass(bodies: CelestialBody[]): Vector3D {
    let totalMass = 0;
    let weightedPosition = Vector.zero();

    for (const body of bodies) {
      totalMass += body.mass;
      weightedPosition = Vector.add(
        weightedPosition,
        Vector.scale(body.position, body.mass)
      );
    }

    return totalMass > 0 ? Vector.scale(weightedPosition, 1 / totalMass) : Vector.zero();
  }
}
