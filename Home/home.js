
/* MENU LATERAL */

const barraLateral = document.getElementById("barraLateral");
const btnMenu = document.getElementById("btnMenu");
const topoSidebar = document.getElementById("topoSidebar");
const conteudo = document.getElementById("conteudo");

function toggleMenu() {
    const menuAberto = barraLateral.classList.toggle("active");

    document.body.classList.toggle("menu-aberto", menuAberto);

    if (menuAberto) {
        topoSidebar.appendChild(btnMenu);
    } else {
        conteudo.prepend(btnMenu);
    }
}

/* CALENDÁRIO */

const mesAno = document.getElementById("mesAno");
const diasCalendario = document.getElementById("diasCalendario");

let dataCalendario = new Date();

const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

function gerarCalendario() {
    diasCalendario.innerHTML = "";

    const ano = dataCalendario.getFullYear();
    const mes = dataCalendario.getMonth();

    mesAno.textContent = `${meses[mes]} ${ano}`;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();

    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement("span");
        diasCalendario.appendChild(vazio);
    }

    for (let dia = 1; dia <= quantidadeDias; dia++) {
        const botao = document.createElement("button");
        botao.textContent = dia;

        const diaSemana = new Date(ano, mes, dia).getDay();

        if (diaSemana === 0) {
            botao.classList.add("domingo");
        }

        if (
            dia === hoje.getDate() &&
            mes === hoje.getMonth() &&
            ano === hoje.getFullYear()
        ) {
            botao.classList.add("hoje");
        }

        botao.addEventListener("click", function () {
            selecionarDia(dia, mes, ano);
        });

        diasCalendario.appendChild(botao);
    }
}

function mudarMes(valor) {
    dataCalendario.setMonth(dataCalendario.getMonth() + valor);
    gerarCalendario();
}

function selecionarDia(dia, mes, ano) {
    console.log(`Dia selecionado: ${dia}/${mes + 1}/${ano}`);
}

gerarCalendario();

/* DATA E SAUDAÇÃO */

const dataAtual = document.getElementById("dataAtual");
const saudacao = document.getElementById("saudacao");

function atualizarData() {
    const hoje = new Date();

    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();

    dataAtual.textContent = `${dia}/${mes}/${ano}`;
}

function atualizarSaudacao() {
    const hora = new Date().getHours();

    let mensagem;

    if (hora >= 5 && hora < 12) {
        mensagem = "Bom Dia";
    } else if (hora >= 12 && hora < 18) {
        mensagem = "Boa Tarde";
    } else if (hora >= 18) {
        mensagem = "Boa Noite";
    } else {
        mensagem = "Boa Madrugada";
    }

    saudacao.textContent = `${mensagem}, Frndo`;
}

atualizarData();
atualizarSaudacao();

/* CARROSSEL DE MÉTODOS */

const gridMetodos = document.getElementById("gridMetodos");
const setaMetodos = document.getElementById("setaMetodos");

const metodos = [
    {
        nome: "Método Pomodoro",
        descricao: "25/5",
        classe: "card-pomodoro",
        pagina: "../Metodos/Pomodoro/pomodoro.html"
    },
    {
        nome: "Timeboxing",
        descricao: "Defina seu tempo",
        classe: "card-timeboxing",
        pagina: "../Metodos/Timeboxing/timeboxing.html"
    },
    {
        nome: "Feyman",
        descricao: "Ler + explicar",
        classe: "card-customizar",
        pagina: "../Metodos/Feyman/feyman.html"
    },
    {
        nome: "Regra 52/17",
        descricao: "52 min + 17 de pausa",
        classe: "card-pomodoro",
        pagina: "../Metodos/52-17/52-17.html"
    },
    {
        nome: "Ultradiana",
        descricao: "90/20",
        classe: "card-timeboxing",
        pagina: "../Metodos/Ultradiana/Ultradiana.html"
    },
    {
        nome: "60-30-10",
        descricao: "60% teoria, 30% exercícios e 10% correção",
        classe: "card-customizar",
        pagina: "../Metodos/60-30-10/60-30-10.html"
    }
];

const quantidadePorPagina = 3;
let paginaMetodos = 0;

function mostrarMetodos() {
    const inicio = paginaMetodos * quantidadePorPagina;
    const fim = inicio + quantidadePorPagina;
    const metodosAtuais = metodos.slice(inicio, fim);

    gridMetodos.innerHTML = "";

    metodosAtuais.forEach(function (metodo) {
        const card = document.createElement("a");

        card.classList.add("card", metodo.classe);
        card.href = metodo.pagina;

        card.innerHTML = `
            <h2>${metodo.nome}</h2>
            <p>${metodo.descricao}</p>
        `;

        gridMetodos.appendChild(card);
    });
}

function proximaPaginaMetodos() {
    gridMetodos.classList.add("trocando");

    setTimeout(function () {
        const totalPaginas = Math.ceil(
            metodos.length / quantidadePorPagina
        );

        paginaMetodos++;

        if (paginaMetodos >= totalPaginas) {
            paginaMetodos = 0;
        }

        mostrarMetodos();
        gridMetodos.classList.remove("trocando");
    }, 250);
}

setaMetodos.addEventListener("click", proximaPaginaMetodos);

mostrarMetodos();
