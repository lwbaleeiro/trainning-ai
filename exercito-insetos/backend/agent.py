import numpy as np

class Insect:
    def __init__(self, x, y, dna=None):
        self.x = x
        self.y = y
        self.input_size = 8  # 8 directions
        self.hidden_size = 8
        self.output_size = 4 # Up, Down, Left, Right
        
        if dna is None:
            self.weights1 = np.random.uniform(-1, 1, (self.input_size, self.hidden_size))
            self.weights2 = np.random.uniform(-1, 1, (self.hidden_size, self.output_size))
        else:
            self.weights1, self.weights2 = dna
            
        self.fitness = 0.0
        self.is_dead = False
        self.reached_goal = False
        self.path = [(x, y)]

    def get_dna(self):
        return (self.weights1, self.weights2)

    def sense(self, maze):
        # Ray casting in 8 directions
        directions = [
            (0, -1), (1, -1), (1, 0), (1, 1),
            (0, 1), (-1, 1), (-1, 0), (-1, -1)
        ]
        readings = []
        
        for dx, dy in directions:
            dist = 0
            cx, cy = self.x, self.y
            
            # Max sight distance, e.g., 10 or until wall
            max_dist = 10
            found_wall = False
            
            for _ in range(max_dist):
                cx += dx
                cy += dy
                dist += 1
                
                # Check bounds
                if cx < 0 or cx >= len(maze[0]) or cy < 0 or cy >= len(maze):
                    found_wall = True
                    break
                
                # Check wall
                if maze[cy][cx] == 1:
                    found_wall = True
                    break
                    
            # Normalize reading (1 = close, 0 = far)
            readings.append(1.0 / dist if dist > 0 else 1.0)
            
        return np.array(readings)

    def think(self, inputs):
        # Simple feedforward
        hidden = np.tanh(np.dot(inputs, self.weights1))
        output = np.tanh(np.dot(hidden, self.weights2))
        return output

    def move(self, maze):
        if self.is_dead or self.reached_goal:
            return

        sensors = self.sense(maze)
        decision = self.think(sensors)
        
        # Determine direction: 0: Up, 1: Down, 2: Left, 3: Right
        move_idx = np.argmax(decision)
        
        dx, dy = 0, 0
        if move_idx == 0: dy = -1   # Up
        elif move_idx == 1: dy = 1  # Down
        elif move_idx == 2: dx = -1 # Left
        elif move_idx == 3: dx = 1  # Right
        
        new_x, new_y = self.x + dx, self.y + dy
        
        # Check collision
        if (new_x < 0 or new_x >= len(maze[0]) or 
            new_y < 0 or new_y >= len(maze) or 
            maze[new_y][new_x] == 1):
            self.is_dead = True # Hit a wall
        else:
            self.x = new_x
            self.y = new_y
            self.path.append((self.x, self.y))
