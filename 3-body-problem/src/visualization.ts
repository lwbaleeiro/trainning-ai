/**
 * Visualizacao ASCII do sistema de tres corpos
 */

import { CelestialBody, SystemState, VisualizationConfig, PHYSICAL_CONSTANTS } from './types';

/**
 * Configuracao padrao de visualizacao
 */
const DEFAULT_VIS_CONFIG: VisualizationConfig = {
  width: 80,
  height: 40,
  scale: PHYSICAL_CONSTANTS.AU / 20, // 20 caracteres por UA
  centerX: 40,
  centerY: 20,
  showTrails: false,
  trailLength: 50,
};

/**
 * Renderizador ASCII para terminal
 */
export class ASCIIRenderer {
  private config: VisualizationConfig;
  private trails: Map<string, { x: number; y: number }[]> = new Map();

  constructor(config: Partial<VisualizationConfig> = {}) {
    this.config = { ...DEFAULT_VIS_CONFIG, ...config };
  }

  /**
   * Renderiza o estado atual do sistema
   */
  render(state: SystemState): string {
    const { width, height, scale, centerX, centerY } = this.config;

    // Criar buffer do frame
    const buffer: string[][] = Array.from({ length: height }, () =>
      Array(width).fill(' ')
    );

    // Desenhar borda
    for (let x = 0; x < width; x++) {
      buffer[0][x] = '-';
      buffer[height - 1][x] = '-';
    }
    for (let y = 0; y < height; y++) {
      buffer[y][0] = '|';
      buffer[y][width - 1] = '|';
    }
    buffer[0][0] = '+';
    buffer[0][width - 1] = '+';
    buffer[height - 1][0] = '+';
    buffer[height - 1][width - 1] = '+';

    // Desenhar eixos centrais (opcional)
    // const axisY = Math.floor(centerY);
    // const axisX = Math.floor(centerX);
    // for (let x = 1; x < width - 1; x++) {
    //   if (buffer[axisY][x] === ' ') buffer[axisY][x] = '.';
    // }
    // for (let y = 1; y < height - 1; y++) {
    //   if (buffer[y][axisX] === ' ') buffer[y][axisX] = '.';
    // }

    // Desenhar trilhas se habilitado
    if (this.config.showTrails) {
      for (const [bodyId, trail] of this.trails) {
        for (const point of trail) {
          const screenX = Math.round(point.x);
          const screenY = Math.round(point.y);
          if (this.isInBounds(screenX, screenY)) {
            if (buffer[screenY][screenX] === ' ') {
              buffer[screenY][screenX] = '.';
            }
          }
        }
      }
    }

    // Desenhar corpos
    for (const body of state.bodies) {
      const screenX = Math.round(centerX + body.position.x / scale);
      const screenY = Math.round(centerY - body.position.y / scale); // Y invertido

      // Atualizar trilha
      if (this.config.showTrails) {
        if (!this.trails.has(body.id)) {
          this.trails.set(body.id, []);
        }
        const trail = this.trails.get(body.id)!;
        trail.push({ x: screenX, y: screenY });
        if (trail.length > this.config.trailLength) {
          trail.shift();
        }
      }

      // Desenhar corpo se estiver nos limites
      if (this.isInBounds(screenX, screenY)) {
        const symbol = body.symbol || this.getDefaultSymbol(body);
        buffer[screenY][screenX] = symbol;
      }
    }

    // Converter buffer para string
    const frame = buffer.map((row) => row.join('')).join('\n');

    // Adicionar informacoes
    const info = this.formatInfo(state);

    return frame + '\n' + info;
  }

  private isInBounds(x: number, y: number): boolean {
    return x > 0 && x < this.config.width - 1 && y > 0 && y < this.config.height - 1;
  }

  private getDefaultSymbol(body: CelestialBody): string {
    // Simbolos baseados na massa
    const solarMasses = body.mass / PHYSICAL_CONSTANTS.SOLAR_MASS;
    if (solarMasses >= 0.5) return 'O'; // Estrela
    if (solarMasses >= 0.01) return 'o'; // Estrela pequena
    return '*'; // Planeta ou asteroide
  }

  private formatInfo(state: SystemState): string {
    const days = state.time / PHYSICAL_CONSTANTS.DAY_SECONDS;
    const years = state.time / PHYSICAL_CONSTANTS.YEAR_SECONDS;

    let info = `Tempo: ${days.toFixed(1)} dias (${years.toFixed(3)} anos)\n`;
    info += `Energia Total: ${state.totalEnergy.toExponential(4)} J\n`;
    info += `Energia Cinetica: ${state.kineticEnergy.toExponential(4)} J\n`;
    info += `Energia Potencial: ${state.potentialEnergy.toExponential(4)} J\n\n`;

    info += 'Corpos:\n';
    for (const body of state.bodies) {
      const distanceAU = Math.sqrt(
        body.position.x ** 2 + body.position.y ** 2 + body.position.z ** 2
      ) / PHYSICAL_CONSTANTS.AU;
      const velocityKmS = Math.sqrt(
        body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2
      ) / 1000;
      
      info += `  ${body.symbol || '*'} ${body.name}: `;
      info += `dist=${distanceAU.toFixed(2)} AU, vel=${velocityKmS.toFixed(1)} km/s\n`;
    }

    return info;
  }

  /**
   * Limpa as trilhas
   */
  clearTrails(): void {
    this.trails.clear();
  }

  /**
   * Atualiza configuracao
   */
  setConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Limpa o terminal
   */
  static clearScreen(): void {
    process.stdout.write('\x1B[2J\x1B[0f');
  }

  /**
   * Move o cursor para o topo
   */
  static moveCursorToTop(): void {
    process.stdout.write('\x1B[H');
  }
}

/**
 * Renderiza uma barra de progresso
 */
export function renderProgressBar(
  progress: number,
  width: number = 50,
  label: string = ''
): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentage = (progress * 100).toFixed(1);
  return `${label}[${bar}] ${percentage}%`;
}

/**
 * Formata duracao em formato legivel
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}min`;
  return `${(seconds / 3600).toFixed(2)}h`;
}
