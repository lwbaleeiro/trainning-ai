/**
 * Ponto de entrada principal do Simulador do Problema de Tres Corpos
 */

import { ThreeBodySimulator } from './simulator';
import { ASCIIRenderer, renderProgressBar, formatDuration } from './visualization';
import { SCENARIOS, ScenarioName } from './scenarios';
import { PHYSICAL_CONSTANTS, SystemState } from './types';

/**
 * Executa a simulacao com visualizacao em tempo real
 */
async function runRealtimeSimulation(scenarioName: ScenarioName): Promise<void> {
  const scenario = SCENARIOS[scenarioName];
  console.log(`\nIniciando simulacao: ${scenario.name}`);
  console.log(`Descricao: ${scenario.description}\n`);

  const bodies = scenario.create();
  const simulator = new ThreeBodySimulator(bodies, {
    timeStep: 3600 * 6, // 6 horas
    totalTime: PHYSICAL_CONSTANTS.YEAR_SECONDS * 5, // 5 anos
    integrationMethod: 'rk4',
  });

  const renderer = new ASCIIRenderer({
    width: 80,
    height: 35,
    scale: PHYSICAL_CONSTANTS.AU / 15,
    showTrails: true,
    trailLength: 100,
  });

  console.log('Pressione Ctrl+C para parar a simulacao\n');
  await sleep(2000);

  // Simulacao em tempo real
  const stepsPerFrame = 50;
  const frameDelay = 100; // ms

  try {
    await simulator.runRealtime(
      stepsPerFrame,
      (state: SystemState) => {
        ASCIIRenderer.clearScreen();
        ASCIIRenderer.moveCursorToTop();
        console.log(renderer.render(state));
      },
      frameDelay
    );
  } catch (error) {
    // Simulacao interrompida
  }

  console.log('\nSimulacao finalizada.');
}

/**
 * Executa a simulacao rapida e mostra resultados
 */
