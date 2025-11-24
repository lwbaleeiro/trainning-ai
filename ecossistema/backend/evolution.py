import numpy as np
import random
import copy
from .agents import Prey, Predator

class Evolution:
    def __init__(self, mutation_rate=0.1):
        self.mutation_rate = mutation_rate

    def next_generation(self, old_agents, agent_class, population_size, width, height):
        # 1. Calculate Fitness (already done in agents, but we can normalize if needed)
        # Filter out dead agents if we want, or keep them with low fitness?
        # Usually we take the best performing ones.
        
        # If no agents survived, create random ones
        if not old_agents:
            return [agent_class(random.uniform(0, width), random.uniform(0, height)) for _ in range(population_size)]

        # Sort by fitness
        old_agents.sort(key=lambda x: x.fitness, reverse=True)
        
        # Elitism: Keep top %?
        # Let's just select parents based on fitness probability
        
        new_agents = []
        
        # Elitism: Keep best 2
        new_agents.append(self.clone_agent(old_agents[0], width, height))
        if len(old_agents) > 1:
            new_agents.append(self.clone_agent(old_agents[1], width, height))
            
        while len(new_agents) < population_size:
            parent1 = self.select_parent(old_agents)
            parent2 = self.select_parent(old_agents)
            
            child = self.crossover(parent1, parent2, agent_class, width, height)
            child.brain.mutate(self.mutation_rate)
            new_agents.append(child)
            
        return new_agents

    def select_parent(self, agents):
        # Tournament selection
        tournament_size = 3
        tournament = random.sample(agents, min(len(agents), tournament_size))
        return max(tournament, key=lambda x: x.fitness)

    def crossover(self, parent1, parent2, agent_class, width, height):
        child = agent_class(random.uniform(0, width), random.uniform(0, height))
        
        # Crossover weights
        # Simple average or random pick? Let's do random pick per weight matrix
        if random.random() < 0.5:
            child.brain.weights_ih = parent1.brain.weights_ih.copy()
        else:
            child.brain.weights_ih = parent2.brain.weights_ih.copy()
            
        if random.random() < 0.5:
            child.brain.weights_ho = parent1.brain.weights_ho.copy()
        else:
            child.brain.weights_ho = parent2.brain.weights_ho.copy()
            
        # Biases
        if random.random() < 0.5:
            child.brain.bias_h = parent1.brain.bias_h.copy()
        else:
            child.brain.bias_h = parent2.brain.bias_h.copy()
            
        if random.random() < 0.5:
            child.brain.bias_o = parent1.brain.bias_o.copy()
        else:
            child.brain.bias_o = parent2.brain.bias_o.copy()
            
        return child

    def clone_agent(self, agent, width, height):
        # Create new agent with same brain but reset state
        new_agent = type(agent)(random.uniform(0, width), random.uniform(0, height))
        new_agent.brain = agent.brain.copy()
        return new_agent
