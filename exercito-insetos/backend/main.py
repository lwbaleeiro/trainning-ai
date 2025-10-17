
from fastapi import FastAPI
from simulation import Simulation

app = FastAPI()

simulations = {}

@app.get("/simulation/start/{maze_name}")
def start_simulation(maze_name: str):
    simulations[maze_name] = Simulation(maze_name)
    return {"message": f"Simulation for maze '{maze_name}' started."}

@app.get("/simulation/generation_data/{maze_name}")
def get_generation_data(maze_name: str):
    if maze_name not in simulations:
        return {"error": "Simulation not started for this maze."}
    
    sim = simulations[maze_name]
    paths, stats = sim.run_generation()
    
    # Convert paths to a serializable format
    serializable_paths = [[list(pos) for pos in path] for path in paths]

    return {"paths": serializable_paths, "stats": stats}

@app.get("/simulation/stats/{maze_name}")
def get_stats(maze_name: str):
    if maze_name not in simulations:
        return {"error": "Simulation not started for this maze."}
    
    sim = simulations[maze_name]
    best_insect = max(sim.population, key=lambda x: x.fitness)
    stats = {
        'generation': sim.generation,
        'best_fitness': best_insect.fitness,
        'success_rate': sum(1 for i in sim.population if i.position == sim.end_pos) / sim.population_size
    }
    return stats


@app.get("/simulation/maze/{maze_name}")
def get_maze(maze_name: str):
    if maze_name not in simulations:
        return {"error": "Simulation not started for this maze."}
    
    sim = simulations[maze_name]
    return {"maze": sim.maze.tolist(), "start": sim.start_pos, "end": sim.end_pos}

@app.get("/agent/{maze_name}/{agent_id}")

def get_agent_details(maze_name: str, agent_id: int):
    if maze_name not in simulations:
        return {"error": "Simulation not started for this maze."}
    
    sim = simulations[maze_name]
    if agent_id >= len(sim.population):
        return {"error": "Agent ID out of bounds."}
        
    agent = sim.population[agent_id]
    return {"weights": agent.weights.tolist()}
