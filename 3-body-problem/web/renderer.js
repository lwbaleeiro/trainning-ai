/**
 * Renderizador Canvas 2D com suporte a trilhas e visualização
 */

import { PHYSICAL_CONSTANTS } from './physics.js';

export class Renderer {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.config = {
      scale: config.scale || PHYSICAL_CONSTANTS.AU / 150,
      showTrails: config.showTrails !== false,
      trailLength: config.trailLength || 200,
      showVectors: config.showVectors || false,
      showGrid: config.showGrid || false,
      followCenterMass: config.followCenterMass || false,
      zoom: config.zoom || 1,
    };

    // Offset para pan
    this.offsetX = 0;
    this.offsetY = 0;

    // Centro de massa para seguir
    this.centerOfMass = { x: 0, y: 0, z: 0 };

    // Trilhas dos corpos
    this.trails = new Map();

    // Setup do canvas
    this.resize();
    this.setupInteraction();
  }

  resize() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Ajusta para DPI do display
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  setupInteraction() {
    let isDragging = false;
    let lastX, lastY;

    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      this.offsetX += dx;
      this.offsetY += dy;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    this.canvas.addEventListener('mouseup', () => isDragging = false);
    this.canvas.addEventListener('mouseleave', () => isDragging = false);

    // Zoom com scroll
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.config.zoom = Math.max(0.1, Math.min(10, this.config.zoom * zoomFactor));
    });

    // Resize handler
    window.addEventListener('resize', () => this.resize());
  }

  // Converte posição do mundo para tela
  worldToScreen(pos) {
    const { scale, zoom, followCenterMass } = this.config;
    const effectiveScale = scale / zoom;

    let worldX = pos.x;
    let worldY = pos.y;

    if (followCenterMass) {
      worldX -= this.centerOfMass.x;
      worldY -= this.centerOfMass.y;
    }

    return {
      x: this.centerX + this.offsetX + worldX / effectiveScale,
      y: this.centerY + this.offsetY - worldY / effectiveScale, // Y invertido
    };
  }

  // Calcula raio visual baseado na massa
  getBodyRadius(mass) {
    const solarMasses = mass / PHYSICAL_CONSTANTS.SOLAR_MASS;
    if (solarMasses >= 0.1) {
      return Math.max(8, Math.min(20, 8 + Math.log10(solarMasses + 1) * 8));
    }
    const earthMasses = mass / PHYSICAL_CONSTANTS.EARTH_MASS;
    return Math.max(3, Math.min(8, 3 + Math.log10(earthMasses + 1) * 2));
  }

  // Atualiza trilhas
  updateTrails(bodies) {
    for (const body of bodies) {
      if (!this.trails.has(body.id)) {
        this.trails.set(body.id, []);
      }
      
      const trail = this.trails.get(body.id);
      const screenPos = this.worldToScreen(body.position);
      trail.push({ ...screenPos, color: body.color });
      
      if (trail.length > this.config.trailLength) {
        trail.shift();
      }
    }
  }

  // Limpa trilhas
  clearTrails() {
    this.trails.clear();
  }

  // Desenha grade
  drawGrid() {
    const { scale, zoom } = this.config;
    const effectiveScale = scale / zoom;
    const gridSpacing = PHYSICAL_CONSTANTS.AU; // 1 AU
    const gridPixels = gridSpacing / effectiveScale;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    // Linhas verticais
    const startX = (this.centerX + this.offsetX) % gridPixels;
    for (let x = startX; x < this.width; x += gridPixels) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Linhas horizontais
    const startY = (this.centerY + this.offsetY) % gridPixels;
    for (let y = startY; y < this.height; y += gridPixels) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Eixos centrais
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX + this.offsetX, 0);
    this.ctx.lineTo(this.centerX + this.offsetX, this.height);
    this.ctx.moveTo(0, this.centerY + this.offsetY);
    this.ctx.lineTo(this.width, this.centerY + this.offsetY);
    this.ctx.stroke();
  }

  // Desenha trilhas
  drawTrails() {
    for (const [bodyId, trail] of this.trails) {
      if (trail.length < 2) continue;

      this.ctx.beginPath();
      this.ctx.moveTo(trail[0].x, trail[0].y);

      for (let i = 1; i < trail.length; i++) {
        this.ctx.lineTo(trail[i].x, trail[i].y);
      }

      // Gradiente de opacidade
      const gradient = this.ctx.createLinearGradient(
        trail[0].x, trail[0].y,
        trail[trail.length - 1].x, trail[trail.length - 1].y
      );
      
      const color = trail[0].color || '#ffffff';
      gradient.addColorStop(0, this.hexToRgba(color, 0.05));
      gradient.addColorStop(1, this.hexToRgba(color, 0.5));

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
  }

  // Desenha um corpo celeste
  drawBody(body) {
    const screenPos = this.worldToScreen(body.position);
    const radius = this.getBodyRadius(body.mass);
    const color = body.color || '#ffffff';

    // Brilho (glow)
    const gradient = this.ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, radius * 3
    );
    gradient.addColorStop(0, this.hexToRgba(color, 0.8));
    gradient.addColorStop(0.3, this.hexToRgba(color, 0.3));
    gradient.addColorStop(1, this.hexToRgba(color, 0));

    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, radius * 3, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Corpo principal
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Nome
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.font = '11px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(body.name, screenPos.x, screenPos.y + radius + 14);
  }

  // Desenha vetor de velocidade
  drawVelocityVector(body) {
    const screenPos = this.worldToScreen(body.position);
    const { scale, zoom } = this.config;
    
    // Escala o vetor de velocidade para visualização
    const velScale = 2000; // Ajuste para visualização
    const endPos = {
      x: screenPos.x + body.velocity.x / velScale,
      y: screenPos.y - body.velocity.y / velScale,
    };

    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x, screenPos.y);
    this.ctx.lineTo(endPos.x, endPos.y);
    this.ctx.strokeStyle = 'rgba(0, 255, 128, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Ponta da seta
    const angle = Math.atan2(endPos.y - screenPos.y, endPos.x - screenPos.x);
    const arrowSize = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(endPos.x, endPos.y);
    this.ctx.lineTo(
      endPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
      endPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      endPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
      endPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0, 255, 128, 0.6)';
    this.ctx.fill();
  }

  // Renderiza o frame
  render(state) {
    const { bodies, centerOfMass } = state;
    this.centerOfMass = centerOfMass;

    // Limpa canvas
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grade
    if (this.config.showGrid) {
      this.drawGrid();
    }

    // Atualiza e desenha trilhas
    if (this.config.showTrails) {
      this.updateTrails(bodies);
      this.drawTrails();
    }

    // Desenha corpos
    for (const body of bodies) {
      this.drawBody(body);
      
      if (this.config.showVectors) {
        this.drawVelocityVector(body);
      }
    }
  }

  // Utilitário: hex para rgba
  hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(255, 255, 255, ${alpha})`;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Centraliza a visualização
  center() {
    this.offsetX = 0;
    this.offsetY = 0;
  }

  // Atualiza configuração
  setConfig(config) {
    this.config = { ...this.config, ...config };
    if ('showTrails' in config && !config.showTrails) {
      this.clearTrails();
    }
  }
}
