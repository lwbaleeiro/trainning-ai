from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .simulation import Simulation
from .evolution import Evolution
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
sim = None
evo = Evolution(mutation_rate=0.05)

MAZE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'mazes')

@app.get("/")
def read_root():
    return {"message": "Insect Army Backend"}

@app.post("/simulation/start/{maze_name}")
def start_simulation(maze_name: str, population_size: int = 50):
    global sim
    maze_path = os.path.join(MAZE_DIR, f"{maze_name}.txt")
    
    if not os.path.exists(maze_path):
        raise HTTPException(status_code=404, detail="Maze not found")
        
    sim = Simulation(maze_path, population_size)
    return {
        "message": f"Simulation started with {maze_name}",
        "maze": sim.maze,
        "start": sim.start_pos,
        "end": sim.end_pos
    }

@app.post("/simulation/step")
def simulation_step():
    global sim
    if not sim:
        raise HTTPException(status_code=400, detail="Simulation not started")
        
    # Run full generation until completion or max steps
    while sim.run_step():
        pass
        
    # Evaluate fitness
    sim.evaluate_fitness()
    best_agent = sim.get_best_agent()
    stats = {
        "generation": sim.generation,
        "max_fitness": best_agent.fitness,
        "reached_goal": sum(1 for i in sim.insects if i.reached_goal)
    }
    
    population_data = sim.get_population_data()
    
    # Evolve next generation
    new_insects = evo.next_generation(sim.insects, sim.start_pos[0], sim.start_pos[1])
    sim.insects = new_insects
    sim.generation += 1
    sim.current_step = 0
    
    return {
        "stats": stats,
        "population": population_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
