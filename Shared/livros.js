// =====================================================================
// METOHELP - Livros recomendados (MEC Livros) + "Último livro acessado"
// Carregue depois de metohelp.js:  <script src="../../Shared/livros.js"></script>
//   Metohelp.mostrarLivros(elemento, 4)  -> desenha cards de livros (clicar abre o MEC Livros
//                                           e salva o livro no perfil)
//   Metohelp.capaLivro(livro)            -> capa (imagem SVG) gerada para o livro
// =====================================================================
(function () {
    const MEC_LIVROS = "https://meclivros.mec.gov.br/";

    // >>> EDITE AQUI a lista de livros. "link" = página do livro no MEC Livros
    //     (se não tiver o link direto, deixe MEC_LIVROS que abre a página inicial). <<<
    const LIVROS = [
        { id: "dom-casmurro",      titulo: "Dom Casmurro",                      autor: "Machado de Assis",           cor: "#ff7020", link: MEC_LIVROS },
        { id: "bras-cubas",        titulo: "Memórias Póstumas de Brás Cubas",   autor: "Machado de Assis",           cor: "#85f0e5", link: MEC_LIVROS },
        { id: "o-alienista",       titulo: "O Alienista",                       autor: "Machado de Assis",           cor: "#8cf53b", link: MEC_LIVROS },
        { id: "iracema",           titulo: "Iracema",                           autor: "José de Alencar",            cor: "#ec268f", link: MEC_LIVROS },
        { id: "o-cortico",         titulo: "O Cortiço",                         autor: "Aluísio Azevedo",            cor: "#ffb184", link: MEC_LIVROS },
        { id: "policarpo",         titulo: "Triste Fim de Policarpo Quaresma",  autor: "Lima Barreto",               cor: "#3ad4be", link: MEC_LIVROS },
        { id: "sargento-milicias", titulo: "Memórias de um Sargento de Milícias", autor: "Manuel Antônio de Almeida", cor: "#a3ff00", link: MEC_LIVROS },
        { id: "a-moreninha",       titulo: "A Moreninha",                       autor: "Joaquim Manuel de Macedo",   cor: "#ffd1b8", link: MEC_LIVROS }
    ];

    function esc(t) {
        return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    // Quebra o título em linhas curtas para caber na capa
    function quebrar(texto, max) {
        const linhas = []; let atual = "";
        texto.split(" ").forEach(p => {
            if ((atual + " " + p).trim().length > max && atual) { linhas.push(atual); atual = p; }
            else atual = (atual + " " + p).trim();
        });
        if (atual) linhas.push(atual);
        return linhas.slice(0, 5);
    }

    // Capa gerada (SVG em data URI): funciona em <img> sem precisar de arquivos de imagem
    function capaLivro(livro) {
        const cor = livro.cor || "#85f0e5";
        const linhas = quebrar(livro.titulo || "", 14);
        const texto = linhas.map((l, i) =>
            `<text x="100" y="${90 + i * 26}" text-anchor="middle" font-family="Arial" font-size="21" font-weight="700" fill="#030303">${esc(l)}</text>`
        ).join("");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280">
            <rect width="200" height="280" rx="10" fill="${esc(cor)}"/>
            <rect x="12" y="12" width="176" height="256" rx="6" fill="none" stroke="#030303" stroke-opacity=".25" stroke-width="2"/>
            ${texto}
            <text x="100" y="250" text-anchor="middle" font-family="Arial" font-size="14" fill="#030303" fill-opacity=".75">${esc(livro.autor || "")}</text>
        </svg>`;
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }

    // Salva o livro clicado como "último livro acessado" no perfil (não trava a abertura do link)
    async function registrarLivro(livro) {
        const cli = Metohelp.client;
        if (!cli) return;
        try {
            const { data: s } = await cli.auth.getSession();
            if (!s.session) return;
            const { error } = await cli.from("profiles").update({
                ultimo_livro: {
                    id: livro.id, titulo: livro.titulo, autor: livro.autor,
                    cor: livro.cor, link: livro.link, em: new Date().toISOString()
                }
            }).eq("id", s.session.user.id);
            if (error) console.error("Erro ao salvar último livro:", error);
        } catch (e) { console.error("Erro ao salvar último livro:", e); }
    }

    let estiloInjetado = false;
    function injetarEstilo() {
        if (estiloInjetado) return; estiloInjetado = true;
        const st = document.createElement("style");
        st.textContent = `
        .titulo-livros{font-size:28px;font-weight:400;margin:50px 0 35px}
        .card-livro{height:260px;border:2px solid #85f0e5;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;
            align-items:center;justify-content:flex-start;gap:8px;padding:10px;background:#fff;color:#030303;text-decoration:none;
            transition:transform .2s ease,box-shadow .2s ease}
        .card-livro:hover{transform:translateY(-7px);box-shadow:0 10px 20px rgba(0,0,0,.10)}
        .card-livro img{height:190px;width:auto;border-radius:6px;display:block}
        .card-livro span{font-size:15px;text-align:center;line-height:1.2}
        @media (max-width:600px){.card-livro{height:240px}}`;
        document.head.appendChild(st);
    }

    // Desenha N livros sorteados dentro de "container"
    function mostrarLivros(container, quantidade = 4) {
        if (!container) return;
        injetarEstilo();
        container.innerHTML = "";
        [...LIVROS].sort(() => Math.random() - 0.5).slice(0, quantidade).forEach(livro => {
            const a = document.createElement("a");
            a.className = "card-livro";
            a.href = livro.link;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.setAttribute("aria-label", `${livro.titulo}, de ${livro.autor}. Abrir no MEC Livros`);

            const img = document.createElement("img");
            img.src = capaLivro(livro);
            img.alt = `Capa de ${livro.titulo}`;

            const nome = document.createElement("span");
            nome.textContent = livro.autor;

            a.append(img, nome);
            a.addEventListener("click", () => registrarLivro(livro)); // abre o link e salva em paralelo
            container.appendChild(a);
        });
    }

    Object.assign(window.Metohelp, { LIVROS, MEC_LIVROS, mostrarLivros, capaLivro, registrarLivro });
})();
