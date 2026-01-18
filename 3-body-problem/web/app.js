/**
 * Aplicação Principal - Simulador do Problema de Três Corpos
 */

import { PHYSICAL_CONSTANTS, Vector } from './physics.js';
import { SCENARIOS } from './scenarios.js';
import { Simulator } from './simulator.js';
import { Renderer } from './renderer.js';

class App {
  constructor() {
    // Estado
    this.isRunning = false;
    this.simulator = null;
    this.renderer = null;
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.stepsPerFrame = 20;
    this.editingBodyId = null;

    // Inicialização
    this.init();
  }

  init() {
    // Canvas
    this.canvas = document.getElementById('simulation-canvas');
    this.renderer = new Renderer(this.canvas);

    // Elementos da UI
    this.cacheElements();
    
    // Event listeners
    this.setupEventListeners();

    // Carregar cenário inicial
    this.loadScenario('trisolaris');

    // Iniciar loop de animação
    this.animate();
  }

  cacheElements() {
    // Controles de simulação
    this.btnPlay = document.getElementById('btn-play');
    this.btnReset = document.getElementById('btn-reset');
    this.btnCenter = document.getElementById('btn-center');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedDisplay = document.getElementById('speed-display');

    // Seleção de cenário
    this.scenarioSelect = document.getElementById('scenario-select');
    this.scenarioDescription = document.getElementById('scenario-description');

    // Configurações
    this.timeStepInput = document.getElementById('time-step');
    this.integrationMethodSelect = document.getElementById('integration-method');
    this.showTrailsCheckbox = document.getElementById('show-trails');
    this.trailLengthSlider = document.getElementById('trail-length');

    // Visualização
    this.zoomSlider = document.getElementById('zoom-level');
    this.zoomDisplay = document.getElementById('zoom-display');
    this.showVectorsCheckbox = document.getElementById('show-vectors');
    this.showGridCheckbox = document.getElementById('show-grid');
    this.followCenterMassCheckbox = document.getElementById('follow-center-mass');

    // Corpos
    this.bodiesContainer = document.getElementById('bodies-container');
    this.btnAddBody = document.getElementById('btn-add-body');

    // Displays
    this.timeDisplay = document.getElementById('time-display');
    this.energyDisplay = document.getElementById('energy-display');
    this.fpsDisplay = document.getElementById('fps-display');
    this.kineticEnergyDisplay = document.getElementById('kinetic-energy');
    this.potentialEnergyDisplay = document.getElementById('potential-energy');
    this.energyDriftDisplay = document.getElementById('energy-drift');
    this.stepCountDisplay = document.getElementById('step-count');

    // Modal
    this.bodyModal = document.getElementById('body-modal');
    this.btnSaveBody = document.getElementById('btn-save-body');
    this.btnDeleteBody = document.getElementById('btn-delete-body');
    this.modalClose = document.querySelector('.modal-close');
  }

