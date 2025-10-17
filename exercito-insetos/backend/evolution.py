
import numpy as np
from agent import Insect

def evolve(population, maze_shape, mutation_rate=0.01):
    sorted_population = sorted(population, key=lambda x: x.fitness, reverse=True)

    next_generation = []

    # Elitism: Keep the best 20% of the population
    elite_size = int(len(sorted_population) * 0.2)
    next_generation.extend(sorted_population[:elite_size])

    # Crossover
    crossover_size = len(population) - elite_size
    for _ in range(crossover_size):
        parent1 = np.random.choice(sorted_population[:elite_size])
        parent2 = np.random.choice(sorted_population[:elite_size])
        
        child = Insect(maze_shape)
        
        # Perform crossover on weights
        split_point = np.random.randint(child.weights.shape[1])
        child.weights[:, :split_point] = parent1.weights[:, :split_point]
        child.weights[:, split_point:] = parent2.weights[:, split_point:]

        # Mutation
        if np.random.rand() < mutation_rate:
            mutation = (np.random.rand(*child.weights.shape) - 0.5) * 0.1
            child.weights += mutation

        next_generation.append(child)

    return next_generation
