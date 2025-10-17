
import numpy as np
from agent import Insect
from evolution import evolve

class Simulation:
    def __init__(self, maze_name, population_size=100, max_steps=100):
        self.maze, self.start_pos, self.end_pos = self.load_maze(f"..\\mazes\\{maze_name}.txt")
        self.population_size = population_size
        self.max_steps = max_steps
        self.generation = 0
        self.population = [Insect(self.maze.shape) for _ in range(self.population_size)]

    def load_maze(self, file_path):
        with open(file_path, 'r') as f:
            lines = f.read().splitlines()
        
        max_len = max(len(line) for line in lines)
        maze = np.zeros((len(lines), max_len))
        start_pos, end_pos = None, None

        for r, row in enumerate(lines):
            for c, char in enumerate(row):
                if char == '#':
                    maze[r, c] = 1  # Wall
                elif char == 'S':
                    start_pos = (r, c)
                elif char == 'E':
                    end_pos = (r, c)
        return maze, start_pos, end_pos

    def run_generation(self):
        paths = []
        for insect in self.population:
            insect.position = self.start_pos
            path = [self.start_pos]
            for _ in range(self.max_steps):
                insect.move(self.maze)
                path.append(insect.position)
                if insect.position == self.end_pos:
                    break
            insect.calculate_fitness(self.end_pos)
            paths.append(path)
        
        best_insect = max(self.population, key=lambda x: x.fitness)
        
        stats = {
            'generation': self.generation,
            'best_fitness': best_insect.fitness,
            'success_rate': sum(1 for i in self.population if i.position == self.end_pos) / self.population_size
        }

        self.population = evolve(self.population, self.maze.shape)
        self.generation += 1
        
        return paths, stats
