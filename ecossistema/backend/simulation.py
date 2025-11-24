import numpy as np
import random
from .agents import Prey, Predator
from .evolution import Evolution

class Simulation:
    def __init__(self, width=800, height=600, n_prey=20, n_predators=5):
        self.width = width
        self.height = height
        self.n_prey = n_prey
        self.n_predators = n_predators
        
        self.prey = []
        self.predators = []
        self.food = []
        self.food_spawn_rate = 0.1
        self.max_food = 50
        
        self.generation = 1
        self.steps = 0
        self.max_steps_per_gen = 2000
        
        self.evolution = Evolution(mutation_rate=0.1)
        
        self.reset()

    def reset(self):
        self.prey = [Prey(random.uniform(0, self.width), random.uniform(0, self.height)) for _ in range(self.n_prey)]
        self.predators = [Predator(random.uniform(0, self.width), random.uniform(0, self.height)) for _ in range(self.n_predators)]
        self.food = []
        for _ in range(20):
            self.spawn_food()
        self.steps = 0

    def spawn_food(self):
        if len(self.food) < self.max_food:
            self.food.append(np.array([random.uniform(0, self.width), random.uniform(0, self.height)]))

    def update(self):
        if self.steps >= self.max_steps_per_gen:
            self.evolve()
            return

        self.steps += 1
        
        # Spawn food
        if random.random() < self.food_spawn_rate:
            self.spawn_food()

        # Update Prey
        for p in self.prey:
            if not p.alive: continue
            
            # Find closest predator
            closest_pred = None
            min_dist = float('inf')
            for pred in self.predators:
                if not pred.alive: continue
                dist = np.linalg.norm(p.position - pred.position)
                if dist < min_dist:
                    min_dist = dist
                    closest_pred = pred
            
            # Find closest food
            closest_food = None
            min_dist_food = float('inf')
            for f in self.food:
                dist = np.linalg.norm(p.position - f)
                if dist < min_dist_food:
                    min_dist_food = dist
                    closest_food = f
            
            p.think(closest_pred, closest_food)
            p.update(self.width, self.height)
            
            # Eat food
            # Check collision with food
            # Simple collision check
            for i in range(len(self.food) - 1, -1, -1):
                if np.linalg.norm(p.position - self.food[i]) < p.radius + 5:
                    p.eat()
                    self.food.pop(i)

        # Update Predators
        for pred in self.predators:
            if not pred.alive: continue
            
            # Find closest prey
            closest_prey = None
            min_dist = float('inf')
            for p in self.prey:
                if not p.alive: continue
                dist = np.linalg.norm(pred.position - p.position)
                if dist < min_dist:
                    min_dist = dist
                    closest_prey = p
            
            pred.think(closest_prey)
            pred.update(self.width, self.height)
            
            # Eat Prey
            if closest_prey and min_dist < pred.radius + closest_prey.radius:
                pred.eat()
                closest_prey.alive = False

        # Remove dead agents? No, keep them for stats until end of gen?
        # Actually, we can just ignore them in update loop (which we do)

    def evolve(self):
        print(f"Evolving Generation {self.generation}")
        
        # Evolve Prey
        self.prey = self.evolution.next_generation(self.prey, Prey, self.n_prey, self.width, self.height)
        
        # Evolve Predators
        self.predators = self.evolution.next_generation(self.predators, Predator, self.n_predators, self.width, self.height)
        
        self.generation += 1
        self.steps = 0
        self.food = [] # Reset food? Or keep it? Let's reset to fair start
        for _ in range(20):
            self.spawn_food()

    def get_state(self):
        return {
            "generation": self.generation,
            "steps": self.steps,
            "prey": [p.get_state() for p in self.prey if p.alive],
            "predators": [p.get_state() for p in self.predators if p.alive],
            "food": [{"x": float(f[0]), "y": float(f[1])} for f in self.food]
        }

    def get_stats(self):
        # Calculate avg fitness
        avg_fitness_prey = np.mean([p.fitness for p in self.prey]) if self.prey else 0
        avg_fitness_pred = np.mean([p.fitness for p in self.predators]) if self.predators else 0
        
        return {
            "generation": self.generation,
            "prey_count": len([p for p in self.prey if p.alive]),
            "predator_count": len([p for p in self.predators if p.alive]),
            "avg_fitness_prey": float(avg_fitness_prey),
            "avg_fitness_pred": float(avg_fitness_pred)
        }
