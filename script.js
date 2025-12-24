// ===== CONFIGURAÇÕES =====
const TAMANHO_ARENA = 10;
const VIDA_INICIAL = 3;
const COOLDOWN_DASH = 2000;

// ===== ELEMENTOS =====
const arena = document.getElementById("arena");
const vidaEl = document.getElementById("vida");
const pontosEl = document.getElementById("pontos");

// ===== ESTADO =====
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 5, y: 5 };
let vida = VIDA_INICIAL;
let pontos = 0;
let cells = [];

let velocidadeInimigo = 800;
let intervaloInimigo;

let podeDash = true;
let powerUp = null;


// menu | jogando | pausado
const overlay = document.getElementById("overlay");
const overlayTitulo = document.getElementById("overlayTitulo");
const overlayTexto = document.getElementById("overlayTexto");

let estadoJogo = "menu";


function mostrarMenu() {
    estadoJogo = "menu";
    overlay.classList.add("ativo");
    overlayTitulo.textContent = "Pixel Arena";
    overlayTexto.textContent = "Pressione ENTER para começar";
}

function iniciarJogo() {
    estadoJogo = "jogando";
    overlay.classList.remove("ativo");
    resetarJogo();
}

function pausarJogo() {
    estadoJogo = "pausado";
    overlay.classList.add("ativo");
    overlayTitulo.textContent = "⏸️ Pausado";
    overlayTexto.textContent = "Pressione ENTER para continuar";
    clearInterval(intervaloInimigo);
}

function continuarJogo() {
    estadoJogo = "jogando";
    overlay.classList.remove("ativo");
    iniciarInimigo();
}



// ===== SONS =====
function tocarSom(tipo) {
    const som = document.getElementById(`som-${tipo}`);
    if (som) {
        som.currentTime = 0;
        som.play();
    }
}

// ===== ARENA =====
function criarArena() {
    arena.innerHTML = "";
    cells = [];

    for (let i = 0; i < TAMANHO_ARENA ** 2; i++) {
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

    if (powerUp) {
        const powerIndex = powerUp.y * TAMANHO_ARENA + powerUp.x;
        cells[powerIndex].classList.add("powerup");
    }
}

function limparClasses() {
    cells.forEach(c => c.classList.remove("player", "enemy", "powerup"));
}

// ===== INIMIGO =====
function gerarInimigo() {
    enemyPos.x = Math.floor(Math.random() * TAMANHO_ARENA);
    enemyPos.y = Math.floor(Math.random() * TAMANHO_ARENA);
}

function moverInimigo() {
    let dx = playerPos.x - enemyPos.x;
    let dy = playerPos.y - enemyPos.y;

    let moveX = dx !== 0 ? dx / Math.abs(dx) : 0;
    let moveY = dy !== 0 ? dy / Math.abs(dy) : 0;

    // Chance de erro pra não ficar perfeito demais
    const erro = Math.random();

    if (erro < 0.2) {
        // movimento aleatório (20%)
        const direcoes = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];
        const dir = direcoes[Math.floor(Math.random() * direcoes.length)];
        moveX = dir.x;
        moveY = dir.y;
    } else {
        // prioriza eixo maior
        if (Math.abs(dx) > Math.abs(dy)) {
            moveY = 0;
        } else {
            moveX = 0;
        }
    }

    const novoX = enemyPos.x + moveX;
    const novoY = enemyPos.y + moveY;

    if (novoX >= 0 && novoX < TAMANHO_ARENA) enemyPos.x = novoX;
    if (novoY >= 0 && novoY < TAMANHO_ARENA) enemyPos.y = novoY;

    checarColisao();
    desenharTudo();
}


// ===== DASH =====
function dash(dx, dy) {
    if (!podeDash) return;

    const novoX = playerPos.x + dx * 2;
    const novoY = playerPos.y + dy * 2;

    if (novoX >= 0 && novoX < TAMANHO_ARENA) playerPos.x = novoX;
    if (novoY >= 0 && novoY < TAMANHO_ARENA) playerPos.y = novoY;

    podeDash = false;
    setTimeout(() => podeDash = true, COOLDOWN_DASH);

    tocarSom("dash");
}

