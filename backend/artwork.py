from pydantic import BaseModel, Field
from typing import List, Tuple

# Define um único vértice, uma tupla de dois inteiros (x, y)
Vertex = Tuple[int, int]

# Define uma cor, uma tupla de 4 inteiros (R, G, B, Alpha)
Color = Tuple[int, int, int, int]

class Polygon(BaseModel):
    """Representa um único polígono com uma cor e uma lista de vértices."""
    color: Color
    vertices: List[Vertex]

class Artwork(BaseModel):
    """Representa uma obra de arte, que é uma coleção de polígonos."""
    polygons: List[Polygon]