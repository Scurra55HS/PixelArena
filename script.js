// ===== CONFIGURAÇÕES =====
const TAMANHO_ARENA = 10;
const VIDA_INICIAL = 3;

// ===== ELEMENTOS =====
const arena = document.getElementById("arena");
const vidaEl = document.getElementById("vida");
const pontosEl = document.getElementById("pontos");

// ===== ESTADO DO JOGO =====
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 5, y: 5 };
let vida = VIDA_INICIAL;
let pontos = 0;
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

    atualizarHUD();
    desenharTudo();
}

// ===== DESENHO =====
function desenharTudo() {
    limparClasses();

    const playerIndex = playerPos.y * TAMANHO_ARENA + playerPos.x;
    const enemyIndex = enemyPos.y * TAMANHO_ARENA + enemyPos.x;

    cells[playerIndex].classList.add("player");
    cells[enemyIndex].classList.add("enemy");
}

function limparClasses() {
    cells.forEach(cell => {
        cell.classList.remove("player", "enemy");
    });
}

// ===== INIMIGO =====
function gerarInimigo() {
    enemyPos.x = Math.floor(Math.random() * TAMANHO_ARENA);
    enemyPos.y = Math.floor(Math.random() * TAMANHO_ARENA);
}

// ===== COLISÃO =====
function checarColisao() {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
        vida--;
        vidaEl.textContent = vida;

        alert("💥 Você foi atingido!");

        playerPos = { x: 0, y: 0 };
        gerarInimigo();

        if (vida <= 0) {
            alert("☠️ Game Over!");
            resetarJogo();
        }
    }
}

// ===== HUD =====
function atualizarHUD() {
    vidaEl.textContent = vida;
    pontosEl.textContent = pontos;
}

// ===== RESET =====
function resetarJogo() {
    vida = VIDA_INICIAL;
    pontos = 0;
    playerPos = { x: 0, y: 0 };
    gerarInimigo();
    atualizarHUD();
    desenharTudo();
}

// ===== MOVIMENTAÇÃO =====
document.addEventListener("keydown", (e) => {
    let moveu = false;

    switch (e.key) {
        case "ArrowUp":
            if (playerPos.y > 0) {
                playerPos.y--;
                moveu = true;
            }
            break;
        case "ArrowDown":
            if (playerPos.y < TAMANHO_ARENA - 1) {
                playerPos.y++;
                moveu = true;
            }
            break;
        case "ArrowLeft":
            if (playerPos.x > 0) {
                playerPos.x--;
                moveu = true;
            }
            break;
        case "ArrowRight":
            if (playerPos.x < TAMANHO_ARENA - 1) {
                playerPos.x++;
                moveu = true;
            }
            break;
    }

    if (moveu) {
        pontos++;
        checarColisao();
        desenharTudo();
        atualizarHUD();
    }
});

// ===== INICIAR =====
gerarInimigo();
criarArena();