// ===== POWER-UP =====
function gerarPowerUp() {
    const tipos = ["vida", "pontos", "slow"];
    powerUp = {
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        x: Math.floor(Math.random() * TAMANHO_ARENA),
        y: Math.floor(Math.random() * TAMANHO_ARENA)
    };
}

function checarPowerUp() {
    if (
        powerUp &&
        playerPos.x === powerUp.x &&
        playerPos.y === powerUp.y
    ) {
        if (powerUp.tipo === "vida") vida++;
        if (powerUp.tipo === "pontos") pontos += 5;
        if (powerUp.tipo === "slow") {
            velocidadeInimigo += 200;
            iniciarInimigo();
        }

        tocarSom("powerup");
        powerUp = null;
    }
}

// ===== COLISÃO =====
function checarColisao() {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
        vida--;
        tocarSom("hit");
        atualizarHUD();

        playerPos = { x: 0, y: 0 };
        gerarInimigo();

        if (vida <= 0) {
            salvarRanking();
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

// ===== DIFICULDADE =====
function atualizarDificuldade() {
    if (pontos % 10 === 0 && velocidadeInimigo > 200) {
        velocidadeInimigo -= 100;
        iniciarInimigo();
    }

    if (pontos % 7 === 0 && !powerUp) {
        gerarPowerUp();
    }
}

// ===== RANKING LOCAL =====
function salvarRanking() {
    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push({ pontos, data: new Date().toLocaleString() });
    ranking.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem("ranking", JSON.stringify(ranking.slice(0, 5)));
}

// ===== LOOP INIMIGO =====
function iniciarInimigo() {
    clearInterval(intervaloInimigo);
    intervaloInimigo = setInterval(moverInimigo, velocidadeInimigo);
}

// ===== RESET =====
function resetarJogo() {
    vida = VIDA_INICIAL;
    pontos = 0;
    velocidadeInimigo = 800;
    playerPos = { x: 0, y: 0 };
    powerUp = null;
    gerarInimigo();
    atualizarHUD();
    iniciarInimigo();
    desenharTudo();
}

// ===== CONTROLES =====
document.addEventListener("keydown", (e) => {
    let moveu = false;

    if (e.key === "Enter") {
        if (estadoJogo === "menu") iniciarJogo();
        else if (estadoJogo === "pausado") continuarJogo();
        else if (estadoJogo === "jogando") pausarJogo();
        return;
    }

    if (estadoJogo !== "jogando") return;

    if (e.shiftKey) {
        if (e.key === "ArrowUp") dash(0, -1);
        if (e.key === "ArrowDown") dash(0, 1);
        if (e.key === "ArrowLeft") dash(-1, 0);
        if (e.key === "ArrowRight") dash(1, 0);
        desenharTudo();
        return;
    }

    switch (e.key) {
        case "ArrowUp":
            if (playerPos.y > 0) { playerPos.y--; moveu = true; }
            break;
        case "ArrowDown":
            if (playerPos.y < TAMANHO_ARENA - 1) { playerPos.y++; moveu = true; }
            break;
        case "ArrowLeft":
            if (playerPos.x > 0) { playerPos.x--; moveu = true; }
            break;
        case "ArrowRight":
            if (playerPos.x < TAMANHO_ARENA - 1) { playerPos.x++; moveu = true; }
            break;
    }

    if (moveu) {
        pontos++;
        atualizarDificuldade();
        checarPowerUp();
        checarColisao();
        desenharTudo();
        atualizarHUD();
    }
});

function mostrarRanking() {
    const lista = document.getElementById("listaRanking");
    if (!lista) return;

    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    lista.innerHTML = "";

    ranking.forEach(item => {
        const li = document.createElement("li");

        const pontosSpan = document.createElement("strong");
        pontosSpan.textContent = `${item.pontos} pts`;

        const dataSpan = document.createElement("span");
        dataSpan.textContent = item.data;

        li.appendChild(pontosSpan);
        li.appendChild(dataSpan);

        lista.appendChild(li);
    });
}



// ===== INICIAR =====
gerarInimigo();
criarArena();
iniciarInimigo();
salvarRanking();
mostrarRanking();
