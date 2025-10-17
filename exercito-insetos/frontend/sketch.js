
let maze = { maze: [], start: null, end: null };
let paths = [];
let stats = {};
let mazeName = 'easy';

const TILE_SIZE = 20;

function setup() {
    const canvas = createCanvas(400, 400);
    canvas.parent('canvas-container');
    
    document.getElementById('maze-select').addEventListener('change', (e) => {
        mazeName = e.target.value;
    });

    document.getElementById('start-btn').addEventListener('click', async () => {
        console.log('Start Evolution button clicked');
        await fetch(`http://localhost:8002/simulation/start/${mazeName}`);
        console.log('Simulation started');
        await loadMaze();
        loadGenerationData();
    });

    document.getElementById('next-gen-btn').addEventListener('click', () => {
        console.log('Next Generation button clicked');
        loadGenerationData();
    });
}

async function loadMaze() {
    console.log('Loading maze...');
    const response = await fetch(`http://localhost:8002/simulation/maze/${mazeName}`);
    const data = await response.json();
    console.log('Maze data:', data);
    maze = data;
    resizeCanvas(maze.maze[0].length * TILE_SIZE, maze.maze.length * TILE_SIZE);
}

async function loadGenerationData() {
    console.log('Loading generation data...');
    const response = await fetch(`http://localhost:8002/simulation/generation_data/${mazeName}`);
    const data = await response.json();
    console.log('Generation data:', data);
    paths = data.paths;
    stats = data.stats;
    updateStats();
}

function draw() {
    background(255);
    drawMaze();
    drawPaths();
}

function drawMaze() {
    if (!maze.maze.length) return;

    for (let r = 0; r < maze.maze.length; r++) {
        for (let c = 0; c < maze.maze[r].length; c++) {
            if (maze.maze[r][c] === 1) {
                fill(0);
            } else {
                fill(255);
            }
            stroke(200);
            rect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Draw start and end points
    if (maze.start) {
        fill(0, 255, 0);
        rect(maze.start[1] * TILE_SIZE, maze.start[0] * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    if (maze.end) {
        fill(255, 0, 0);
        rect(maze.end[1] * TILE_SIZE, maze.end[0] * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

function drawPaths() {
    if (paths.length === 0) return;

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        stroke(0, 0, 255, 50);
        noFill();
        beginShape();
        for (const pos of path) {
            vertex(pos[1] * TILE_SIZE + TILE_SIZE / 2, pos[0] * TILE_SIZE + TILE_SIZE / 2);
        }
        endShape();
    }
    
    // Draw the best path in a different color
    const bestPath = paths[paths.length - 1]; // Assuming last is best for now
    stroke(255, 0, 0, 200);
    strokeWeight(2);
    noFill();
    beginShape();
    for (const pos of bestPath) {
        vertex(pos[1] * TILE_SIZE + TILE_SIZE / 2, pos[0] * TILE_SIZE + TILE_SIZE / 2);
    }
    endShape();
    strokeWeight(1);
}

function updateStats() {
    const statsPanel = document.getElementById('stats-panel');
    statsPanel.innerHTML = `
        <p>Generation: ${stats.generation}</p>
        <p>Best Fitness: ${stats.best_fitness ? stats.best_fitness.toFixed(4) : 'N/A'}</p>
        <p>Success Rate: ${stats.success_rate ? (stats.success_rate * 100).toFixed(2) : '0.00'}%</p>
    `;
}
