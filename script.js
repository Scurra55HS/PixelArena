// ================= CONFIG =================
const TAMANHO_ARENA = 10;
const VIDA_INICIAL = 3;
const DASH_COOLDOWN = 3000;
const DASH_DIST = 2;

// ================= SONS =================
const somDash = document.getElementById("som-dash");
const somHit = document.getElementById("som-hit");
const somPower = document.getElementById("som-powerup");

// ================= ELEMENTOS =================
const arena = document.getElementById("arena");
const vidaEl = document.getElementById("vida");
const pontosEl = document.getElementById("pontos");
const dashEl = document.getElementById("dashCooldown");
const rankingEl = document.getElementById("listaRanking");

// popup
const popup = document.getElementById("gamePopup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const popupBtn = document.getElementById("popupBtn");

// ================= ESTADO =================
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 5, y: 5 };
let vida = VIDA_INICIAL;
let pontos = 0;
let cells = [];
let velocidadeInimigo = 650;
let intervaloInimigo;
let pausado = true;

// dash
let podeDash = true;
let dashCooldownRestante = 0;

// power-up
let powerUpPos = null;
let powerUpTipo = null;
let powerUpTimer = null;
let invencivel = false;
let velocidadeExtra = 0;

// ================= POPUP =================
function mostrarPopup(titulo, mensagem, callback) {
    pausado = true;
    popupTitle.textContent = titulo;
    popupMessage.textContent = mensagem;
    popup.classList.remove("hidden");

    popupBtn.onclick = () => {
        popup.classList.add("hidden");
        pausado = false;
        if (callback) callback();
    };
}

// ================= ARENA =================
function criarArena() {
    arena.innerHTML = "";
    cells = [];

    for (let i = 0; i < TAMANHO_ARENA ** 2; i++) {
        const c = document.createElement("div");
        c.className = "cell";
        arena.appendChild(c);
        cells.push(c);
    }

    spawnPowerUp();
    desenharTudo();
    atualizarHUD();
}

function desenharTudo() {
    cells.forEach(c => c.className = "cell");

    cells[playerPos.y * TAMANHO_ARENA + playerPos.x]?.classList.add("player");
    cells[enemyPos.y * TAMANHO_ARENA + enemyPos.x]?.classList.add("enemy");

    if (powerUpPos && powerUpTipo) {
        cells[powerUpPos.y * TAMANHO_ARENA + powerUpPos.x]?.classList.add("powerup", powerUpTipo);
    }
}


// ================= POWER-UP =================
function spawnPowerUp() {
    // Remove power-up antigo
    if (powerUpPos) {
        cells[powerUpPos.y * TAMANHO_ARENA + powerUpPos.x].classList.remove("powerup");
    }

    // Escolhe posição aleatória
    const x = Math.floor(Math.random() * TAMANHO_ARENA);
    const y = Math.floor(Math.random() * TAMANHO_ARENA);

    // Não spawnar em jogador ou inimigo
    if ((x === playerPos.x && y === playerPos.y) || (x === enemyPos.x && y === enemyPos.y)) {
        return spawnPowerUp();
    }

    powerUpPos = { x, y };

    // Define tipo aleatório
    const tipos = ["cura", "pontos", "velocidade", "invencivel", "slow"];
    powerUpTipo = tipos[Math.floor(Math.random() * tipos.length)];
}

// ================= INIMIGO =================
function moverInimigo() {
    if (pausado) return;

    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        enemyPos.x += Math.sign(dx);
    } else {
        enemyPos.y += Math.sign(dy);
    }

    enemyPos.x = Math.max(0, Math.min(TAMANHO_ARENA - 1, enemyPos.x));
    enemyPos.y = Math.max(0, Math.min(TAMANHO_ARENA - 1, enemyPos.y));

    checarColisao();
    checarPowerUp();
    desenharTudo();
}

function iniciarInimigo() {
    clearInterval(intervaloInimigo);
    const vel = Math.max(200, velocidadeInimigo - pontos * 5); // evolui com pontos
    intervaloInimigo = setInterval(moverInimigo, vel);
}

// ================= COLISÃO =================
function checarColisao() {
    if (playerPos.x === enemyPos.x && playerPos.y === enemyPos.y) {
        if (invencivel) return; // ignora colisão
        vida--;
        atualizarHUD();

        try {
            somHit.currentTime = 0;
            somHit.play();
        } catch { }

        mostrarPopup("HIT!", "Você foi atingido! 💥");

        playerPos = { x: 0, y: 0 };
        enemyPos = {
            x: Math.floor(Math.random() * TAMANHO_ARENA),
            y: Math.floor(Math.random() * TAMANHO_ARENA)
        };

        if (vida <= 0) fimDeJogo();
    }
}

