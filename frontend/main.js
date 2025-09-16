document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const targetImageElem = document.getElementById('target-image');
    const generatedImageElem = document.getElementById('generated-artwork');
    const generationSpan = document.getElementById('generation');
    const bestFitnessSpan = document.getElementById('best-fitness');
    const avgErrorSpan = document.getElementById('avg-error'); // Corrigido para avg-error

    // Configurações da API
    const API_URL = 'http://localhost:8080'; // A porta que o usuário confirmou

    // Estado da Simulação
    let simulationInterval = null;

    // --- Funções de Interação com a API ---

    async function fetchNextGeneration() {
        try {
            const response = await fetch(`${API_URL}/evolution/next_generation`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error("Falha ao buscar a próxima geração:", error);
            stopSimulation(); // Para a simulação se houver um erro
            alert("Erro ao processar a geração. A simulação foi interrompida.");
        }
    }

    // --- Funções de Controle da Simulação ---

    async function startSimulation() {
        console.log('Iniciando simulação...');
        startBtn.disabled = true;
        startBtn.textContent = 'Rodando...';

        try {
            // 1. Pega a imagem alvo para exibir
            const targetResponse = await fetch(`${API_URL}/target_image`);
            const targetData = await targetResponse.json();
            targetImageElem.src = `data:image/png;base64,${targetData.image}`;

            // 2. Inicia a evolução no backend
            await fetch(`${API_URL}/evolution/start`, { method: 'POST' });
            console.log('Backend iniciado.');

            // 3. Inicia o loop de busca por novas gerações
            stopBtn.disabled = false;
            simulationInterval = setInterval(fetchNextGeneration, 200); // Pede uma nova geração a cada 200ms

        } catch (error) {
            console.error("Falha ao iniciar a simulação:", error);
            alert("Não foi possível iniciar a simulação. Verifique se o backend está rodando na porta correta.");
            startBtn.disabled = false;
            startBtn.textContent = 'Iniciar';
        }
    }

    function stopSimulation() {
        console.log('Parando simulação...');
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
        startBtn.disabled = false;
        startBtn.textContent = 'Iniciar';
        stopBtn.disabled = true;
    }

    // --- Função de Atualização da UI ---

    function updateUI(data) {
        generationSpan.textContent = data.generation;
        bestFitnessSpan.textContent = data.best_fitness.toFixed(5);
        // O backend retorna average_fitness, vamos usar isso
        avgErrorSpan.textContent = data.average_fitness.toFixed(5);
        generatedImageElem.src = `data:image/png;base64,${data.best_artwork_image}`;
    }

    // --- Event Listeners ---

    startBtn.addEventListener('click', startSimulation);
    stopBtn.addEventListener('click', stopSimulation);
});
