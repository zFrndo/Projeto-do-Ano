document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // DADOS DO USUÁRIO (Supabase)
    // =====================================

    const { user, profile } = await Metohelp.exigirLogin();

    let perfil = {
        nome: profile?.nome || profile?.username || "Usuário",
        foto: profile?.foto_url || Metohelp.FOTO_PADRAO,
        titulo: profile?.titulo || "",
        corFrase: profile?.cor_frase || "#fff1f8",
        corSite: profile?.cor_site || "#ffffff",
        diasEstudo: 0,
        metodosUsados: 0,
        conquistas: 0
    };
    let avaliacoes = [];
    let titulosDesbloqueados = [];
    let titulosBloqueados = [];

    async function carregarDados() {
        const [stats, titulos, avs] = await Promise.all([
            Metohelp.estatisticas(),
            Metohelp.titulosDoUsuario(),
            Metohelp.autoavaliacoes()
        ]);
        if (stats) {
            perfil.diasEstudo = stats.dias_estudo;
            perfil.metodosUsados = stats.total_sessoes;
        }
        titulosDesbloqueados = titulos.desbloqueados.map(t => t.nome);
        titulosBloqueados = titulos.bloqueados.map(t => t.nome);
        perfil.conquistas = titulosDesbloqueados.length;
        avaliacoes = avs.map(a => ({
            id: a.id,
            data: new Date(a.created_at).toLocaleDateString("pt-BR"),
            metodo: a.metodo,
            resumo: a.resumo,
            detalhes: a.detalhes || "",
            nota: a.nota
        }));
    }

    // =====================================
    // ELEMENTOS DA INTERFACE
    // =====================================

    const btnMenu = document.getElementById("btnMenu");
    const barraLateral = document.getElementById("barraLateral");

    const modalEdicao = document.getElementById("modalEdicao");
    const modalAvaliacoes = document.getElementById("modalAvaliacoes");
    const modalDetalhes = document.getElementById("modalDetalhes");

    const abrirEdicao = document.getElementById("abrirEdicao");
    const abrirAvaliacoes = document.getElementById("abrirAvaliacoes");

    const nomeUsuario = document.getElementById("nomeUsuario");
    const tituloUsuario = document.getElementById("tituloUsuario");
    const fotoPerfil = document.getElementById("fotoPerfil");
    const fraseMotivacional = document.getElementById("fraseMotivacional");

    const inputNome = document.getElementById("inputNome");
    const inputTitulo = document.getElementById("inputTitulo");
    const inputFoto = document.getElementById("inputFoto");
    const previewFoto = document.getElementById("previewFoto");

    let corFraseSelecionada = perfil.corFrase;
    let corSiteSelecionada = perfil.corSite;

    // =====================================
    // APLICAR DADOS SALVOS NA TELA
    // =====================================

    function atualizarInterface() {
        nomeUsuario.textContent = perfil.nome;
        tituloUsuario.textContent = perfil.titulo ? `"${perfil.titulo}"` : "Sem título ainda";
        fotoPerfil.src = perfil.foto;
        previewFoto.src = perfil.foto;
        fraseMotivacional.style.backgroundColor = perfil.corFrase;
        document.body.style.backgroundColor = perfil.corSite;
        document.getElementById("diasEstudo").textContent = String(perfil.diasEstudo).padStart(2, '0');
        document.getElementById("metodosUsados").textContent = String(perfil.metodosUsados).padStart(2, '0');
        document.getElementById("conquistas").textContent = perfil.conquistas;
    }

    await carregarDados();
    atualizarInterface();
    mostrarUltimoLivro(profile?.ultimo_livro);

    // =====================================
    // ÚLTIMO LIVRO ACESSADO (o último clicado nas recomendações)
    // =====================================

    function mostrarUltimoLivro(livro) {
        const link = document.getElementById("linkLivro");
        const capa = document.getElementById("capaLivro");
        const nome = document.getElementById("nomeLivro");
        const autor = document.getElementById("autorLivro");
        const acao = link.querySelector(".livro-info span");

        if (!livro) {
            nome.textContent = "Nenhum livro ainda";
            autor.textContent = "Clique em um livro ao final de um método";
            link.href = Metohelp.MEC_LIVROS;
            capa.src = Metohelp.capaLivro({ titulo: "?", autor: "", cor: "#e6e6e6" });
            if (acao) acao.textContent = "Ver livros no MEC ↗";
            return;
        }
        nome.textContent = livro.titulo;
        autor.textContent = livro.autor;
        link.href = livro.link || Metohelp.MEC_LIVROS;
        capa.src = Metohelp.capaLivro(livro);
        capa.alt = `Capa de ${livro.titulo}`;
        if (acao) acao.textContent = "Continuar lendo ↗";
    }

    // =====================================
    // BARRA LATERAL (MENU HAMBÚRGUER)
    // =====================================

    function alternarMenu() {
        const aberto = barraLateral.classList.toggle("active");
        document.body.classList.toggle("menu-aberto", aberto);
        btnMenu.setAttribute("aria-expanded", aberto);
        btnMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    }

    btnMenu.addEventListener("click", alternarMenu);

    // =====================================
    // CONTROLE DE MODAIS
    // =====================================

    function abrirModal(modal) {
        if (modal) modal.classList.add("ativo");
    }

    function fecharModal(modal) {
        if (modal) modal.classList.remove("ativo");
    }

    abrirEdicao.addEventListener("click", () => {
        inputNome.value = perfil.nome;
        carregarTitulos();
        marcarCoresSelecionadas();
        abrirModal(modalEdicao);
    });

    abrirAvaliacoes.addEventListener("click", (e) => {
        e.preventDefault();
        renderizarAvaliacoes();
        abrirModal(modalAvaliacoes);
    });

    document.querySelectorAll("[data-fechar]").forEach(botao => {
        const idModal = botao.getAttribute("data-fechar");
        const modal = document.getElementById(idModal);
        botao.addEventListener("click", () => fecharModal(modal));
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) fecharModal(overlay);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            barraLateral.classList.remove("active");
            document.body.classList.remove("menu-aberto");
            btnMenu.setAttribute("aria-expanded", "false");
            document.querySelectorAll(".modal-overlay").forEach(modal => fecharModal(modal));
        }
    });

    // =====================================
    // TÍTULOS E SELECT
    // =====================================

    function carregarTitulos() {
        inputTitulo.innerHTML = "";
        if (titulosDesbloqueados.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Nenhum título desbloqueado ainda";
            inputTitulo.appendChild(opt);
        }
        titulosDesbloqueados.forEach(tit => {
            const opt = document.createElement("option");
            opt.value = tit;
            opt.textContent = tit;
            if (tit === perfil.titulo) opt.selected = true;
            inputTitulo.appendChild(opt);
        });

        const listaBloq = document.getElementById("listaBloqueados");
        listaBloq.innerHTML = "";
        titulosBloqueados.forEach(tit => {
            const span = document.createElement("span");
            span.className = "titulo-bloqueado";
            span.textContent = tit;
            listaBloq.appendChild(span);
        });
    }

    // =====================================
    // SELEÇÃO DE CORES
    // =====================================

    function marcarCoresSelecionadas() {
        document.querySelectorAll("#coresFrase .cor-opcao").forEach(btn => {
            btn.classList.toggle("selecionada", btn.getAttribute("data-cor") === corFraseSelecionada);
        });
        document.querySelectorAll("#coresSite .cor-opcao").forEach(btn => {
            btn.classList.toggle("selecionada", btn.getAttribute("data-cor") === corSiteSelecionada);
        });
    }

    document.querySelectorAll("#coresFrase .cor-opcao").forEach(btn => {
        btn.addEventListener("click", () => {
            corFraseSelecionada = btn.getAttribute("data-cor");
            marcarCoresSelecionadas();
        });
    });

    document.querySelectorAll("#coresSite .cor-opcao").forEach(btn => {
        btn.addEventListener("click", () => {
            corSiteSelecionada = btn.getAttribute("data-cor");
            marcarCoresSelecionadas();
        });
    });

    // =====================================
    // UPLOAD DE FOTO
    // =====================================

    inputFoto.addEventListener("change", (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
            const leitor = new FileReader();
            leitor.onload = (evento) => {
                previewFoto.src = evento.target.result; // só pré-visualização
            };
            leitor.readAsDataURL(arquivo);
        }
    });

    // =====================================
    // SALVAR FORMULÁRIO DE PERFIL
    // =====================================

    let arquivoFoto = null;

    inputFoto.addEventListener("change", (e) => {
        arquivoFoto = e.target.files[0] || null;
    });

    document.getElementById("formPerfil").addEventListener("submit", async (e) => {
        e.preventDefault();
        const botaoSalvar = e.target.querySelector(".salvar-btn");
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";

        try {
            const campos = {
                nome: inputNome.value.trim() || "Usuário",
                titulo: inputTitulo.value || null,
                cor_frase: corFraseSelecionada,
                cor_site: corSiteSelecionada
            };

            if (arquivoFoto) {
                campos.foto_url = await Metohelp.enviarFoto(user.id, arquivoFoto);
            }

            await Metohelp.atualizarPerfil(user.id, campos);

            perfil.nome = campos.nome;
            perfil.titulo = campos.titulo || "";
            perfil.corFrase = campos.cor_frase;
            perfil.corSite = campos.cor_site;
            if (campos.foto_url) perfil.foto = campos.foto_url;
            arquivoFoto = null;

            atualizarInterface();
            fecharModal(modalEdicao);
        } catch (erro) {
            console.error("Erro ao salvar perfil:", erro);
            alert("Não foi possível salvar: " + (erro.message || "tente novamente."));
        } finally {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar alterações";
        }
    });

    // =====================================
    // AUTOAVALIAÇÕES
    // =====================================

    function esc(texto) {
        const d = document.createElement("div");
        d.textContent = texto ?? "";
        return d.innerHTML;
    }

    function renderizarAvaliacoes() {
        const historico = document.getElementById("historicoAvaliacoes");
        const total = document.getElementById("totalAvaliacoes");
        const ultimo = document.getElementById("ultimoMetodo");

        total.textContent = avaliacoes.length;
        ultimo.textContent = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1].metodo : "--";
        historico.innerHTML = "";

        if (avaliacoes.length === 0) {
            historico.innerHTML = `<div class="vazio">Nenhuma autoavaliação registrada ainda.</div>`;
            return;
        }

        avaliacoes.forEach(av => {
            const card = document.createElement("div");
            card.className = "avaliacao-card";
            card.innerHTML = `
                <div class="avaliacao-card-topo">
                    <h3>${esc(av.metodo)}</h3>
                    <span>${esc(av.data)}</span>
                </div>
                <p>${esc(av.resumo)}</p>
            `;
            card.addEventListener("click", () => {
                document.getElementById("detalhesAvaliacao").innerHTML = `
                    <div class="avaliacao-detalhes">
                        <p><strong>Método:</strong> ${esc(av.metodo)}</p>
                        <p><strong>Data:</strong> ${esc(av.data)}</p>
                        <p><strong>Resumo:</strong> ${esc(av.resumo)}</p>
                        ${av.nota ? `<p><strong>Foco:</strong> ${av.nota}/5</p>` : ""}
                        <p><strong>Detalhes:</strong> ${esc(av.detalhes)}</p>
                    </div>
                `;
                abrirModal(modalDetalhes);
            });
            historico.appendChild(card);
        });
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

window.mudarMes = mudarMes;
gerarCalendario();
});