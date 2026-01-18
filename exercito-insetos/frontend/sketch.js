let grid = [];
let agents = [];
let startPos = null;
let endPos = null;
let canvasWidth = 600;
let canvasHeight = 600;
let cellSize = 0;
let isRunning = false;
let updateInterval;

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    select('#startBtn').mousePressed(startSimulation);
}

function draw() {
    background(34);

    if (grid.length > 0) {
        drawMaze();
        drawAgents();
    } else {
        fill(255);
        textAlign(CENTER, CENTER);
        text("Select a maze and press Start", width / 2, height / 2);
    }
}

function drawMaze() {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === 1) {
                fill(100); // Wall
            } else {
                fill(255); // Path
            }

            if (startPos && x === startPos[0] && y === startPos[1]) {
                fill(0, 255, 0); // Start
            }
            if (endPos && x === endPos[0] && y === endPos[1]) {
                fill(255, 0, 0); // End
            }

            noStroke();
            rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function drawAgents() {
    for (let agent of agents) {
        // Draw path first
        noFill();
        stroke(255, 255, 0, 50); // Yellow path, faint
        beginShape();
        for (let p of agent.path) {
            vertex(p[0] * cellSize + cellSize / 2, p[1] * cellSize + cellSize / 2);
        }
        endShape();

        // Draw current position
        fill(0, 0, 255, 150);
        noStroke();
        ellipse(agent.x * cellSize + cellSize / 2, agent.y * cellSize + cellSize / 2, cellSize * 0.6);
    }
}

async function startSimulation() {
    const mazeName = select('#mazeSelect').value();
    const response = await fetch(`http://localhost:8003/simulation/start/${mazeName}`, {
        method: 'POST'
    });

    const data = await response.json();
    grid = data.maze;
    startPos = data.start;
    endPos = data.end;

    // Calculate cell size
    const cols = grid[0].length;
    const rows = grid.length;
    cellSize = min(canvasWidth / cols, canvasHeight / rows);

    if (!isRunning) {
        isRunning = true;
        loopSimulation();
    }
}

async function loopSimulation() {
    if (!isRunning) return;

    try {
        const response = await fetch('http://localhost:8003/simulation/step', {
            method: 'POST'
        });
        const data = await response.json();

        agents = data.population;

        select('#stats').html(`Generation: ${data.stats.generation} | Best Fitness: ${data.stats.max_fitness.toFixed(4)} | Reached Goal: ${data.stats.reached_goal}`);

        // Run next step immediately for continuous visualization
        setTimeout(loopSimulation, 100);
    } catch (e) {
        console.error("Simulation error or ended:", e);
        isRunning = false;
    }
}
