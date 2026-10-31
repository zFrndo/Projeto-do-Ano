/* ELEMENTOS */
const tituloTimer = document.getElementById("tituloTimer");
const tempoRestante = document.getElementById("tempoRestante");
const barraProgresso = document.getElementById("barraProgresso");
const videosRecomendados = document.getElementById("videosRecomendados");

const TEMPO_FOCO =
    90 * 60;

const TEMPO_PAUSA =
    20 * 60;

let modo = "foco"; 

let tempoAtual = TEMPO_FOCO;

/* tempo do modo atual, é para calcular a barra de progresso */
let tempoTotal = TEMPO_FOCO;

/* Guarda o intervalo do timer.*/
let timer = null;

const canais = [
    {
        imagem:"../Imagens/cienciatododia.png",
        link:"https://www.youtube.com/@CienciaTodoDia/videos"
    },

    {
        imagem:"../Imagens/manualdomundo.png",
        link:"https://www.youtube.com/@manualdomundo/videos"
    },

    {
        imagem:"../Imagens/deboraaladim.png",
        link:"https://www.youtube.com/@deboraaladim/videos"
    },

    {
        imagem:"../Imagens/professorferretto.png",
        link:"https://www.youtube.com/@professorferretto/videos"
    },

    {
        imagem:"../imagens/professornoslen.png",
        link:"https://www.youtube.com/@ProfessorNoslen/videos"
    },

    {
        imagem:"../imagens/cafecomquimica.png",
        link:"https://www.youtube.com/@profmichelquimica/videos"
    }
];

function atualizarTela() {

    /* TÍTULO */
    if (modo === "foco") {
        tituloTimer.textContent =
            "Atenção";
    }

    else {
        tituloTimer.textContent =
            "Descanse";
    }

    /* TEMPO RESTANTE */
    const minutos =
        Math.ceil(tempoAtual / 60); 

    if (minutos === 1) {
        tempoRestante.textContent =
            "1 minuto restante";
    }

    else {
        tempoRestante.textContent =
            `${minutos} minutos restantes`;
    }

    /* BARRA */
    const porcentagem =
        (tempoAtual / tempoTotal) * 100;

    barraProgresso.style.width =
        `${porcentagem}%`;
}

/* MOSTRAR RECOMENDAÇÕES */
function mostrarRecomendacoes() {
    /* Limpa os cards anteriores, para virem novos */
    videosRecomendados.innerHTML = "";

    const canaisDisponiveis =
        [...canais];

    canaisDisponiveis.sort(
        () => Math.random() - 0.5
    );

    const selecionados =
        canaisDisponiveis.slice(0, 4);

    /* Cria os cards */
    selecionados.forEach(canal => {

        /* Cria a div que sera o card */
        const card =
            document.createElement("div");

        card.classList.add(
            "card-canal"
        );

        const imagem =
            document.createElement("img");

        imagem.src =
            canal.imagem;

        imagem.alt =
            "Canal recomendado";

        /* Coloca a imagem dentro da div*/
        card.appendChild(imagem);

        /* Faz o card abrir o link do canal */
        card.addEventListener(
            "click",
            function() {

                window.open(
                    canal.link,
                    "_blank"
                );

            }
        );

        /* Coloca o card na página. */
        videosRecomendados.appendChild( card );
    });
}

/* TROCAR DE MODO */
function trocarModo() {

    /* FOCO → PAUSA */
    if (modo === "foco") {

        modo = "pausa";

        tempoAtual = TEMPO_PAUSA;

        tempoTotal = TEMPO_PAUSA;

        /* Adiciona a classe pausa ao body com isso mostra os vídeos */
        document.body.classList.add(
            "pausa"
        );

        /* Sorteia os canais */
        mostrarRecomendacoes();
    }

    /* PAUSA → FOCO */
    else {
        modo = "foco";

        tempoAtual = TEMPO_FOCO;

        tempoTotal = TEMPO_FOCO;

        /* Os vídeos desaparecem */
        document.body.classList.remove(
            "pausa"
        );
    }

    atualizarTela();
}

/* INICIAR TIMER */
function iniciarTimer() {

    /* Não cria vários intervalos ao mesmo tempo */
    if (timer !== null) {
        return;
    }

    timer =
        setInterval(
            function() {
                /* Diminui 1 segundo. */
                tempoAtual--;

                /* Atualiza a interface. Tanto a barra quanto o texto são atualizados. */
                atualizarTela();

                /* Chegou a zero? */
                if (tempoAtual <= 0) {
                    trocarModo();
                }
            },

            1000
        );

}

/* INÍCIO */
atualizarTela();

iniciarTimer();