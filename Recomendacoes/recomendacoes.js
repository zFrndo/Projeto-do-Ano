/* ELEMENTOS DO MENU */
const barraLateral = document.getElementById("barraLateral");
const btnMenu = document.getElementById("btnMenu");
const topoSidebar = document.getElementById("topoSidebar");
const header = document.querySelector(".headerEfeitoVidro");

/* ABRIR E FECHAR MENU */
function toggleMenu() {
    const menuAberto = barraLateral.classList.toggle("active");

    document.body.classList.toggle("menu-aberto", menuAberto);
    btnMenu.setAttribute("aria-expanded", String(menuAberto));

    if (menuAberto) {
        topoSidebar.appendChild(btnMenu);
    } else {
        header.insertBefore(btnMenu, header.firstChild);
    }
}

/* FECHAR MENU AO CLICAR FORA DELE */
document.addEventListener("click", function(event) {
    if (
        document.body.classList.contains("menu-aberto") &&
        !barraLateral.contains(event.target) &&
        !header.contains(event.target)
    ) {
        barraLateral.classList.remove("active");
        document.body.classList.remove("menu-aberto");
        btnMenu.setAttribute("aria-expanded", "false");
        header.insertBefore(btnMenu, header.firstChild);
    }
});

/* CALENDÁRIO */
const mesAno = document.getElementById("mesAno");
const diasCalendario = document.getElementById("diasCalendario");

let dataCalendario = new Date();

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
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

        botao.addEventListener("click", function() {
            selecionarDia(dia, mes, ano);
        });

        diasCalendario.appendChild(botao);
    }
}

function mudarMes(valor) {
    dataCalendario.setDate(1);
    dataCalendario.setMonth(dataCalendario.getMonth() + valor);
    gerarCalendario();
}

function selecionarDia(dia, mes, ano) {
    console.log(`Dia selecionado: ${dia}/${mes + 1}/${ano}`);
}

gerarCalendario();

/* ELEMENTOS DOS FILTROS */
const listaCategorias = document.getElementById("listaCategorias");
const abrirFiltros = document.getElementById("abrirFiltros");
const fundoModal = document.getElementById("fundoModal");
const fecharFiltros = document.getElementById("fecharFiltros");
const aplicarFiltros = document.getElementById("aplicarFiltros");
const limparFiltros = document.getElementById("limparFiltros");
const semResultados = document.getElementById("semResultados");
const textoResultado = document.getElementById("textoResultado");
const filtrosAtivos = document.getElementById("filtrosAtivos");
const indicadorFiltro = document.getElementById("indicadorFiltro");

/* CONTEÚDOS DE EXEMPLO: SUBSTITUA PELOS VÍDEOS REAIS */
const videos = [
    {
        titulo: "O mistério dos buracos brancos",
        canal: "Ciência Todo Dia",
        tipo: "Vídeos",
        area: "Ciências da Natureza",
        categoria: "Conhecimentos gerais",
        data: "2026-08-12",
        imagem: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=Ci%C3%AAncia+Todo+Dia+buracos+brancos"
    },
    {
        titulo: "Por que a América do Sul tem esse formato?",
        canal: "Geografia em vídeo",
        tipo: "Vídeos",
        area: "Humanas",
        categoria: "Conhecimentos gerais",
        data: "2026-06-20",
        imagem: "https://images.unsplash.com/photo-1524666041070-9fcf5a2879b0?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=geografia+Am%C3%A9rica+do+Sul"
    },
    {
        titulo: "Como estudar melhor usando a memória",
        canal: "Metohelp indica",
        tipo: "Vídeos",
        area: "Conhecimentos gerais",
        categoria: "Conhecimentos gerais",
        data: "2026-10-05",
        imagem: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=t%C3%A9cnicas+de+estudo+mem%C3%B3ria"
    },
    {
        titulo: "Experimentos que parecem impossíveis",
        canal: "Manual do Mundo",
        tipo: "Vídeos",
        area: "Ciências da Natureza",
        categoria: "Conhecimentos gerais",
        data: "2026-04-16",
        imagem: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/@manualdomundo/videos"
    },
    {
        titulo: "Resenha: O alienista, de Machado de Assis",
        canal: "Leitura comentada",
        tipo: "Resenhas",
        area: "Linguagens",
        categoria: "Resenhas literárias",
        data: "2026-09-02",
        imagem: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=resenha+O+Alienista+Machado+de+Assis"
    },
    {
        titulo: "Capitães da Areia: resumo e análise",
        canal: "Literatura em pauta",
        tipo: "Resenhas",
        area: "Linguagens",
        categoria: "Resenhas literárias",
        data: "2026-07-14",
        imagem: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=Capit%C3%A3es+da+Areia+resumo+an%C3%A1lise"
    },
    {
        titulo: "Como interpretar questões de matemática",
        canal: "Professor Ferretto",
        tipo: "Vídeos",
        area: "Matemática",
        categoria: "A equipe recomenda",
        data: "2026-10-01",
        imagem: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/@professorferretto/videos"
    },
    {
        titulo: "Redação do ENEM: introdução na prática",
        canal: "A equipe Metohelp",
        tipo: "Vídeos",
        area: "Linguagens",
        categoria: "A equipe recomenda",
        data: "2026-09-19",
        imagem: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=redacao+ENEM+introducao"
    },
    {
        titulo: "Filme para entender a sociedade",
        canal: "Indicações culturais",
        tipo: "Filmes",
        area: "Humanas",
        categoria: "A equipe recomenda",
        data: "2026-03-10",
        imagem: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=filmes+para+estudar+sociologia"
    },
    {
        titulo: "Introdução à química orgânica",
        canal: "Café com Química",
        tipo: "Vídeos",
        area: "Ciências da Natureza",
        categoria: "Conhecimentos gerais",
        data: "2026-05-23",
        imagem: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=Caf%C3%A9+com+Qu%C3%ADmica+qu%C3%ADmica+org%C3%A2nica"
    },
    {
        titulo: "Filosofia: o que é justiça?",
        canal: "Filosofia explicada",
        tipo: "Vídeos",
        area: "Humanas",
        categoria: "Conhecimentos gerais",
        data: "2026-08-28",
        imagem: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=filosofia+o+que+%C3%A9+justi%C3%A7a"
    },
    {
        titulo: "Filmes baseados em livros que valem a pena",
        canal: "Clube da leitura",
        tipo: "Filmes",
        area: "Linguagens",
        categoria: "Resenhas literárias",
        data: "2026-02-05",
        imagem: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
        link: "https://www.youtube.com/results?search_query=filmes+baseados+em+livros"
    }
];

