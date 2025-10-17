import random
import copy
from typing import List, Tuple

from PIL import Image

from artwork import Artwork, Polygon
import image_processor

# --- Constantes do Algoritmo Genético ---
POPULATION_SIZE = 20
NUM_POLYGONS = 50
MIN_VERTICES = 3
MAX_VERTICES = 6

# Taxas de Mutação
ADD_POLYGON_RATE = 0.02
REMOVE_POLYGON_RATE = 0.02
MUTATE_COLOR_RATE = 0.1
MUTATE_VERTICES_RATE = 0.1

# --- Funções de Criação ---

def create_random_polygon(width: int, height: int) -> Polygon:
    """Cria um único polígono com cor e vértices aleatórios."""
    num_vertices = random.randint(MIN_VERTICES, MAX_VERTICES)
    vertices = []
    for _ in range(num_vertices):
        vertices.append((random.randint(0, width), random.randint(0, height)))
    
    color = (
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(30, 100)
    )
    return Polygon(color=color, vertices=vertices)

def create_random_artwork(width: int, height: int) -> Artwork:
    """Cria uma obra de arte aleatória com um número fixo de polígonos."""
    polygons = [create_random_polygon(width, height) for _ in range(NUM_POLYGONS)]
    return Artwork(polygons=polygons)

def create_initial_population(width: int, height: int) -> List[Artwork]:
    """Cria a população inicial de obras de arte aleatórias."""
    return [create_random_artwork(width, height) for _ in range(POPULATION_SIZE)]

# --- Funções de Evolução ---

def crossover(parent1: Artwork, parent2: Artwork) -> Artwork:
    """Cria um filho combinando os polígonos de dois pais de tamanhos possivelmente diferentes."""
    child_polygons = []
    # Itera até o comprimento do menor dos pais para evitar erros de índice
    min_len = min(len(parent1.polygons), len(parent2.polygons))
    for i in range(min_len):
        if random.random() < 0.5:
            child_polygons.append(copy.deepcopy(parent1.polygons[i]))
        else:
            child_polygons.append(copy.deepcopy(parent2.polygons[i]))
    return Artwork(polygons=child_polygons)

def mutate(artwork: Artwork, width: int, height: int) -> Artwork:
    """Aplica mutações a uma obra de arte."""
    mutated_artwork = copy.deepcopy(artwork)

    # Adicionar um novo polígono
    if random.random() < ADD_POLYGON_RATE and len(mutated_artwork.polygons) < NUM_POLYGONS * 1.5:
        mutated_artwork.polygons.append(create_random_polygon(width, height))

    # Remover um polígono
    if random.random() < REMOVE_POLYGON_RATE and len(mutated_artwork.polygons) > NUM_POLYGONS * 0.5:
        if mutated_artwork.polygons:
            mutated_artwork.polygons.pop(random.randint(0, len(mutated_artwork.polygons) - 1))

    # Mutar polígonos existentes
    for polygon in mutated_artwork.polygons:
        if random.random() < MUTATE_COLOR_RATE:
            # Mutação de cor
            new_color = list(polygon.color)
            i = random.randint(0, 3)
            new_color[i] = max(0, min(255, new_color[i] + random.randint(-20, 20)))
            polygon.color = tuple(new_color)

        if random.random() < MUTATE_VERTICES_RATE:
            # Mutação de vértices
            new_vertices = list(polygon.vertices)
            i = random.randint(0, len(new_vertices) - 1)
            x, y = new_vertices[i]
            new_x = max(0, min(width, x + random.randint(-10, 10)))
            new_y = max(0, min(height, y + random.randint(-10, 10)))
            new_vertices[i] = (new_x, new_y)
            polygon.vertices = new_vertices

    return mutated_artwork

# --- Loop Principal da Geração ---

def run_generation(population: List[Artwork], target_image: Image.Image) -> Tuple[List[Artwork], List[float]]:
    """Executa um ciclo de geração completo: avaliação, seleção, crossover, mutação."""
    width, height = target_image.size

    # 1. Avaliação (Calcular Fitness)
    fitness_scores = []
    for artwork in population:
        rendered_image = image_processor.render_artwork(artwork, width, height)
        fitness = image_processor.calculate_fitness(rendered_image, target_image)
        fitness_scores.append(fitness)

    # Emparelha cada obra com sua pontuação
    population_with_fitness = list(zip(population, fitness_scores))

    # Ordena por fitness (maior primeiro)
    population_with_fitness.sort(key=lambda x: x[1], reverse=True)

    # 2. Seleção (Elitismo + Pais)
    new_population = []
    # Mantém os 2 melhores indivíduos (elitismo)
    new_population.append(copy.deepcopy(population_with_fitness[0][0]))
    new_population.append(copy.deepcopy(population_with_fitness[1][0]))

    # Seleciona os pais do resto da população para preencher o restante
    parents = [item[0] for item in population_with_fitness[:len(population_with_fitness)//2]]

    # 3. Crossover e Mutação
    while len(new_population) < POPULATION_SIZE:
        parent1 = random.choice(parents)
        parent2 = random.choice(parents)
        child = crossover(parent1, parent2)
        mutated_child = mutate(child, width, height)
        new_population.append(mutated_child)

    return new_population, fitness_scores