
# Projeto: Artista Genético - Evoluindo uma Imagem

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8080 
```

## 1. Visão Geral

Este projeto utiliza um algoritmo genético para recriar uma imagem alvo a partir de uma coleção de polígonos semitransparentes. Cada "indivíduo" da população é uma obra de arte, definida por um conjunto de genes que representam as propriedades desses polígonos. A evolução busca otimizar a sobreposição desses polígonos para que a imagem resultante seja o mais parecida possível com a imagem original. É uma demonstração visual e artística do poder dos algoritmos evolutivos.

## 2. Componentes do Backend (Python)

- **Framework:** FastAPI
- **Bibliotecas Principais:**
  - **Pillow (PIL):** Para carregar a imagem alvo, renderizar os polígonos em uma nova imagem e comparar as duas.
  - **NumPy:** Para cálculos de diferença de imagem eficientes.

### 2.1. O Indivíduo (Artwork)
- Um indivíduo não é um agente, mas sim uma representação de uma obra de arte.
- É composto por uma lista de `N` polígonos (ex: 50 a 250 polígonos).
- **Gene do Polígono:** Cada polígono é definido por:
  - **Cor:** RGBA (Vermelho, Verde, Azul, Alfa/Transparência) - 4 valores.
  - **Vértices:** Uma lista de `M` pontos (x, y) que definem a forma do polígono - `M*2` valores.
- O "genoma" completo de um indivíduo é uma longa lista de números que descrevem todos os polígonos.

### 2.2. O Motor de Evolução (Genetic Algorithm)
1.  **Inicialização:** Carrega a imagem alvo. Cria uma população inicial de indivíduos, cada um com um conjunto de polígonos gerados aleatoriamente (cores, formas e posições aleatórias).
2.  **Avaliação (Fitness):** Esta é a etapa mais crítica e computacionalmente intensiva.
    a. Para cada indivíduo, crie uma imagem em branco do mesmo tamanho da imagem alvo.
    b. Desenhe (renderize) todos os seus polígonos nessa imagem em branco usando a biblioteca Pillow.
    c. Compare a imagem renderizada com a imagem alvo, pixel por pixel. Uma boa métrica de diferença é o Erro Quadrático Médio (Mean Squared Error - MSE) entre os valores de cor dos pixels.
    d. A fitness é o inverso da diferença: `Fitness = 1 / (1 + MSE)`.
3.  **Seleção:** Seleciona os indivíduos com maior fitness (menor erro) para serem pais.
4.  **Reprodução (Crossover):** Cria um novo indivíduo (filho) combinando as listas de polígonos de dois pais. Por exemplo, metade dos polígonos vem do pai A e a outra metade do pai B.
5.  **Mutação:** Aplica pequenas e aleatórias modificações nos genes do filho. É crucial ter várias taxas de mutação:
    - **Mutação Forte (baixa probabilidade):** Adicionar ou remover um polígono inteiro.
    - **Mutação Média (média probabilidade):** Mudar drasticamente um polígono (nova cor/posição).
    - **Mutação Fina (alta probabilidade):** Ajustar levemente um valor (mudar um pouco a cor, deslocar um vértice).
6.  **Repetição:** A nova geração substitui a antiga (ou uma parte dela - Elitismo, onde os melhores sempre sobrevivem) e o ciclo recomeça.

### 2.3. API Endpoints
- `POST /evolution/start`: Carrega a imagem alvo e inicializa a simulação.
- `GET /evolution/next_generation`: Executa um ciclo de evolução completo (avaliação, seleção, reprodução, mutação) e retorna o resultado.
- `GET /evolution/best_artwork`: Retorna a imagem do indivíduo com a melhor fitness da geração atual. A imagem deve ser codificada em Base64 para ser facilmente usada no frontend.
- `GET /evolution/stats`: Retorna estatísticas: número da geração, melhor fitness, erro médio, etc.
- `GET /evolution/target_image`: Retorna a imagem alvo original (também em Base64).

## 3. Componentes do Frontend (HTML/JS)

- **Framework:** Vanilla JavaScript (não há necessidade de bibliotecas complexas de renderização como p5.js para a visualização principal).

### 3.1. Visualização Principal
- Uma área de exibição principal dividida em duas:
  - Um elemento `<img>` à esquerda para mostrar a "Melhor Obra da Geração".
  - Um elemento `<img>` à direita para mostrar a "Imagem Alvo".
- O JavaScript irá atualizar o atributo `src` da imagem da obra de arte a cada geração, usando o formato de dados Base64 retornado pela API.
  - `imgElement.src = "data:image/png;base64," + base64Data;`

### 3.2. Painel de Controle e Informações
- **Botões:**
  - "Iniciar Simulação"
  - "Próxima Geração" (pode ser um loop automático)
  - "Pausar"
- **Exibição de Estatísticas:**
  - Geração #
  - Melhor Fitness
  - Erro Médio da População

## 4. Estrutura de Arquivos Sugerida

```
.
├── ARTISTA_GENETICO.md
├── assets/                     # Imagens a serem usadas como alvo
│   └── target.png
├── backend/
│   ├── main.py                 # Servidor FastAPI e endpoints
│   ├── evolution_engine.py     # Lógica do Algoritmo Genético
│   ├── artwork.py              # Classe para Indivíduo/Artwork e Polígono
│   └── image_processor.py      # Renderização com Pillow e cálculo de fitness
└── frontend/
    ├── index.html
    ├── style.css
    └── main.js                 # Lógica de interação e chamadas de API
```
