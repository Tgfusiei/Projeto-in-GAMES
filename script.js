const API_KEY = '5fe08bb7bde44a3689876c213ca8dff3';

const btnSearch = document.getElementById('btn-search');
const gameSearchInput = document.getElementById('game-search');
const gamesList = document.getElementById('games-list');
const resultContainer = document.getElementById('result-container');

// Autocompletar dinamico enquanto digita
gameSearchInput.addEventListener('input', async () => {
  const termo = gameSearchInput.value.trim();
  if (termo.length < 3) return;

  try {
    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(termo)}&page_size=5`);
    const data = await response.json();

    gamesList.innerHTML = '';
    data.results.forEach(jogo => {
      const option = document.createElement('option');
      option.value = jogo.name;
      gamesList.appendChild(option);
    });
  } catch (error) {
    console.error("Erro nas sugestões:", error);
  }
});

// Busca ao clicar no botão
btnSearch.addEventListener('click', () => {
  const nomeJogo = gameSearchInput.value.trim();
  if (nomeJogo) {
    verificarJogo(nomeJogo);
  } else {
    alert("Digite o nome de um jogo!");
  }
});

// Busca ao pressionar Enter
gameSearchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    btnSearch.click();
  }
});

async function verificarJogo(nomeJogo) {
  try {
    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(nomeJogo)}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert("Jogo não encontrado!");
      return;
    }

    const jogo = data.results.find(g => g.name.toLowerCase() === nomeJogo.toLowerCase()) || data.results[0];

    const reqResponse = await fetch(`https://api.rawg.io/api/games/${jogo.id}?key=${API_KEY}`);
    const jogoDetalhes = await reqResponse.json();

    const pcPlatform = jogoDetalhes.platforms?.find(p => p.platform.id === 4);
    const reqText = pcPlatform?.requirements?.minimum || "Requisitos mínimos não informados para este jogo.";

    document.getElementById('game-title').innerText = jogo.name;
    document.getElementById('game-image').src = jogo.background_image || '';
    document.getElementById('game-requirements').innerText = reqText;

    const userRam = parseInt(document.getElementById('ram').value) || 0;
    const matchRam = reqText.match(/(\d+)\s*GB\s*RAM/i) || reqText.match(/(\d+)\s*GB/i);
    const requiredRam = matchRam ? parseInt(matchRam[1]) : 4;

    const badge = document.getElementById('status-badge');
    if (userRam >= requiredRam) {
      badge.innerText = "🟢 RODA NO SEU PC";
      badge.className = "badge success";
    } else {
      badge.innerText = `🔴 NÃO RODA (Exige no mínimo ${requiredRam}GB de RAM)`;
      badge.className = "badge danger";
    }

    resultContainer.classList.remove('hidden');

  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    alert("Erro ao conectar com a API do RAWG.");
  }
}