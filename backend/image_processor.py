import numpy as np
from PIL import Image, ImageDraw

from artwork import Artwork

# Carrega a imagem alvo e a converte para um formato que facilita a comparação
target_image_cache = None
def load_target_image(path: str) -> Image.Image:
    """Carrega a imagem alvo do caminho especificado e a armazena em cache."""
    global target_image_cache
    if target_image_cache is None:
        print(f"Carregando imagem alvo de: {path}")
        target_image_cache = Image.open(path).convert("RGBA")
    return target_image_cache

def render_artwork(artwork: Artwork, width: int, height: int) -> Image.Image:
    """Renderiza uma obra de arte em uma nova imagem Pillow."""
    # Cria uma imagem em branco com fundo preto
    image = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(image, "RGBA")

    for p in artwork.polygons:
        # O método polygon do Pillow precisa de uma lista simples de coordenadas, ex: [x1, y1, x2, y2, ...]
        flat_vertices = [coord for vertex in p.vertices for coord in vertex]
        draw.polygon(flat_vertices, fill=p.color)
    
    return image

def calculate_fitness(rendered_image: Image.Image, target_image: Image.Image) -> float:
    """
    Calcula a fitness comparando duas imagens.
    A fitness é o inverso do Erro Quadrático Médio (MSE).
    """
    # Converte as imagens para arrays NumPy para cálculo eficiente
    rendered_arr = np.array(rendered_image, dtype=np.float32)
    target_arr = np.array(target_image, dtype=np.float32)

    # Calcula a diferença de quadrados e depois a média
    error = np.sum((rendered_arr - target_arr) ** 2)
    mse = error / (rendered_image.width * rendered_image.height)

    # A fitness é o inverso do erro. Adicionamos 1 para evitar divisão por zero.
    fitness = 1.0 / (1.0 + mse)

    return fitness