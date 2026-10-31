const escolha =document.getElementById("escolha");
const seletorTempo=document.getElementById("seletorTempo");
const horasElemento=document.getElementById("horas");
const minutosElemento= document.getElementById("minutos");
const botaoComecar= document.getElementById("botaoComecar");
const timerTela= document.getElementById("timerTela");
const tituloTimer= document.getElementById("tituloTimer");
const tempoRestante= document.getElementById("tempoRestante");
const barraProgresso= document.getElementById("barraProgresso");
const recomendacoes= document.getElementById("recomendacoes");
const videosRecomendados= document.getElementById("videosRecomendados");
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

/* CONFIGURAÇÃO INICIAL */
let horas = 0;
let minutos = 0;
let tempoAtual = 0;
let tempoTotal = 0;
let timer = null;

/* MOSTRAR / ESCONDER SETAS */
seletorTempo.addEventListener(
    "click",
    function(event) {

        //Se clicou em seta n fecha o seletor
        if (
            event.target.classList.contains("seta")
        ) {
            return;
        }

        seletorTempo.classList.toggle(
            "ativo"
        );

    }
);

/* ALTERAR TEMPO */
document.querySelectorAll(".seta")
    .forEach(
        function(seta) {

            seta.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    const tipo =
                        seta.dataset.tipo;

                    const aumentar =
                        seta.classList.contains(
                            "cima"
                        );


                    /* HORAS */
                    if (tipo === "horas") {

                        if (aumentar) {

                            horas++;

                            if (horas > 23) {
                                horas = 23;
                            }

                        }

                        else {

                            horas--;

                            if (horas < 0) {
                                horas = 0;
                            }

                        }

                    }

                    /* MINUTOS */
                    if (tipo === "minutos") {

                        if (aumentar) {

                            minutos++;

                            /*
                             * Ao chegar em 60,
                             * passa uma hora.
                             */

                            if (minutos >= 60) {

                                if (horas < 23) {
                                    horas++;
                                    minutos = 0;
                                }

                                else {
                                    minutos = 59;
                                }

                            }

                        }
                        else {
                            minutos--;
                            /* Se diminuir de 0, pega uma hora.*/
                            if (minutos < 0) {

                                if (horas > 0) {

                                    horas--;

                                    minutos = 59;

                                }

                                else {

                                    minutos = 0;

                                }

                            }

                        }

                    }


                    atualizarTempoSelecionado();

                }

            );

        }
    );

/* ATUALIZAR TEMPO SELECIONADO */
function atualizarTempoSelecionado() {

    horasElemento.textContent =
        String(horas).padStart(2, "0");

    minutosElemento.textContent =
        String(minutos).padStart(2, "0");

}

/* COMEÇAR */
botaoComecar.addEventListener(
    "click",
    iniciarTimeboxing
);


function iniciarTimeboxing() {

    tempoTotal =
        (horas * 60 * 60) +
        (minutos * 60);

    if (tempoTotal <= 0) {

        alert(
            "Defina um tempo maior que zero."
        );

        return;
    }

    tempoAtual =
        tempoTotal;

    configuracao.style.display =
        "none";

    timerTela.style.display =
        "flex";

    recomendacoes.style.display =
        "none";

    document.body.classList.remove(
        "finalizado"
    );

    atualizarTela();
    iniciarTimer();

}

/* ATUALIZAR TIMER */
function atualizarTela() {
    const minutosRestantes = Math.ceil(tempoAtual / 60);

    if (minutosRestantes === 1) {
        tempoRestante.textContent =
            "1 minuto restante";
    }

    else {
        tempoRestante.textContent =
            `${minutosRestantes} minutos restantes`;
    }

    const porcentagem =
        (tempoAtual / tempoTotal) * 100;

    barraProgresso.style.width =
        `${porcentagem}%`;

}

/* INICIAR CONTAGEM */
function iniciarTimer() {

    /* Evita criar mais de um intervalo.*/
    if (timer !== null) {
        return;
    }

    timer =
        setInterval(
            function() {
                tempoAtual--;
                atualizarTela();

                if (tempoAtual <= 0) {

                    finalizarTimeboxing();

                }

            },
            1000
        );

}

/* FINALIZAR */
function finalizarTimeboxing() {

    /* Para o timer*/
    clearInterval(timer);

    timer = null;

    tempoAtual = 0;

    barraProgresso.style.width = "0%";

    tituloTimer.textContent = "Encerrado";

    tempoRestante.textContent = "";

    document.body.classList.add(
        "finalizado"
    );
    mostrarRecomendacoes();

}

/* RECOMENDACOES */
function mostrarRecomendacoes() {
    videosRecomendados.innerHTML =
        "";

    const canaisDisponiveis =
        [...canais];

    canaisDisponiveis.sort(
        () => Math.random() - 0.5
    );

    const selecionados =
        canaisDisponiveis.slice(0, 4);

    /* Cria os cards.*/
    selecionados.forEach(
        function(canal) {

            const card =document.createElement("div");

            card.classList.add(
                "card-canal"
            );

            const imagem = document.createElement("img");

            imagem.src = canal.imagem;

            imagem.alt ="Canal recomendado";

            card.appendChild(
                imagem
            );

            card.addEventListener(
                "click",
                function() {

                    window.open(
                        canal.link,
                        "_blank"
                    );

                }
            );

            videosRecomendados.appendChild(
                card
            );

        }
    );

    /* Mostra a secao */
    recomendacoes.style.display =
        "block";

}

/* INICIALIZAÇÃO */
atualizarTempoSelecionado();