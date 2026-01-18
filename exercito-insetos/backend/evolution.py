import numpy as np
from .agent import Insect
import random

class Evolution:
    def __init__(self, mutation_rate=0.05):
        self.mutation_rate = mutation_rate

    def selection(self, population):
        # Tournament selection
        tournament_size = 5
        competitors = random.sample(population, tournament_size)
        winner = max(competitors, key=lambda i: i.fitness)
        return winner

    def crossover(self, parent1, parent2):
        dna1 = parent1.get_dna()
        dna2 = parent2.get_dna()
        
        # Crossover weights1
        w1_shape = dna1[0].shape
        mask1 = np.random.rand(*w1_shape) > 0.5
        new_w1 = np.where(mask1, dna1[0], dna2[0])
        
        # Crossover weights2
        w2_shape = dna1[1].shape
        mask2 = np.random.rand(*w2_shape) > 0.5
        new_w2 = np.where(mask2, dna1[1], dna2[1])
        
        return (new_w1, new_w2)

    def mutate(self, dna):
        w1, w2 = dna
        
        # Mutate w1
        mutation_mask1 = np.random.rand(*w1.shape) < self.mutation_rate
        noise1 = np.random.normal(0, 0.5, w1.shape)
        w1 += mutation_mask1 * noise1
        
        # Mutate w2
        mutation_mask2 = np.random.rand(*w2.shape) < self.mutation_rate
        noise2 = np.random.normal(0, 0.5, w2.shape)
        w2 += mutation_mask2 * noise2
        
        return (w1, w2)

    def next_generation(self, current_population, start_x, start_y):
        new_population = []
        pop_size = len(current_population)
        
        # Elitism: Keep best agent
        best = max(current_population, key=lambda i: i.fitness)
        new_population.append(Insect(start_x, start_y, best.get_dna()))
        
        while len(new_population) < pop_size:
            p1 = self.selection(current_population)
            p2 = self.selection(current_population)
            
            child_dna = self.crossover(p1, p2)
            child_dna = self.mutate(child_dna)
            
            new_population.append(Insect(start_x, start_y, child_dna))
            
        return new_population
