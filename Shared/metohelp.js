// =====================================================================
// METOHELP - Camada de dados (Supabase)
// Todas as telas usam este arquivo. Carregue DEPOIS do SDK do Supabase:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="../Shared/metohelp.js"></script>
// =====================================================================

// >>> PREENCHA AQUI (Supabase > Project Settings > API) <<<
// A "anon key" é pública por design; quem protege os dados são as regras RLS do schema.sql.
const SUPABASE_URL = "https://bieogiolbczcnyjkywqp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_m2a-Uwm7MHGgZHACTzj7Ew_6gos-Qnv";

(function () {
    // Configurado = as duas constantes preenchidas (não depende do valor, só de não ser o modelo)
    const configurado =
        !!window.supabase &&
        /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL) &&
        SUPABASE_ANON_KEY.length > 20 &&
        !SUPABASE_ANON_KEY.startsWith("SUA_");

    const client = configurado
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    const METAS = { horasSemana: 12, totalMetodos: 6 };

    // Caminho da pasta Login a partir de qualquer tela (todas ficam 1 ou 2 níveis abaixo da raiz)
    function urlLogin() {
        const base = new URL(document.currentScript ? document.currentScript.src : location.href);
        return new URL("../Login/login.html", base).href;
    }
    const LOGIN_URL = urlLogin();

    // Garante usuário logado; senão manda para o login. Retorna { user, profile }.
    async function exigirLogin() {
        if (!client) {
            console.error("Supabase não configurado em Shared/metohelp.js");
            window.location.href = LOGIN_URL;
            return new Promise(() => {});
        }
        const { data } = await client.auth.getSession();
        if (!data.session) {
            window.location.href = LOGIN_URL;
            return new Promise(() => {}); // interrompe a execução da página
        }
        const profile = await carregarPerfil(data.session.user.id);
        return { user: data.session.user, profile };
    }

    async function carregarPerfil(userId) {
        const { data, error } = await client
            .from("profiles").select("*").eq("id", userId).maybeSingle();
        if (error) console.error("Erro ao carregar perfil:", error);
        return data;
    }

    async function sair() {
        await client.auth.signOut();
        window.location.href = LOGIN_URL;
    }

    // Domingo 00:00 (hora local) da semana atual — mesmo início do calendário da Home
    function inicioDaSemana() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    async function estatisticas() {
        const { data, error } = await client.rpc("minhas_estatisticas", {
            p_inicio_semana: inicioDaSemana().toISOString()
        });
        if (error) { console.error("Erro nas estatísticas:", error); return null; }
        return data;
    }

    async function titulosDoUsuario() {
        const [{ data: todos }, { data: meus }] = await Promise.all([
            client.from("titulos").select("*").order("ordem"),
            client.from("usuario_titulos").select("titulo_id")
        ]);
        const ids = new Set((meus || []).map(t => t.titulo_id));
        return {
            desbloqueados: (todos || []).filter(t => ids.has(t.id)),
            bloqueados: (todos || []).filter(t => !ids.has(t.id))
        };
    }

    // Abre uma sessão de estudo. Ela só passa a contar no Perfil/Home quando for FINALIZADA.
    //   const sessao = await Metohelp.registrarSessao("pomodoro");
    //   await sessao.finalizar({ nota, resumo, detalhes });  // com autoavaliação
    //   await sessao.finalizar(null);                        // saindo sem avaliar
    async function registrarSessao(metodo) {
        if (!client) return null;
        const { data: s } = await client.auth.getSession();
        if (!s.session) return null;

        const userId = s.session.user.id;
        const { data, error } = await client
            .from("metodo_sessoes")
            .insert({ metodo, user_id: userId })
            .select("id")
            .single();
        if (error) { console.error("Erro ao registrar sessão:", error); return null; }

        const inicio = Date.now();
        let finalizada = false;

        return {
            id: data.id,
            async finalizar(avaliacao) {
                if (finalizada) return;
                const { error: e } = await client
                    .from("metodo_sessoes")
                    .update({
                        duracao_segundos: Math.round((Date.now() - inicio) / 1000),
                        concluida_em: new Date().toISOString()
                    })
                    .eq("id", data.id);
                if (e) throw e;
                finalizada = true;

                if (avaliacao) {
                    const { error: e2 } = await client.from("autoavaliacoes").insert({
                        user_id: userId,
                        sessao_id: data.id,
                        metodo: avaliacao.nomeMetodo || metodo,
                        nota: avaliacao.nota || null,
                        resumo: avaliacao.resumo,
                        detalhes: avaliacao.detalhes || null
                    });
                    if (e2) throw e2;
                }
            }
        };
    }

    async function autoavaliacoes() {
        const { data, error } = await client
            .from("autoavaliacoes").select("*").order("created_at", { ascending: true });
        if (error) console.error("Erro nas autoavaliações:", error);
        return data || [];
    }

    async function atualizarPerfil(userId, campos) {
        const { error } = await client.from("profiles").update(campos).eq("id", userId);
        if (error) throw error;
    }

    // Envia a foto para o Storage e devolve a URL pública
    async function enviarFoto(userId, arquivo) {
        const ext = (arquivo.name.split(".").pop() || "png").toLowerCase();
        const caminho = `${userId}/avatar-${Date.now()}.${ext}`; // nome novo a cada envio: só precisa de permissão de insert
        const { error } = await client.storage
            .from("avatars").upload(caminho, arquivo, { contentType: arquivo.type });
        if (error) throw error;
        const { data } = client.storage.from("avatars").getPublicUrl(caminho);
        return data.publicUrl;
    }

    const FOTO_PADRAO = "https://bieogiolbczcnyjkywqp.supabase.co/storage/v1/object/public/avatars/Logo_V2.png";

    window.Metohelp = {
        client, configurado, METAS, FOTO_PADRAO, LOGIN_URL,
        exigirLogin, sair, estatisticas, titulosDoUsuario, registrarSessao,
        autoavaliacoes, atualizarPerfil, enviarFoto, inicioDaSemana
    };
})();
