
import numpy as np

class Insect:
    def __init__(self, maze_shape):
        self.input_size = 8  # 8 sensors
        self.output_size = 4  # 4 directions
        self.weights = np.random.rand(self.input_size, self.output_size)
        self.position = None
        self.fitness = 0.0

    def sense(self, maze):
        if self.position is None:
            return np.zeros(self.input_size)

        directions = [
            (-1, 0), (-1, 1), (0, 1), (1, 1),
            (1, 0), (1, -1), (0, -1), (-1, -1)
        ]
        sensor_data = np.zeros(self.input_size)

        for i, (dx, dy) in enumerate(directions):
            dist = 1
            x, y = self.position
            while True:
                nx, ny = x + dx * dist, y + dy * dist
                if not (0 <= nx < maze.shape[0] and 0 <= ny < maze.shape[1] and maze[nx, ny] == 0):
                    break
                dist += 1
            sensor_data[i] = 1.0 / dist

        return sensor_data

    def move(self, maze):
        if self.position is None:
            return

        sensor_data = self.sense(maze)
        output = np.dot(sensor_data, self.weights)
        direction_index = np.argmax(output)

        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Up, Down, Left, Right
        dx, dy = moves[direction_index]
        
        new_x, new_y = self.position[0] + dx, self.position[1] + dy

        if 0 <= new_x < maze.shape[0] and 0 <= new_y < maze.shape[1] and maze[new_x, new_y] == 0:
            self.position = (new_x, new_y)

    def calculate_fitness(self, end_pos):
        if self.position is None:
            self.fitness = 0.0
            return

        distance = np.sqrt((self.position[0] - end_pos[0])**2 + (self.position[1] - end_pos[1])**2)
        self.fitness = 1.0 / (1.0 + distance)
        if distance < 1:
            self.fitness *= 10 # Bonus for reaching the end