  setupEventListeners() {
    // Controles de simulação
    this.btnPlay.addEventListener('click', () => this.toggleSimulation());
    this.btnReset.addEventListener('click', () => this.resetSimulation());
    this.btnCenter.addEventListener('click', () => this.centerView());

    this.speedSlider.addEventListener('input', (e) => {
      this.stepsPerFrame = parseInt(e.target.value);
      this.speedDisplay.textContent = `${this.stepsPerFrame}x`;
    });

    // Cenário
    this.scenarioSelect.addEventListener('change', (e) => {
      this.loadScenario(e.target.value);
    });

    // Configurações de simulação
    this.timeStepInput.addEventListener('change', (e) => {
      const hours = parseFloat(e.target.value);
      this.simulator.setConfig({ timeStep: hours * 3600 });
    });

    this.integrationMethodSelect.addEventListener('change', (e) => {
      this.simulator.setConfig({ integrationMethod: e.target.value });
    });

    // Visualização
    this.showTrailsCheckbox.addEventListener('change', (e) => {
      this.renderer.setConfig({ showTrails: e.target.checked });
    });

    this.trailLengthSlider.addEventListener('input', (e) => {
      this.renderer.setConfig({ trailLength: parseInt(e.target.value) });
    });

    this.zoomSlider.addEventListener('input', (e) => {
      const zoom = parseFloat(e.target.value);
      this.renderer.setConfig({ zoom });
      this.zoomDisplay.textContent = `${zoom.toFixed(1)}x`;
    });

    this.showVectorsCheckbox.addEventListener('change', (e) => {
      this.renderer.setConfig({ showVectors: e.target.checked });
    });

    this.showGridCheckbox.addEventListener('change', (e) => {
      this.renderer.setConfig({ showGrid: e.target.checked });
    });

    this.followCenterMassCheckbox.addEventListener('change', (e) => {
      this.renderer.setConfig({ followCenterMass: e.target.checked });
    });

    // Adicionar corpo
    this.btnAddBody.addEventListener('click', () => this.addNewBody());

    // Modal
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.btnSaveBody.addEventListener('click', () => this.saveBody());
    this.btnDeleteBody.addEventListener('click', () => this.deleteBody());
    this.bodyModal.addEventListener('click', (e) => {
      if (e.target === this.bodyModal) this.closeModal();
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        this.toggleSimulation();
      }
      if (e.code === 'KeyR' && document.activeElement.tagName !== 'INPUT') {
        this.resetSimulation();
      }
      if (e.code === 'Escape') {
        this.closeModal();
      }
    });
  }

  loadScenario(scenarioId) {
    const scenario = SCENARIOS[scenarioId];
    if (!scenario) return;

    // Para simulação
    this.isRunning = false;
    this.updatePlayButton();

    // Clona os corpos do cenário
    const bodies = scenario.bodies.map(b => ({
      ...b,
      position: Vector.clone(b.position),
      velocity: Vector.clone(b.velocity),
    }));

    // Cria novo simulador
    const timeStep = parseFloat(this.timeStepInput.value) * 3600;
    const integrationMethod = this.integrationMethodSelect.value;
    
    this.simulator = new Simulator(bodies, { timeStep, integrationMethod });

    // Limpa trilhas
    this.renderer.clearTrails();
    this.renderer.center();

    // Atualiza UI
    this.scenarioDescription.textContent = scenario.description;
    this.updateBodiesList();
    this.updateStats();
  }

  toggleSimulation() {
    this.isRunning = !this.isRunning;
    this.updatePlayButton();
  }

  updatePlayButton() {
    this.btnPlay.innerHTML = this.isRunning 
      ? '<span class="icon">⏸</span>' 
      : '<span class="icon">▶</span>';
    
    if (this.isRunning) {
      document.querySelector('.simulation-area').classList.add('simulating');
    } else {
      document.querySelector('.simulation-area').classList.remove('simulating');
    }
  }

  resetSimulation() {
    this.isRunning = false;
    this.updatePlayButton();
    this.simulator.reset();
    this.renderer.clearTrails();
    this.renderer.center();
    this.updateStats();
  }

  centerView() {
    this.renderer.center();
    this.renderer.setConfig({ zoom: 1 });
    this.zoomSlider.value = 1;
    this.zoomDisplay.textContent = '1.0x';
  }

  updateBodiesList() {
    this.bodiesContainer.innerHTML = '';

    for (const body of this.simulator.bodies) {
      const item = document.createElement('div');
      item.className = 'body-item';
      item.innerHTML = `
        <div class="body-color" style="background-color: ${body.color}"></div>
        <div class="body-info">
          <div class="body-name">${body.name}</div>
          <div class="body-mass">${this.formatMass(body.mass)}</div>
        </div>
        <button class="btn btn-small btn-secondary body-edit-btn">Editar</button>
      `;

      item.querySelector('.body-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openBodyEditor(body.id);
      });

      this.bodiesContainer.appendChild(item);
    }
  }

  formatMass(mass) {
    const solarMasses = mass / PHYSICAL_CONSTANTS.SOLAR_MASS;
    if (solarMasses >= 0.01) {
      return `${solarMasses.toFixed(3)} M☉`;
    }
    const earthMasses = mass / PHYSICAL_CONSTANTS.EARTH_MASS;
    return `${earthMasses.toFixed(2)} M⊕`;
  }

  formatEnergy(energy) {
    const abs = Math.abs(energy);
    if (abs === 0) return '0 J';
    const exp = Math.floor(Math.log10(abs));
    const mantissa = energy / Math.pow(10, exp);
    return `${mantissa.toFixed(2)}e${exp} J`;
  }

  updateStats() {
    const state = this.simulator.getState();

    // Tempo
    const days = state.time / PHYSICAL_CONSTANTS.DAY_SECONDS;
    const years = state.time / PHYSICAL_CONSTANTS.YEAR_SECONDS;
    
    if (years >= 1) {
      this.timeDisplay.textContent = `${years.toFixed(2)} anos`;
    } else {
      this.timeDisplay.textContent = `${days.toFixed(1)} dias`;
    }

    // Energia
    this.energyDisplay.textContent = this.formatEnergy(state.totalEnergy);
    this.kineticEnergyDisplay.textContent = this.formatEnergy(state.kineticEnergy);
    this.potentialEnergyDisplay.textContent = this.formatEnergy(state.potentialEnergy);
    this.energyDriftDisplay.textContent = `${(state.energyDrift * 100).toFixed(6)}%`;
    this.stepCountDisplay.textContent = state.stepCount.toLocaleString();
  }

  openBodyEditor(bodyId) {
    const body = this.simulator.bodies.find(b => b.id === bodyId);
    if (!body) return;

    this.editingBodyId = bodyId;

    // Preenche o formulário
    document.getElementById('body-name').value = body.name;
    document.getElementById('body-mass').value = body.mass / PHYSICAL_CONSTANTS.SOLAR_MASS;
    document.getElementById('body-pos-x').value = (body.position.x / PHYSICAL_CONSTANTS.AU).toFixed(4);
    document.getElementById('body-pos-y').value = (body.position.y / PHYSICAL_CONSTANTS.AU).toFixed(4);
    document.getElementById('body-pos-z').value = (body.position.z / PHYSICAL_CONSTANTS.AU).toFixed(4);
    document.getElementById('body-vel-x').value = (body.velocity.x / 1000).toFixed(2);
    document.getElementById('body-vel-y').value = (body.velocity.y / 1000).toFixed(2);
    document.getElementById('body-vel-z').value = (body.velocity.z / 1000).toFixed(2);
    document.getElementById('body-color').value = body.color || '#ffffff';

    this.bodyModal.classList.remove('hidden');
  }

  closeModal() {
    this.bodyModal.classList.add('hidden');
    this.editingBodyId = null;
  }

  saveBody() {
    if (!this.editingBodyId) return;

    const name = document.getElementById('body-name').value;
    const mass = parseFloat(document.getElementById('body-mass').value) * PHYSICAL_CONSTANTS.SOLAR_MASS;
    const position = {
      x: parseFloat(document.getElementById('body-pos-x').value) * PHYSICAL_CONSTANTS.AU,
      y: parseFloat(document.getElementById('body-pos-y').value) * PHYSICAL_CONSTANTS.AU,
      z: parseFloat(document.getElementById('body-pos-z').value) * PHYSICAL_CONSTANTS.AU,
    };
    const velocity = {
      x: parseFloat(document.getElementById('body-vel-x').value) * 1000,
      y: parseFloat(document.getElementById('body-vel-y').value) * 1000,
      z: parseFloat(document.getElementById('body-vel-z').value) * 1000,
    };
    const color = document.getElementById('body-color').value;

    this.simulator.updateBody(this.editingBodyId, { name, mass, position, velocity, color });
    
    // Reinicia para aplicar as mudanças
    this.simulator.reset();
    this.renderer.clearTrails();
    this.updateBodiesList();
    this.updateStats();
    this.closeModal();
  }

  deleteBody() {
    if (!this.editingBodyId) return;
    
    if (this.simulator.bodies.length <= 2) {
      alert('É necessário pelo menos 2 corpos para a simulação.');
      return;
    }

    this.simulator.removeBody(this.editingBodyId);
    this.renderer.clearTrails();
    this.updateBodiesList();
    this.updateStats();
    this.closeModal();
  }

  addNewBody() {
    const id = `body-${Date.now()}`;
    const colors = ['#ff6b6b', '#4dabf7', '#ffd43b', '#51cf66', '#cc5de8', '#ff922b'];
    const color = colors[this.simulator.bodies.length % colors.length];

    const newBody = {
      id,
      name: `Corpo ${this.simulator.bodies.length + 1}`,
      mass: PHYSICAL_CONSTANTS.SOLAR_MASS * 0.5,
      position: { x: PHYSICAL_CONSTANTS.AU * 2, y: 0, z: 0 },
      velocity: { x: 0, y: 15000, z: 0 },
      color,
    };

    this.simulator.addBody(newBody);
    this.updateBodiesList();
    this.openBodyEditor(id);
  }

  animate(currentTime = 0) {
    this.animationId = requestAnimationFrame((t) => this.animate(t));

    // Calcula FPS
    this.frameCount++;
    if (currentTime - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
      this.fpsDisplay.textContent = this.fps;
    }

    // Executa passos de simulação
    if (this.isRunning && this.simulator) {
      for (let i = 0; i < this.stepsPerFrame; i++) {
        this.simulator.step();
      }
      this.updateStats();
    }

    // Renderiza
    if (this.simulator) {
      const state = this.simulator.getState();
      this.renderer.render(state);
    }
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
