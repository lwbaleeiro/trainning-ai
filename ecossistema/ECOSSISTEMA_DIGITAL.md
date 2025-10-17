
# Projeto: Ecossistema Digital - A Co-evolução de Predadores e Presas

## 1. Visão Geral

Este projeto simula um ecossistema 2D onde duas populações de agentes, Predadores e Presas, co-evoluem. Ambas as populações são controladas por redes neurais individuais e seu "código genético" (os pesos da rede neural) é aprimorado a cada geração através de um algoritmo genético. O objetivo é observar o surgimento de comportamentos complexos de caça e fuga.

## 2. Componentes do Backend (Python)

- **Framework:** FastAPI
- **Bibliotecas Principais:** NumPy (para cálculos vetoriais).

### 2.1. O Ambiente (Environment)
- Um mundo 2D com dimensões fixas (ex: 800x600).
- As bordas podem ser mortais ou "teletransportar" o agente para o lado oposto.
- O ambiente contém "comida" para as presas, que reaparece periodicamente.

### 2.2. Os Agentes (Agents)
- **Classe Base `Agent`:**
  - Atributos: Posição, velocidade, energia/vida, rede neural.
- **Classe `Prey` (Presa):**
  - **Rede Neural (Inputs):**
    - Vetor de direção para a comida mais próxima.
    - Vetor de direção para o predador mais próximo.
    - Distância dos sensores de parede (opcional).
  - **Rede Neural (Outputs):**
    - Força de aceleração (x, y).
  - **Fitness:** Calculada com base no tempo sobrevivido + quantidade de comida ingerida.
- **Classe `Predator` (Predador):**
  - **Rede Neural (Inputs):**
    - Vetor de direção para a presa mais próxima.
  - **Rede Neural (Outputs):**
    - Força de aceleração (x, y).
  - **Fitness:** Calculada com base na quantidade de presas capturadas. A energia diminui com o tempo e aumenta ao capturar uma presa.

### 2.3. O Motor de Evolução (Genetic Algorithm)
1.  **Inicialização:** Cria uma população inicial de Predadores e Presas com redes neurais de pesos aleatórios.
2.  **Simulação:** Roda a simulação por um tempo determinado (uma "era"). Agentes se movem, interagem e suas ações são registradas.
3.  **Avaliação (Fitness):** Ao final da era, a fitness de cada agente que sobreviveu é calculada.
4.  **Seleção:** Indivíduos com maior fitness são selecionados como "pais" para a próxima geração (ex: método de torneio).
5.  **Reprodução (Crossover):** Os pesos das redes neurais dos pais são combinados para criar os filhos.
6.  **Mutação:** Uma pequena chance de alteração aleatória é aplicada aos pesos da rede neural dos filhos. Isso introduz novas "estratégias".
7.  **Repetição:** A nova geração substitui a antiga e o ciclo recomeça.

### 2.4. API Endpoints
- `GET /simulation/state`: Retorna o estado atual de todos os agentes e comida no ambiente (posições, etc.).
- `POST /simulation/start`: Inicia/reinicia a simulação.
- `GET /simulation/stats`: Retorna estatísticas da geração atual (número da geração, fitness média de predadores e presas, etc.).
- `GET /agent/{agent_id}`: Retorna detalhes de um agente específico, incluindo a estrutura e os pesos de sua rede neural.

## 3. Componentes do Frontend (HTML/JS)

- **Biblioteca Gráfica:** p5.js (ideal para desenho 2D e animações).

### 3.1. Visualização Principal
- Um canvas renderiza o ambiente 2D.
- Presas são desenhadas como círculos (ex: verdes).
- Predadores são desenhados como triângulos (ex: vermelhos).
- Comida é desenhada como pequenos pontos.
- A animação acontece em um loop que busca o estado mais recente do backend (`/simulation/state`) e redesenha a tela.

### 3.2. Interatividade
- Clicar em um agente o destaca.
- Ao ser destacado, o frontend busca os detalhes do agente (`/agent/{agent_id}`) e exibe sua rede neural.

### 3.3. Painel de Informações
- Exibe as estatísticas recebidas do backend (`/simulation/stats`).
- Mostra a rede neural do agente selecionado:
  - Neurônios de entrada, camadas ocultas e neurônios de saída.
  - As conexões (sinapses) são desenhadas como linhas. A cor/espessura da linha pode representar o peso (positivos em uma cor, negativos em outra).
- Botões para iniciar/pausar a simulação.

## 4. Estrutura de Arquivos Sugerida

```
.
├── ECOSSISTEMA_DIGITAL.md
├── backend/
│   ├── main.py         # Servidor FastAPI e endpoints
│   ├── simulation.py   # Lógica principal da simulação
│   ├── agents.py       # Definição das classes Agent, Prey, Predator
│   └── evolution.py    # Funções do Algoritmo Genético
└── frontend/
    ├── index.html      # Estrutura da página
    ├── style.css       # Estilos
    └── sketch.js       # Lógica de visualização com p5.js
```