// ================= POWER-UP COLETA =================
function checarPowerUp() {
    if (!powerUpPos) return;

    if (playerPos.x === powerUpPos.x && playerPos.y === powerUpPos.y) {
        try {
            somPower.currentTime = 0;
            somPower.play();
        } catch { }

        switch (powerUpTipo) {
            case "cura":
                vida++;
                mostrarPopup("POWER-UP!", "+1 Vida ❤️");
                break;
            case "pontos":
                pontos += 10;
                mostrarPopup("POWER-UP!", "+10 Pontos ⭐");
                break;
            case "velocidade":
                velocidadeExtra = 1;
                mostrarPopup("POWER-UP!", "Velocidade aumentada 🏃");
                if (powerUpTimer) clearTimeout(powerUpTimer);
                powerUpTimer = setTimeout(() => { velocidadeExtra = 0; }, 6000);
                break;
            case "invencivel":
                invencivel = true;
                mostrarPopup("POWER-UP!", "Invencível 🛡");
                if (powerUpTimer) clearTimeout(powerUpTimer);
                powerUpTimer = setTimeout(() => { invencivel = false; }, 6000);
                break;
            case "slow":
                clearInterval(intervaloInimigo);
                mostrarPopup("POWER-UP!", "Inimigo mais lento 🐢");
                intervaloInimigo = setInterval(moverInimigo, (velocidadeInimigo + 300));
                powerUpTimer = setTimeout(() => { iniciarInimigo(); }, 6000);
                break;
        }

        powerUpPos = null;
        powerUpTipo = null;
        spawnPowerUp();
    }
}

// ================= HUD =================
function atualizarHUD() {
    vidaEl.textContent = vida;
    pontosEl.textContent = pontos;

    if (podeDash) {
        dashEl.textContent = "PRONTO";
        dashEl.style.color = "#4caf50";
    } else {
        dashEl.textContent = (dashCooldownRestante / 1000).toFixed(1) + "s";
        dashEl.style.color = "#f44336";
    }
}

// ================= DASH =================
function usarDash(dx, dy) {
    if (!podeDash || (!dx && !dy)) return;

    playerPos.x += dx * DASH_DIST + dx * velocidadeExtra;
    playerPos.y += dy * DASH_DIST + dy * velocidadeExtra;

    playerPos.x = Math.max(0, Math.min(TAMANHO_ARENA - 1, playerPos.x));
    playerPos.y = Math.max(0, Math.min(TAMANHO_ARENA - 1, playerPos.y));

    podeDash = false;
    dashCooldownRestante = DASH_COOLDOWN;

    const cd = setInterval(() => {
        dashCooldownRestante -= 100;
        atualizarHUD();

        if (dashCooldownRestante <= 0) {
            podeDash = true;
            clearInterval(cd);
            atualizarHUD();
        }
    }, 100);

    try {
        somDash.currentTime = 0;
        somDash.play();
    } catch { }
}

// ================= RANKING =================
function salvarRanking(nome) {
    const lista = JSON.parse(localStorage.getItem("ranking")) || [];

    lista.push({ nome, pontos });
    lista.sort((a, b) => b.pontos - a.pontos);

    localStorage.setItem("ranking", JSON.stringify(lista.slice(0, 5)));
    renderizarRanking();
}

function renderizarRanking() {
    rankingEl.innerHTML = "";
    const lista = JSON.parse(localStorage.getItem("ranking")) || [];

    lista.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="rank-nome">#${i + 1} ${r.nome}</span>
            <span class="rank-pontos">${r.pontos} pts</span>
        `;
        rankingEl.appendChild(li);
    });
}

// ================= FIM DE JOGO =================
function fimDeJogo() {
    clearInterval(intervaloInimigo);

    mostrarPopup(
        "☠ GAME OVER",
        `Você fez ${pontos} pontos\nDigite seu nome:`,
        () => {
            const nome = prompt("Seu nome:");
            if (nome) salvarRanking(nome);
            resetarJogo();
        }
    );
}

// ================= RESET =================
function resetarJogo() {
    vida = VIDA_INICIAL;
    pontos = 0;
    podeDash = true;
    invencivel = false;
    velocidadeExtra = 0;
    playerPos = { x: 0, y: 0 };
    enemyPos = { x: 5, y: 5 };
    atualizarHUD();
    iniciarInimigo();
    criarArena();
}

// ================= CONTROLES =================
document.addEventListener("keydown", e => {
    if (pausado) return;

    let dx = 0, dy = 0;

    if (e.key === "ArrowUp") dy = -1;
    if (e.key === "ArrowDown") dy = 1;
    if (e.key === "ArrowLeft") dx = -1;
    if (e.key === "ArrowRight") dx = 1;

    if (e.shiftKey) usarDash(dx, dy);
    else {
        playerPos.x += dx + dx * velocidadeExtra;
        playerPos.y += dy + dy * velocidadeExtra;
    }

    playerPos.x = Math.max(0, Math.min(TAMANHO_ARENA - 1, playerPos.x));
    playerPos.y = Math.max(0, Math.min(TAMANHO_ARENA - 1, playerPos.y));

    if (dx || dy) {
        pontos++;
        desenharTudo();
        checarColisao();
        checarPowerUp();
        atualizarHUD();
    }

    if (e.key === "Escape") {
        mostrarPopup("⏸ PAUSE", "Pressione OK para continuar");
    }
});

// ================= START =================
resetarJogo();
renderizarRanking();
mostrarPopup(
    "PIXEL ARENA🎮",
    "Setas: mover\nShift: dash\nEsc: pause\nBoa sorte!"
);
