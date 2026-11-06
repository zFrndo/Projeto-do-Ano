// =====================================================================
// METOHELP - Encerramento de sessão + autoavaliação
// Carregue depois de metohelp.js. Uso nas telas de método:
//   MetohelpFim.iniciar("pomodoro", "Pomodoro");   // registra a sessão e mostra "Encerrar sessão"
//   MetohelpFim.abrir({ resumo: "..." });          // abre a avaliação (ex.: quando o tempo acaba)
// A sessão só conta no Perfil quando termina: avaliando OU saindo sem avaliar.
// =====================================================================
(function () {
    const HOME_URL = new URL("../index.html", document.currentScript.src).href;

    const css = `
    .mh-encerrar{position:fixed;right:24px;bottom:24px;z-index:900;padding:12px 22px;border-radius:30px;
        border:2px solid #ff7020;background:#ffbf99;color:#ff7020;font:600 18px 'Pliant',Arial,sans-serif;cursor:pointer;
        transition:transform .2s,background-color .2s}
    .mh-encerrar:hover{transform:scale(1.05);background:#ffb184}
    .mh-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.45);display:none;align-items:center;
        justify-content:center;padding:16px;font-family:'Pliant',Arial,sans-serif}
    .mh-overlay.ativo{display:flex}
    .mh-modal{background:#fff;color:#030303;width:100%;max-width:520px;max-height:92vh;overflow:auto;border-radius:18px;padding:28px}
    .mh-modal h2{font-size:28px;font-weight:500;margin-bottom:4px}
    .mh-modal .mh-sub{color:#555;margin-bottom:18px}
    .mh-modal label{display:block;font-size:16px;margin:14px 0 6px}
    .mh-modal input[type=text],.mh-modal textarea{width:100%;border:2px solid #8cf53b;border-radius:10px;padding:10px 12px;font:inherit;font-size:16px}
    .mh-modal textarea{min-height:90px;resize:vertical}
    .mh-notas{display:flex;gap:8px}
    .mh-notas button{flex:1;height:44px;border:2px solid #85f0e5;background:#fff;border-radius:10px;font:inherit;font-size:18px;cursor:pointer}
    .mh-notas button.sel{background:#85f0e5}
    .mh-acoes{display:flex;flex-direction:column;gap:10px;margin-top:22px}
    .mh-acoes button{height:46px;border-radius:24px;font:600 17px 'Pliant',Arial,sans-serif;cursor:pointer}
    .mh-salvar{border:2px solid #4cb800;background:#8cf53b;color:#1d4a00}
    .mh-salvar:disabled{opacity:.5;cursor:not-allowed}
    .mh-sair{border:2px solid #b4b4b4;background:#fff;color:#444}
    .mh-voltar{border:none;background:none;color:#777;text-decoration:underline;height:auto!important}
    .mh-erro{color:#c0392b;font-size:15px;margin-top:10px;min-height:18px}`;

    let sessao = null, nomeMetodo = "", modal = null, nota = 0, enviando = false;

    function montar() {
        if (modal) return;
        const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

        const btn = document.createElement("button");
        btn.className = "mh-encerrar"; btn.type = "button"; btn.textContent = "Encerrar sessão";
        btn.addEventListener("click", () => abrir());
        document.body.appendChild(btn);

        modal = document.createElement("div");
        modal.className = "mh-overlay";
        modal.innerHTML = `
          <div class="mh-modal" role="dialog" aria-modal="true" aria-labelledby="mhTitulo">
            <h2 id="mhTitulo">Como foi sua sessão?</h2>
            <p class="mh-sub" id="mhSub"></p>
            <label>Como foi seu foco? (1 a 5)</label>
            <div class="mh-notas" id="mhNotas"></div>
            <label for="mhResumo">O que você estudou?</label>
            <input type="text" id="mhResumo" maxlength="120" placeholder="Ex.: Funções do 2º grau">
            <label for="mhDetalhes">Observações (opcional)</label>
            <textarea id="mhDetalhes" maxlength="600" placeholder="O que funcionou? O que ficou difícil?"></textarea>
            <p class="mh-erro" id="mhErro" role="alert"></p>
            <div class="mh-acoes">
              <button type="button" class="mh-salvar" id="mhSalvar" disabled>Salvar avaliação e sair</button>
              <button type="button" class="mh-sair" id="mhSair">Sair sem avaliar</button>
              <button type="button" class="mh-voltar" id="mhVoltar">Continuar estudando</button>
            </div>
          </div>`;
        document.body.appendChild(modal);

        const notas = modal.querySelector("#mhNotas");
        for (let i = 1; i <= 5; i++) {
            const b = document.createElement("button");
            b.type = "button"; b.textContent = i;
            b.addEventListener("click", () => {
                nota = i;
                notas.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b));
            });
            notas.appendChild(b);
        }

        const resumo = modal.querySelector("#mhResumo");
        const salvar = modal.querySelector("#mhSalvar");
        resumo.addEventListener("input", () => { salvar.disabled = !resumo.value.trim(); });

        salvar.addEventListener("click", () => encerrar({
            nomeMetodo, nota: nota || null,
            resumo: resumo.value.trim(),
            detalhes: modal.querySelector("#mhDetalhes").value.trim()
        }));
        modal.querySelector("#mhSair").addEventListener("click", () => encerrar(null));
        modal.querySelector("#mhVoltar").addEventListener("click", () => modal.classList.remove("ativo"));
    }

    async function encerrar(avaliacao) {
        if (enviando) return;
        enviando = true;
        const erro = modal.querySelector("#mhErro");
        erro.textContent = "";
        modal.querySelectorAll("button").forEach(b => b.disabled = true);
        try {
            if (sessao) await sessao.finalizar(avaliacao);
            window.location.href = HOME_URL;
        } catch (e) {
            console.error("Erro ao encerrar sessão:", e);
            erro.textContent = "Não foi possível salvar. Tente novamente.";
            enviando = false;
            modal.querySelectorAll("button").forEach(b => b.disabled = false);
            modal.querySelector("#mhSalvar").disabled = !modal.querySelector("#mhResumo").value.trim();
        }
    }

    // Registra a sessão (exige login) e mostra o botão "Encerrar sessão"
    async function iniciar(metodo, nome) {
        nomeMetodo = nome || metodo;
        await Metohelp.exigirLogin();
        sessao = await Metohelp.registrarSessao(metodo);
        montar();
    }

    // Abre a janela de avaliação. opcoes.resumo pré-preenche "O que você estudou?"
    function abrir(opcoes = {}) {
        montar();
        modal.querySelector("#mhSub").textContent =
            `${nomeMetodo}: avalie para registrar no seu perfil, ou saia sem avaliar.`;
        const resumo = modal.querySelector("#mhResumo");
        if (opcoes.resumo && !resumo.value) resumo.value = opcoes.resumo;
        modal.querySelector("#mhSalvar").disabled = !resumo.value.trim();
        modal.classList.add("ativo");
    }

    window.MetohelpFim = { iniciar, abrir };
})();
