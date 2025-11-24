import numpy as np
import uuid
import math

class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Initialize weights with random values
        self.weights_ih = np.random.uniform(-1, 1, (self.hidden_size, self.input_size))
        self.weights_ho = np.random.uniform(-1, 1, (self.output_size, self.hidden_size))
        
        # Biases
        self.bias_h = np.random.uniform(-1, 1, (self.hidden_size, 1))
        self.bias_o = np.random.uniform(-1, 1, (self.output_size, 1))

    def forward(self, inputs):
        # Input to Hidden
        inputs = np.array(inputs).reshape(-1, 1)
        hidden = np.dot(self.weights_ih, inputs) + self.bias_h
        hidden = np.tanh(hidden)  # Activation function
        
        # Hidden to Output
        output = np.dot(self.weights_ho, hidden) + self.bias_o
        output = np.tanh(output)  # Activation function (outputs between -1 and 1)
        
        return output.flatten()

    def mutate(self, rate=0.1):
        def mutate_matrix(matrix):
            mutation_mask = np.random.rand(*matrix.shape) < rate
            mutation_values = np.random.normal(0, 0.1, matrix.shape)
            matrix[mutation_mask] += mutation_values[mutation_mask]
            # Clamp weights to keep them stable? Maybe not strictly necessary but good practice
            # matrix = np.clip(matrix, -1, 1) 
            return matrix

        self.weights_ih = mutate_matrix(self.weights_ih)
        self.weights_ho = mutate_matrix(self.weights_ho)
        self.bias_h = mutate_matrix(self.bias_h)
        self.bias_o = mutate_matrix(self.bias_o)

    def copy(self):
        new_nn = NeuralNetwork(self.input_size, self.hidden_size, self.output_size)
        new_nn.weights_ih = self.weights_ih.copy()
        new_nn.weights_ho = self.weights_ho.copy()
        new_nn.bias_h = self.bias_h.copy()
        new_nn.bias_o = self.bias_o.copy()
        return new_nn

class Agent:
    def __init__(self, x, y):
        self.id = str(uuid.uuid4())
        self.position = np.array([float(x), float(y)])
        self.velocity = np.random.uniform(-1, 1, 2)
        self.acceleration = np.zeros(2)
        self.max_speed = 4.0
        self.max_force = 0.2
        self.energy = 100.0
        self.alive = True
        self.age = 0
        self.radius = 10

    def apply_force(self, force):
        self.acceleration += force

    def update(self, width, height):
        if not self.alive:
            return

        self.velocity += self.acceleration
        
        # Limit speed
        speed = np.linalg.norm(self.velocity)
        if speed > self.max_speed:
            self.velocity = (self.velocity / speed) * self.max_speed
            
        self.position += self.velocity
        self.acceleration *= 0  # Reset acceleration
        
        # Boundaries (Wrap around)
        if self.position[0] > width: self.position[0] = 0
        if self.position[0] < 0: self.position[0] = width
        if self.position[1] > height: self.position[1] = 0
        if self.position[1] < 0: self.position[1] = height
        
        self.age += 1
        self.energy -= 0.1  # Metabolism

        if self.energy <= 0:
            self.alive = False

    def get_state(self):
        return {
            "id": self.id,
            "x": float(self.position[0]),
            "y": float(self.position[1]),
            "vx": float(self.velocity[0]),
            "vy": float(self.velocity[1]),
            "energy": self.energy,
            "alive": self.alive,
            "type": self.__class__.__name__
        }

class Prey(Agent):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.max_speed = 5.0
        self.brain = NeuralNetwork(4, 8, 2) # Inputs: Closest Predator (x,y), Closest Food (x,y)
        self.fitness = 0
        self.food_eaten = 0

    def think(self, closest_predator, closest_food):
        inputs = []
        
        # Vector to closest predator
        if closest_predator:
            d_pred = closest_predator.position - self.position
            # Normalize
            dist = np.linalg.norm(d_pred)
            if dist > 0:
                d_pred = d_pred / dist
            inputs.extend([d_pred[0], d_pred[1]])
        else:
            inputs.extend([0, 0])
            
        # Vector to closest food
        if closest_food is not None: # Food is just a position array usually
            d_food = closest_food - self.position
            dist = np.linalg.norm(d_food)
            if dist > 0:
                d_food = d_food / dist
            inputs.extend([d_food[0], d_food[1]])
        else:
            inputs.extend([0, 0])
            
        outputs = self.brain.forward(inputs)
        
        # Output is force vector
        force = np.array([outputs[0], outputs[1]])
        self.apply_force(force * self.max_force)

    def eat(self):
        self.energy += 20
        self.food_eaten += 1
        self.fitness += 10

class Predator(Agent):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.max_speed = 4.5
        self.brain = NeuralNetwork(2, 8, 2) # Inputs: Closest Prey (x,y)
        self.fitness = 0
        self.prey_eaten = 0
        self.radius = 15

    def think(self, closest_prey):
        inputs = []
        
        # Vector to closest prey
        if closest_prey:
            d_prey = closest_prey.position - self.position
            dist = np.linalg.norm(d_prey)
            if dist > 0:
                d_prey = d_prey / dist
            inputs.extend([d_prey[0], d_prey[1]])
        else:
            inputs.extend([0, 0])
            
        outputs = self.brain.forward(inputs)
        
        force = np.array([outputs[0], outputs[1]])
        self.apply_force(force * self.max_force)

    def eat(self):
        self.energy += 50
        self.prey_eaten += 1
        self.fitness += 20
