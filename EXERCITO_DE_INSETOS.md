
# Projeto: Exército de Insetos - Aprendendo a Navegar em Labirintos

## 1. Visão Geral

O objetivo deste projeto é treinar uma população de agentes ("insetos") para encontrar a saída de um labirinto 2D. Cada inseto é controlado por uma rede neural que interpreta dados de sensores de proximidade para decidir sua movimentação. Através de um algoritmo genético, os insetos mais bem-sucedidos em explorar o labirinto e se aproximar da saída passam seus "genes" (pesos da rede neural) para a próxima geração, resultando em uma evolução de estratégias de navegação.

## 2. Componentes do Backend (Python)

- **Framework:** FastAPI
- **Bibliotecas Principais:** NumPy

### 2.1. O Ambiente (Environment)
- **Labirinto:** Representado por uma matriz 2D (grid), onde cada célula pode ser um caminho (`0`) ou uma parede (`1`).
- O labirinto terá um ponto de partida e um ponto de chegada definidos.
- Pode ser carregado a partir de um arquivo de texto ou ter configurações pré-definidas.

### 2.2. Os Agentes (Insects)
- **Classe `Insect`:**
  - Atributos: Posição no grid, rede neural.
  - **Sensores:** Antes de cada movimento, o inseto usa "sensores" (ray-casting simples no grid) para medir a distância até a parede mais próxima em várias direções (ex: 8 direções: Norte, Nordeste, Leste, etc.).
  - **Rede Neural (Inputs):**
    - As 8 distâncias medidas pelos sensores.
  - **Rede Neural (Outputs):**
    - 4 neurônios de saída, um para cada direção de movimento (Cima, Baixo, Esquerda, Direita). A direção com o maior valor de ativação é a escolhida.
  - **Fitness:** A principal métrica de sucesso. Pode ser calculada como o inverso da distância euclidiana da posição final do inseto até a saída do labirinto. `Fitness = 1 / (1 + distancia_ate_saida)`. Insetos que chegam à saída recebem um bônus massivo de fitness, possivelmente com um bônus adicional por usarem menos passos.

### 2.3. O Motor de Evolução (Genetic Algorithm)
1.  **Inicialização:** Cria uma população inicial de insetos com redes neurais de pesos aleatórios.
2.  **Simulação:** Para cada inseto na população:
    a. Coloque-o no ponto de partida do labirinto.
    b. Deixe-o se mover por um número máximo de passos. Em cada passo, os sensores leem o ambiente e a rede neural decide o movimento.
    c. Registre sua posição final.
3.  **Avaliação (Fitness):** Calcule a fitness de cada inseto com base em sua posição final.
4.  **Seleção, Reprodução e Mutação:** O processo padrão de GA é aplicado para criar a próxima geração de insetos.
5.  **Repetição:** A nova geração substitui a antiga e o ciclo recomeça.

### 2.4. API Endpoints
- `GET /simulation/start/{maze_name}`: Inicia a simulação com um labirinto específico.
- `GET /simulation/generation_data`: Roda uma geração inteira e retorna os dados, como o caminho percorrido por cada inseto.
- `GET /simulation/stats`: Retorna estatísticas (geração, melhor fitness, % de sucesso, etc.).
- `GET /agent/{agent_id}`: Retorna detalhes da rede neural de um inseto específico.

## 3. Componentes do Frontend (HTML/JS)

- **Biblioteca Gráfica:** p5.js

### 3.1. Visualização Principal
- Um canvas renderiza o grid do labirinto (paredes em uma cor, caminhos em outra).
- O ponto de partida e chegada são destacados.
- A animação pode mostrar todos os insetos da geração atual se movendo simultaneamente.
- O caminho do melhor inseto da geração anterior pode ser mantido na tela para referência (ex: em uma cor diferente).

### 3.2. Interatividade
- Um menu dropdown para selecionar diferentes labirintos para resolver.
- Clicar em um caminho de inseto pode destacar e mostrar os detalhes daquele agente.

### 3.3. Painel de Informações
- Exibe as estatísticas da geração.
- Exibe a rede neural do melhor inseto da geração ou de um inseto selecionado.
- Botões para iniciar a evolução e passar para a próxima geração.

## 4. Estrutura de Arquivos Sugerida

```
.
├── EXERCITO_DE_INSETOS.md
├── mazes/             # Arquivos de texto definindo os labirintos
│   ├── easy.txt
│   └── hard.txt
├── backend/
│   ├── main.py
│   ├── simulation.py
│   ├── agent.py
│   └── evolution.py
└── frontend/
    ├── index.html
    ├── style.css
    └── sketch.js
```
