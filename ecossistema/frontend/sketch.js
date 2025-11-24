let prey = [];
let predators = [];
let food = [];
let selectedAgentId = null;
let selectedAgentData = null;
let canvas;

function setup() {
    let container = document.getElementById('canvas-container');
    let w = container.clientWidth;
    let h = container.clientHeight;
    canvas = createCanvas(800, 600); // Fixed size matching backend for now
    canvas.parent('canvas-container');
    
    // UI Buttons
    document.getElementById('startBtn').onclick = () => fetch('/simulation/start', { method: 'POST' });
    document.getElementById('pauseBtn').onclick = () => fetch('/simulation/pause', { method: 'POST' });
    document.getElementById('resetBtn').onclick = () => fetch('/simulation/reset', { method: 'POST' });
    
    // Poll stats occasionally
    setInterval(fetchStats, 1000);
}

function draw() {
    background(20);
    
    // Fetch state
    fetchState();
    
    // Draw Food
    noStroke();
    fill(100, 255, 100, 150);
    for (let f of food) {
        ellipse(f.x, f.y, 8, 8);
    }
    
    // Draw Prey
    for (let p of prey) {
        if (p.id === selectedAgentId) {
            stroke(255, 255, 0);
            strokeWeight(2);
        } else {
            noStroke();
        }
        fill(0, 200, 255); // Blueish
        ellipse(p.x, p.y, 20, 20);
        
        // Direction indicator
        stroke(255, 100);
        strokeWeight(1);
        line(p.x, p.y, p.x + p.vx * 10, p.y + p.vy * 10);
    }
    
    // Draw Predators
    for (let p of predators) {
        if (p.id === selectedAgentId) {
            stroke(255, 255, 0);
            strokeWeight(2);
        } else {
            noStroke();
        }
        fill(255, 50, 50); // Red
        push();
        translate(p.x, p.y);
        rotate(atan2(p.vy, p.vx) + PI/2);
        triangle(0, -15, -10, 10, 10, 10);
        pop();
    }
}

async function fetchState() {
    try {
        let response = await fetch('/simulation/state');
        let data = await response.json();
        prey = data.prey;
        predators = data.predators;
        food = data.food;
    } catch (e) {
        console.error("Error fetching state:", e);
    }
}

async function fetchStats() {
    try {
        let response = await fetch('/simulation/stats');
        let data = await response.json();
        document.getElementById('genCount').innerText = data.generation;
        document.getElementById('preyCount').innerText = data.prey_count;
        document.getElementById('predCount').innerText = data.predator_count;
        document.getElementById('avgFitPrey').innerText = data.avg_fitness_prey.toFixed(2);
        document.getElementById('avgFitPred').innerText = data.avg_fitness_pred.toFixed(2);
    } catch (e) {
        console.error("Error fetching stats:", e);
    }
}

function mousePressed() {
    // Check if clicked on agent
    let clicked = false;
    
    for (let p of prey) {
        let d = dist(mouseX, mouseY, p.x, p.y);
        if (d < 15) {
            selectAgent(p.id);
            clicked = true;
            break;
        }
    }
    
    if (!clicked) {
        for (let p of predators) {
            let d = dist(mouseX, mouseY, p.x, p.y);
            if (d < 15) {
                selectAgent(p.id);
                clicked = true;
                break;
            }
        }
    }
    
    if (!clicked) {
        selectedAgentId = null;
        document.getElementById('brainViz').innerHTML = '';
    }
}

async function selectAgent(id) {
    selectedAgentId = id;
    try {
        let response = await fetch('/agent/' + id);
        let data = await response.json();
        selectedAgentData = data;
        drawBrain(data.brain);
    } catch (e) {
        console.error("Error fetching agent details:", e);
    }
}

function drawBrain(brain) {
    let container = document.getElementById('brainViz');
    container.innerHTML = ''; // Clear
    
    // Simple SVG visualization
    let w = container.clientWidth;
    let h = 200;
    let svg = `<svg width="${w}" height="${h}">`;
    
    let layerGap = w / 3;
    let nodeGap = 20;
    
    // Helper to get node pos
    function getNodePos(layer, index, total) {
        let x = layer * layerGap + layerGap / 2;
        let y = (h - (total * nodeGap)) / 2 + index * nodeGap + nodeGap/2;
        return {x, y};
    }
    
    // Draw weights IH
    for (let i = 0; i < brain.input_size; i++) {
        for (let j = 0; j < brain.hidden_size; j++) {
            let p1 = getNodePos(0, i, brain.input_size);
            let p2 = getNodePos(1, j, brain.hidden_size);
            let weight = brain.weights_ih[j][i];
            let color = weight > 0 ? 'green' : 'red';
            let width = Math.abs(weight) * 2;
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" opacity="0.5" />`;
        }
    }
    
    // Draw weights HO
    for (let i = 0; i < brain.hidden_size; i++) {
        for (let j = 0; j < brain.output_size; j++) {
            let p1 = getNodePos(1, i, brain.hidden_size);
            let p2 = getNodePos(2, j, brain.output_size);
            let weight = brain.weights_ho[j][i];
            let color = weight > 0 ? 'green' : 'red';
            let width = Math.abs(weight) * 2;
            svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" opacity="0.5" />`;
        }
    }
    
    // Draw nodes
    function drawNodes(layer, count, label) {
        for (let i = 0; i < count; i++) {
            let p = getNodePos(layer, i, count);
            svg += `<circle cx="${p.x}" cy="${p.y}" r="5" fill="white" />`;
        }
    }
    
    drawNodes(0, brain.input_size);
    drawNodes(1, brain.hidden_size);
    drawNodes(2, brain.output_size);
    
    svg += `</svg>`;
    container.innerHTML = svg;
}