async function runBatchSimulation(scenarioName: ScenarioName): Promise<void> {
  const scenario = SCENARIOS[scenarioName];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Simulacao: ${scenario.name}`);
  console.log(`Descricao: ${scenario.description}`);
  console.log(`${'='.repeat(60)}\n`);

  const bodies = scenario.create();
  const simulator = new ThreeBodySimulator(bodies, {
    timeStep: 3600, // 1 hora
    totalTime: PHYSICAL_CONSTANTS.YEAR_SECONDS * 10, // 10 anos
    integrationMethod: 'rk4',
  });

  console.log('Executando simulacao...\n');

  const result = simulator.run(
    (state, progress) => {
      process.stdout.write(`\r${renderProgressBar(progress, 50, 'Progresso: ')}`);
    },
    true
  );

  console.log('\n\n');

  // Resultados
  console.log('=== RESULTADOS ===\n');
  console.log(`Passos executados: ${result.totalSteps.toLocaleString()}`);
  console.log(`Tempo de simulacao: ${formatDuration(result.elapsedRealTime)}`);
  console.log(`Energia inicial: ${result.initialEnergy.toExponential(6)} J`);
  console.log(`Energia final: ${result.finalEnergy.toExponential(6)} J`);
  console.log(`Desvio de energia: ${(result.energyDrift * 100).toFixed(6)}%`);

  // Informacoes do sistema
  const systemInfo = simulator.getSystemInfo();
  console.log(`\nMassa total: ${(systemInfo.totalMass / PHYSICAL_CONSTANTS.SOLAR_MASS).toFixed(4)} massas solares`);

  // Mostrar estado final
  const finalState = result.states[result.states.length - 1];
  console.log('\n=== ESTADO FINAL ===\n');
  for (const body of finalState.bodies) {
    const distanceAU = Math.sqrt(
      body.position.x ** 2 + body.position.y ** 2 + body.position.z ** 2
    ) / PHYSICAL_CONSTANTS.AU;
    const velocityKmS = Math.sqrt(
      body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2
    ) / 1000;

    console.log(`${body.name}:`);
    console.log(`  Posicao: (${(body.position.x / PHYSICAL_CONSTANTS.AU).toFixed(4)}, ${(body.position.y / PHYSICAL_CONSTANTS.AU).toFixed(4)}, ${(body.position.z / PHYSICAL_CONSTANTS.AU).toFixed(4)}) AU`);
    console.log(`  Velocidade: ${velocityKmS.toFixed(2)} km/s`);
    console.log(`  Distancia da origem: ${distanceAU.toFixed(4)} AU\n`);
  }
}

/**
 * Compara diferentes metodos de integracao
 */
async function compareIntegrationMethods(): Promise<void> {
  console.log('\n=== COMPARACAO DE METODOS DE INTEGRACAO ===\n');

  const bodies = SCENARIOS['sistema-solar'].create();
  const methods = ['euler', 'verlet', 'rk4'] as const;
  const results: { method: string; drift: number; time: number }[] = [];

  for (const method of methods) {
    const simulator = new ThreeBodySimulator(bodies, {
      timeStep: 3600, // 1 hora
      totalTime: PHYSICAL_CONSTANTS.YEAR_SECONDS, // 1 ano
      integrationMethod: method,
    });

    console.log(`Executando com metodo ${method.toUpperCase()}...`);
    const result = simulator.run(undefined, false);

    results.push({
      method,
      drift: result.energyDrift,
      time: result.elapsedRealTime,
    });
  }

  console.log('\nResultados:\n');
  console.log('Metodo    | Desvio Energia  | Tempo');
  console.log('-'.repeat(45));
  for (const r of results) {
    console.log(
      `${r.method.padEnd(9)} | ${(r.drift * 100).toFixed(8).padStart(14)}% | ${formatDuration(r.time)}`
    );
  }
  console.log('\nNota: Menor desvio de energia = melhor conservacao de energia');
}

/**
 * Mostra o menu de cenarios
 */
function showMenu(): void {
  console.log('\n=== SIMULADOR DO PROBLEMA DE TRES CORPOS ===\n');
  console.log('Cenarios disponiveis:\n');

  const entries = Object.entries(SCENARIOS);
  entries.forEach(([key, value], index) => {
    console.log(`  ${index + 1}. ${value.name}`);
    console.log(`     ${value.description}\n`);
  });

  console.log('Opcoes especiais:');
  console.log('  c. Comparar metodos de integracao');
  console.log('  q. Sair\n');
}

/**
 * Processa argumentos da linha de comando
 */
function parseArgs(): { scenario?: ScenarioName; mode: 'realtime' | 'batch' | 'compare' | 'menu' } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    return { mode: 'menu' };
  }

  const scenarioArg = args[0].toLowerCase();
  const modeArg = args[1]?.toLowerCase();

  if (scenarioArg === 'compare' || scenarioArg === '-c') {
    return { mode: 'compare' };
  }

  if (scenarioArg in SCENARIOS) {
    return {
      scenario: scenarioArg as ScenarioName,
      mode: modeArg === 'batch' ? 'batch' : 'realtime',
    };
  }

  // Tentar mapear numero para cenario
  const index = parseInt(scenarioArg) - 1;
  const keys = Object.keys(SCENARIOS) as ScenarioName[];
  if (index >= 0 && index < keys.length) {
    return {
      scenario: keys[index],
      mode: modeArg === 'batch' ? 'batch' : 'realtime',
    };
  }

  return { mode: 'menu' };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Funcao principal
 */
async function main(): Promise<void> {
  const { scenario, mode } = parseArgs();

  if (mode === 'menu') {
    showMenu();
    console.log('Uso: npx ts-node src/index.ts <cenario> [batch|realtime]');
    console.log('Exemplo: npx ts-node src/index.ts trisolaris realtime\n');

    // Executar demo com sistema trisolaris
    console.log('Executando demo com o sistema Trisolaris...\n');
    await runRealtimeSimulation('trisolaris');
    return;
  }

  if (mode === 'compare') {
    await compareIntegrationMethods();
    return;
  }

  if (scenario) {
    if (mode === 'batch') {
      await runBatchSimulation(scenario);
    } else {
      await runRealtimeSimulation(scenario);
    }
  }
}

// Tratar interrupcao
process.on('SIGINT', () => {
  console.log('\n\nSimulacao interrompida pelo usuario.');
  process.exit(0);
});

// Executar
main().catch(console.error);
