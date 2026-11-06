/* ELEMENTOS */
const etapas = {
    tema: document.getElementById("etapaTema"),
    ler: document.getElementById("etapaLer"),
    explicar: document.getElementById("etapaExplicar"),
    lacunas: document.getElementById("etapaLacunas")
};
const inputTema = document.getElementById("inputTema");
const temaLer = document.getElementById("temaLer");
const tempoRestante = document.getElementById("tempoRestante");
const barraProgresso = document.getElementById("barraProgresso");
const videosRecomendados = document.getElementById("videosRecomendados");

/* Tempo de estudo de cada rodada de leitura */
const TEMPO_LEITURA = 20 * 60;

let tema = "";
let tempoAtual = TEMPO_LEITURA;
let timer = null;
let sessaoIniciada = false;

const canais = [
    { imagem: "../Imagens/cienciatododia.png", link: "https://www.youtube.com/@CienciaTodoDia/videos" },
    { imagem: "../Imagens/manualdomundo.png", link: "https://www.youtube.com/@manualdomundo/videos" },
    { imagem: "../Imagens/deboraaladim.png", link: "https://www.youtube.com/@deboraaladim/videos" },
    { imagem: "../Imagens/professorferretto.png", link: "https://www.youtube.com/@professorferretto/videos" },
    { imagem: "../Imagens/professornoslen.png", link: "https://www.youtube.com/@ProfessorNoslen/videos" },
    { imagem: "../Imagens/cafecomquimica.png", link: "https://www.youtube.com/@profmichelquimica/videos" }
];

/* TROCAR DE ETAPA */
function mostrarEtapa(nome) {
    Object.values(etapas).forEach(function (e) { e.classList.remove("ativa"); });
    etapas[nome].classList.add("ativa");
}

/* TIMER DE LEITURA */
function atualizarTela() {
    const minutos = Math.ceil(tempoAtual / 60);
    tempoRestante.textContent = minutos === 1 ? "1 minuto restante" : `${minutos} minutos restantes`;
    barraProgresso.style.width = `${(tempoAtual / TEMPO_LEITURA) * 100}%`;
}

function iniciarLeitura() {
    pararTimer();
    tempoAtual = TEMPO_LEITURA;
    atualizarTela();
    timer = setInterval(function () {
        tempoAtual--;
        atualizarTela();
        if (tempoAtual <= 0) {
            pararTimer();
            mostrarEtapa("explicar"); // acabou o tempo: hora de explicar
        }
    }, 1000);
}

function pararTimer() {
    if (timer !== null) { clearInterval(timer); timer = null; }
}

/* RECOMENDAÇÕES */
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
}

/* FLUXO */
document.getElementById("botaoComecar").addEventListener("click", function () {
    tema = inputTema.value.trim();
    if (!tema) { inputTema.focus(); return; }

    temaLer.textContent = tema;
    if (!sessaoIniciada) {
        sessaoIniciada = true;
        MetohelpFim.iniciar("feynman", "Feynman"); // registra a sessão e mostra "Encerrar sessão"
    }
    mostrarEtapa("ler");
    iniciarLeitura();
});

inputTema.addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("botaoComecar").click();
});

document.getElementById("botaoExplicar").addEventListener("click", function () {
    pararTimer();
    mostrarEtapa("explicar");
});

document.getElementById("botaoLacunas").addEventListener("click", function () {
    mostrarEtapa("lacunas");
});

document.getElementById("botaoRever").addEventListener("click", function () {
    mostrarEtapa("ler");
    iniciarLeitura();
});

document.getElementById("botaoConcluir").addEventListener("click", function () {
    document.body.classList.add("finalizado");
    mostrarRecomendacoes();
    MetohelpFim.abrir({ resumo: tema });
});

/* Exige login para usar o método */
Metohelp.exigirLogin();
