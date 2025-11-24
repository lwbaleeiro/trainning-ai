from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uvicorn
from .simulation import Simulation

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulation Instance
sim = Simulation()
simulation_running = False

# Background Task for Simulation Loop
async def run_simulation():
    global simulation_running
    while True:
        if simulation_running:
            sim.update()
        await asyncio.sleep(0.03) # ~30 FPS

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_simulation())

@app.get("/simulation/state")
async def get_state():
    return sim.get_state()

@app.post("/simulation/start")
async def start_simulation():
    global simulation_running
    simulation_running = True
    return {"message": "Simulation started"}

@app.post("/simulation/pause")
async def pause_simulation():
    global simulation_running
    simulation_running = False
    return {"message": "Simulation paused"}

@app.post("/simulation/reset")
async def reset_simulation():
    global simulation_running
    simulation_running = False
    sim.reset()
    return {"message": "Simulation reset"}

@app.get("/simulation/stats")
async def get_stats():
    return sim.get_stats()

@app.get("/agent/{agent_id}")
async def get_agent(agent_id: str):
    # Search in prey
    for p in sim.prey:
        if p.id == agent_id:
            return {
                "id": p.id,
                "type": "Prey",
                "brain": {
                    "input_size": p.brain.input_size,
                    "hidden_size": p.brain.hidden_size,
                    "output_size": p.brain.output_size,
                    "weights_ih": p.brain.weights_ih.tolist(),
                    "weights_ho": p.brain.weights_ho.tolist(),
                    "bias_h": p.brain.bias_h.tolist(),
                    "bias_o": p.brain.bias_o.tolist()
                }
            }
    # Search in predators
    for p in sim.predators:
        if p.id == agent_id:
            return {
                "id": p.id,
                "type": "Predator",
                "brain": {
                    "input_size": p.brain.input_size,
                    "hidden_size": p.brain.hidden_size,
                    "output_size": p.brain.output_size,
                    "weights_ih": p.brain.weights_ih.tolist(),
                    "weights_ho": p.brain.weights_ho.tolist(),
                    "bias_h": p.brain.bias_h.tolist(),
                    "bias_o": p.brain.bias_o.tolist()
                }
            }
    return {"error": "Agent not found"}

# Mount static files (Frontend)
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
