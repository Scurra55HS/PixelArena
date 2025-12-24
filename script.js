// ===== CONFIGURAÇÕES =====
const TAMANHO_ARENA = 10;

const arena = document.getElementById("arena");
const vidaEl = document.getElementById("vida");
const pontosEl = document.getElementById("pontos");

// ===== ESTADO DO JOGO =====
let playerPos = {
    x: 0,
    y: 0
};

let cells = [];

// ===== CRIAR ARENA =====
function criarArena() {
    arena.innerHTML = "";
    cells = [];

    for (let i = 0; i < TAMANHO_ARENA * TAMANHO_ARENA; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        arena.appendChild(cell);
        cells.push(cell);
    }

    desenharPlayer();
}

// ===== DESENHAR PLAYER =====
function desenharPlayer() {
    limparClasses();
    const index = playerPos.y * TAMANHO_ARENA + playerPos.x;
    cells[index].classList.add("player");
}

// ===== LIMPAR CLASSES =====
function limparClasses() {
    cells.forEach(cell => {
        cell.classList.remove("player");
    });
}

// ===== MOVIMENTAÇÃO =====
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (playerPos.y > 0) playerPos.y--;
            break;
        case "ArrowDown":
            if (playerPos.y < TAMANHO_ARENA - 1) playerPos.y++;
            break;
        case "ArrowLeft":
            if (playerPos.x > 0) playerPos.x--;
            break;
        case "ArrowRight":
            if (playerPos.x < TAMANHO_ARENA - 1) playerPos.x++;
            break;
        default:
            return;
    }

    desenharPlayer();
});

// ===== INICIAR =====
criarArena();