const categorias = [
    "Conhecimentos gerais",
    "Resenhas literárias",
    "A equipe recomenda"
];

let filtrosAplicados = {
    tipos: ["Vídeos", "Livros", "Resenhas", "Filmes"],
    areas: [
        "Conhecimentos gerais",
        "Ciências da Natureza",
        "Humanas",
        "Linguagens",
        "Matemática",
        "Resenhas literárias",
        "A equipe recomenda"
    ],
    data: "qualquer"
};

/* CRIAR CARD */
function criarCard(video) {
    const link = document.createElement("a");
    link.className = "card-video";
    link.href = video.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${video.titulo}. Abrir no YouTube`);

    const capa = document.createElement("div");
    capa.className = "capa";

    const imagem = document.createElement("img");
    imagem.src = video.imagem;
    imagem.alt = `Capa de ${video.titulo}`;
    imagem.loading = "lazy";

    imagem.onerror = function() {
        imagem.style.display = "none";
        capa.style.background = "linear-gradient(135deg, #252044, #ec268f)";
    };

    const play = document.createElement("span");
    play.className = "play";
    play.setAttribute("aria-hidden", "true");

    capa.append(imagem, play);

    const info = document.createElement("div");
    info.className = "info-video";

    const titulo = document.createElement("p");
    titulo.className = "titulo-video";
    titulo.textContent = video.titulo;

    const meta = document.createElement("p");
    meta.className = "meta-video";
    meta.textContent = video.canal;

    info.append(titulo, meta);
    link.append(capa, info);

    return link;
}

/* FILTRO DE DATA */
function estaDentroDaData(data) {
    if (filtrosAplicados.data === "qualquer") return true;

    const dias = { semana: 7, mes: 30, ano: 365 };
    const dataVideo = new Date(`${data}T00:00:00`);
    const hoje = new Date();
    const limite = new Date();

    limite.setDate(hoje.getDate() - dias[filtrosAplicados.data]);

    return dataVideo >= limite && dataVideo <= hoje;
}

/* EXIBIR CATEGORIAS E VÍDEOS */
function renderizar() {
    listaCategorias.innerHTML = "";
    let quantidade = 0;

    categorias.forEach(categoria => {
        const correspondentes = videos.filter(video =>
            video.categoria === categoria &&
            filtrosAplicados.tipos.includes(video.tipo) &&
            filtrosAplicados.areas.includes(video.area) &&
            estaDentroDaData(video.data)
        );

        if (correspondentes.length === 0) return;

        quantidade += correspondentes.length;

        const secao = document.createElement("section");
        secao.className = "categoria";

        const titulo = document.createElement("h2");
        titulo.textContent = categoria;

        const grade = document.createElement("div");
        grade.className = "grade-videos";

        correspondentes.forEach(video => {
            grade.appendChild(criarCard(video));
        });

        secao.append(titulo, grade);
        listaCategorias.appendChild(secao);
    });

    semResultados.hidden = quantidade > 0;
    textoResultado.textContent =
        `${quantidade} conteúdo${quantidade === 1 ? "" : "s"} encontrado${quantidade === 1 ? "" : "s"}`;

    atualizarResumo();
}

/* ATUALIZAR RESUMO DOS FILTROS */
function atualizarResumo() {
    const todosTipos = ["Vídeos", "Livros", "Resenhas", "Filmes"];
    const todasAreas = [
        "Conhecimentos gerais",
        "Ciências da Natureza",
        "Humanas",
        "Linguagens",
        "Matemática",
        "Resenhas literárias",
        "A equipe recomenda"
    ];

    document.getElementById("resumoTipo").textContent =
        filtrosAplicados.tipos.length === todosTipos.length
            ? "Todos"
            : filtrosAplicados.tipos.length
                ? `${filtrosAplicados.tipos.length} selecionado(s)`
                : "Nenhum";

    document.getElementById("resumoArea").textContent =
        filtrosAplicados.areas.length === todasAreas.length
            ? "Todas"
            : filtrosAplicados.areas.length
                ? `${filtrosAplicados.areas.length} selecionada(s)`
                : "Nenhuma";

    const nomesData = {
        qualquer: "Qualquer",
        ano: "Último ano",
        mes: "Último mês",
        semana: "Última semana"
    };

    document.getElementById("resumoData").textContent =
        nomesData[filtrosAplicados.data];

    const temFiltro =
        filtrosAplicados.tipos.length !== todosTipos.length ||
        filtrosAplicados.areas.length !== todasAreas.length ||
        filtrosAplicados.data !== "qualquer";

    indicadorFiltro.classList.toggle("ativo", temFiltro);
    filtrosAtivos.innerHTML = "";

    if (temFiltro) {
        const textos = [];

        if (filtrosAplicados.tipos.length !== todosTipos.length) {
            textos.push(`Tipo: ${filtrosAplicados.tipos.join(", ") || "nenhum"}`);
        }

        if (filtrosAplicados.areas.length !== todasAreas.length) {
            textos.push(`Área: ${filtrosAplicados.areas.join(", ") || "nenhuma"}`);
        }

        if (filtrosAplicados.data !== "qualquer") {
            textos.push(`Data: ${nomesData[filtrosAplicados.data]}`);
        }

        textos.forEach(texto => {
            const tag = document.createElement("span");
            tag.className = "tag-filtro";
            tag.textContent = texto;
            filtrosAtivos.appendChild(tag);
        });

        filtrosAtivos.hidden = false;
    } else {
        filtrosAtivos.hidden = true;
    }
}

/* ABRIR E FECHAR FILTROS */
function abrirPainel() {
    fundoModal.hidden = false;
    abrirFiltros.setAttribute("aria-expanded", "true");
}

function fecharPainel() {
    fundoModal.hidden = true;
    abrirFiltros.setAttribute("aria-expanded", "false");
}

abrirFiltros.addEventListener("click", abrirPainel);
fecharFiltros.addEventListener("click", fecharPainel);

fundoModal.addEventListener("click", function(event) {
    if (event.target === fundoModal) fecharPainel();
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") fecharPainel();
});

/* EXPANDIR OPÇÕES DOS FILTROS */
document.querySelectorAll("[data-toggle]").forEach(botao => {
    botao.addEventListener("click", function() {
        const nome = botao.dataset.toggle;
        const idOpcoes =
            `opcoes${nome.charAt(0).toUpperCase()}${nome.slice(1)}`;

        const opcoes = document.getElementById(idOpcoes);
        const abrir = opcoes.hidden;

        opcoes.hidden = !abrir;
        botao.setAttribute("aria-expanded", String(abrir));
        botao.querySelector(".seta").textContent = abrir ? "⌃" : "⌄";
    });
});

/* LER FILTROS SELECIONADOS */
function lerFiltrosDoPainel() {
    return {
        tipos: [
            ...document.querySelectorAll('input[name="tipo"]:checked')
        ].map(item => item.value),

        areas: [
            ...document.querySelectorAll('input[name="area"]:checked')
        ].map(item => item.value),

        data: document.querySelector('input[name="data"]:checked').value
    };
}

/* APLICAR FILTROS */
aplicarFiltros.addEventListener("click", function() {
    filtrosAplicados = lerFiltrosDoPainel();
    renderizar();
    fecharPainel();
});

/* LIMPAR FILTROS */
limparFiltros.addEventListener("click", function() {
    document.querySelectorAll('input[name="tipo"], input[name="area"]')
        .forEach(item => item.checked = true);

    document.querySelector('input[name="data"][value="qualquer"]').checked = true;

    filtrosAplicados = lerFiltrosDoPainel();
    renderizar();
});

/* INICIALIZAÇÃO */
renderizar();
