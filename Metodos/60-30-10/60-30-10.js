const seletorTempo = document.getElementById("seletorTempo");
const horasElemento = document.getElementById("horas");
const minutosElemento = document.getElementById("minutos");
const botaoComecar = document.getElementById("botaoComecar");
const configuracao = document.getElementById("configuracao");
const timerTela = document.getElementById("timerTela");
const tituloTimer = document.getElementById("tituloTimer");
const tempoRestante = document.getElementById("tempoRestante");
const barraProgresso = document.getElementById("barraProgresso");
const recomendacoes = document.getElementById("recomendacoes");
const videosRecomendados = document.getElementById("videosRecomendados");
const chipsFases = document.querySelectorAll(".fase");

const canais = [
    { imagem: "../Imagens/cienciatododia.png", link: "https://www.youtube.com/@CienciaTodoDia/videos" },
    { imagem: "../Imagens/manualdomundo.png", link: "https://www.youtube.com/@manualdomundo/videos" },
    { imagem: "../Imagens/deboraaladim.png", link: "https://www.youtube.com/@deboraaladim/videos" },
    { imagem: "../Imagens/professorferretto.png", link: "https://www.youtube.com/@professorferretto/videos" },
    { imagem: "../Imagens/professornoslen.png", link: "https://www.youtube.com/@ProfessorNoslen/videos" },
    { imagem: "../Imagens/cafecomquimica.png", link: "https://www.youtube.com/@profmichelquimica/videos" }
];

/* As 3 fases e a fatia do tempo total de cada uma */
const FASES = [
    { titulo: "Teoria", fracao: 0.6 },
    { titulo: "Exercícios", fracao: 0.3 },
    { titulo: "Correção", fracao: 0.1 }
];

let horas = 0;
let minutos = 0;
let tempoTotal = 0;
let tempoDecorrido = 0;
let timer = null;

/* MOSTRAR / ESCONDER SETAS */
seletorTempo.addEventListener("click", function (event) {
    if (event.target.classList.contains("seta")) return;
    seletorTempo.classList.toggle("ativo");
});

/* ALTERAR TEMPO */
document.querySelectorAll(".seta").forEach(function (seta) {
    seta.addEventListener("click", function (event) {
        event.stopPropagation();

        const tipo = seta.dataset.tipo;
        const aumentar = seta.classList.contains("cima");

        if (tipo === "horas") {
            horas = aumentar ? Math.min(horas + 1, 23) : Math.max(horas - 1, 0);
        }

        if (tipo === "minutos") {
            if (aumentar) {
                minutos++;
                if (minutos >= 60) {
                    if (horas < 23) { horas++; minutos = 0; }
                    else { minutos = 59; }
                }
            } else {
                minutos--;
                if (minutos < 0) {
                    if (horas > 0) { horas--; minutos = 59; }
                    else { minutos = 0; }
                }
            }
        }

        atualizarTempoSelecionado();
    });
});

function atualizarTempoSelecionado() {
    horasElemento.textContent = String(horas).padStart(2, "0");
    minutosElemento.textContent = String(minutos).padStart(2, "0");
}

/* COMEÇAR */
botaoComecar.addEventListener("click", iniciarMetodo);

function iniciarMetodo() {
    tempoTotal = (horas * 60 * 60) + (minutos * 60);

    if (tempoTotal <= 0) {
        alert("Defina um tempo maior que zero.");
        return;
    }

    tempoDecorrido = 0;

    // Registra a sessão e mostra "Encerrar sessão"
    MetohelpFim.iniciar("60-30-10", "60-30-10");

    configuracao.style.display = "none";
    timerTela.style.display = "flex";
    recomendacoes.style.display = "none";
    document.body.classList.remove("finalizado");

    atualizarTela();
    iniciarTimer();
}

/* Descobre em que fase estamos e quanto falta nela */
function faseAtual() {
    let inicio = 0;
    for (let i = 0; i < FASES.length; i++) {
        const duracao = tempoTotal * FASES[i].fracao;
        const fim = inicio + duracao;
        if (tempoDecorrido < fim || i === FASES.length - 1) {
            return { indice: i, restante: Math.max(fim - tempoDecorrido, 0), duracao: duracao };
        }
        inicio = fim;
    }
}

function atualizarTela() {
    const fase = faseAtual();
    tituloTimer.textContent = FASES[fase.indice].titulo;

    chipsFases.forEach(function (chip, i) {
        chip.classList.toggle("atual", i === fase.indice);
        chip.classList.toggle("feita", i < fase.indice);
    });

    const minutosRestantes = Math.ceil(fase.restante / 60);
    tempoRestante.textContent = minutosRestantes === 1
        ? "1 minuto restante nesta fase"
        : `${minutosRestantes} minutos restantes nesta fase`;

    barraProgresso.style.width = `${(fase.restante / fase.duracao) * 100}%`;
}

function iniciarTimer() {
    if (timer !== null) return;

    timer = setInterval(function () {
        tempoDecorrido++;
        if (tempoDecorrido >= tempoTotal) {
            finalizarMetodo();
        } else {
            atualizarTela();
        }
    }, 1000);
}

function finalizarMetodo() {
    clearInterval(timer);
    timer = null;

    barraProgresso.style.width = "0%";
    tituloTimer.textContent = "Encerrado";
    tempoRestante.textContent = "";
    chipsFases.forEach(function (chip) { chip.classList.remove("atual"); chip.classList.add("feita"); });

    document.body.classList.add("finalizado");
    mostrarRecomendacoes();

    // Tempo acabou: pede a autoavaliação (ou sair sem avaliar)
    MetohelpFim.abrir();
}

function mostrarRecomendacoes() {
    Metohelp.mostrarLivros(document.getElementById("livrosRecomendados"));
    videosRecomendados.innerHTML = "";

    [...canais].sort(function () { return Math.random() - 0.5; }).slice(0, 4).forEach(function (canal) {
        const card = document.createElement("div");
        card.classList.add("card-canal");

        const imagem = document.createElement("img");
        imagem.src = canal.imagem;
        imagem.alt = "Canal recomendado";
        card.appendChild(imagem);

        card.addEventListener("click", function () { window.open(canal.link, "_blank"); });
        videosRecomendados.appendChild(card);
    });

    recomendacoes.style.display = "block";
}

atualizarTempoSelecionado();

/* Exige login para usar o método */
Metohelp.exigirLogin();
