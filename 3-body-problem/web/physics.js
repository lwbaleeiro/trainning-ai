/**
 * Simulador do Problema de Três Corpos - Versão Web
 * Constantes e Tipos
 */

// Constantes físicas
export const PHYSICAL_CONSTANTS = {
  G: 6.67430e-11,      // Constante gravitacional (m³ kg⁻¹ s⁻²)
  AU: 1.496e11,        // Unidade Astronômica em metros
  SOLAR_MASS: 1.989e30, // Massa do Sol em kg
  EARTH_MASS: 5.972e24, // Massa da Terra em kg
  DAY_SECONDS: 86400,   // Segundos em um dia
  YEAR_SECONDS: 31557600, // Segundos em um ano
};

// Operações vetoriais
export const Vector = {
  zero: () => ({ x: 0, y: 0, z: 0 }),
  
  create: (x, y, z) => ({ x, y, z }),
  
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  
  subtract: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  
  scale: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  
  magnitude: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  
  magnitudeSquared: (v) => v.x * v.x + v.y * v.y + v.z * v.z,
  
  distance: (a, b) => Vector.magnitude(Vector.subtract(a, b)),
  
  clone: (v) => ({ x: v.x, y: v.y, z: v.z }),
};
