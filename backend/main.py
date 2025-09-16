import base64
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import image_processor
import evolution_engine

# --- Configuração e Estado Global ---

ASSETS_DIR = "../assets"
TARGET_IMAGE_PATH = f"{ASSETS_DIR}/target_2.png"

app = FastAPI()

# Estado da simulação (armazenado em memória)
state = {
    "target_image": None,
    "population": [],
    "generation": 0
}

# --- Middlewares ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints da API ---

@app.get("/")
def read_root():
    return {"message": "Artista Genético Backend"}

@app.get("/target_image")
def get_target_image():
    """Retorna a imagem alvo codificada em Base64."""
    try:
        with open(TARGET_IMAGE_PATH, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return {"image": encoded_string}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Imagem alvo não encontrada no servidor.")

@app.post("/evolution/start")
def start_evolution():
    """Inicia o processo de evolução, criando a população inicial."""
    print("Iniciando a evolução...")
    state["target_image"] = image_processor.load_target_image(TARGET_IMAGE_PATH)
    width, height = state["target_image"].size
    state["population"] = evolution_engine.create_initial_population(width, height)
    state["generation"] = 0
    print("População inicial criada.")
    return {"message": "Evolução iniciada com sucesso."}

@app.get("/evolution/next_generation")
def get_next_generation():
    """Executa um ciclo de geração e retorna a melhor obra de arte e estatísticas."""
    if not state["population"]:
        raise HTTPException(status_code=400, detail="A evolução não foi iniciada. Chame /evolution/start primeiro.")

    state["generation"] += 1
    print(f"Processando geração {state['generation']}...")

    # Roda o motor de evolução
    new_population, fitness_scores = evolution_engine.run_generation(
        state["population"],
        state["target_image"]
    )
    state["population"] = new_population

    # Pega o melhor indivíduo (o primeiro, pois a lista está ordenada)
    best_artwork = state["population"][0]
    best_fitness = fitness_scores[0]
    avg_fitness = sum(fitness_scores) / len(fitness_scores)

    # Renderiza a melhor obra de arte
    width, height = state["target_image"].size
    rendered_image = image_processor.render_artwork(best_artwork, width, height)

    # Converte a imagem para Base64 para enviar via JSON
    buffered = io.BytesIO()
    rendered_image.save(buffered, format="PNG")
    encoded_image = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "generation": state["generation"],
        "best_fitness": float(best_fitness),
        "average_fitness": float(avg_fitness),
        "best_artwork_image": encoded_image
    }
