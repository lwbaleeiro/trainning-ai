from .agent import Insect
import numpy as np

class Simulation:
    def __init__(self, maze_file, population_size=50):
        self.maze, self.start_pos, self.end_pos = self.load_maze(maze_file)
        self.population_size = population_size
        self.insects = [Insect(self.start_pos[0], self.start_pos[1]) for _ in range(population_size)]
        self.generation = 1
        self.max_steps = 200 # Max steps per generation
        self.current_step = 0

    def load_maze(self, maze_file):
        with open(maze_file, 'r') as f:
            lines = f.readlines()
        
        grid = []
        start = (0, 0)
        end = (0, 0)
        
        for y, line in enumerate(lines):
            row = []
            for x, char in enumerate(line.strip()):
                if char == '1':
                    row.append(1)
                elif char == '0':
                    row.append(0)
                elif char == 'S':
                    start = (x, y)
                    row.append(0)
                elif char == 'E':
                    end = (x, y)
                    row.append(0)
                else:
                    row.append(1) # Default to wall
            grid.append(row)
            
        return grid, start, end

    def run_step(self):
        active_insects = False
        for insect in self.insects:
            if not insect.is_dead and not insect.reached_goal:
                insect.move(self.maze)
                
                # Check goal
                if (insect.x, insect.y) == self.end_pos:
                    insect.reached_goal = True
                    
                active_insects = True
        
        self.current_step += 1
        return active_insects and self.current_step < self.max_steps

    def evaluate_fitness(self):
        for insect in self.insects:
            dist = np.sqrt((insect.x - self.end_pos[0])**2 + (insect.y - self.end_pos[1])**2)
            # Basic fitness: Closer is better
            score = 1.0 / (dist + 1.0)
            
            if insect.reached_goal:
                score *= 10.0 # Big bonus
                # Better if faster
                score += (1.0 / len(insect.path)) * 5.0
                
            if insect.is_dead:
                score *= 0.1 # Penalty
                
            insect.fitness = score
            
    def get_best_agent(self):
        best_agent = max(self.insects, key=lambda i: i.fitness)
        return best_agent

    def get_population_data(self):
        return [
            {
                "id": i,
                "x": agent.x,
                "y": agent.y,
                "is_dead": agent.is_dead,
                "reached_goal": agent.reached_goal,
                "path": agent.path
            }
            for i, agent in enumerate(self.insects)
        ]
