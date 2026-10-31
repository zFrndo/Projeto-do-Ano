// Configuração do Supabase
const SUPABASE_URL = "SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "SUA_SUPABASE_ANON_KEY";

let supabaseClient = null;
if (window.supabase && SUPABASE_URL !== "SUA_SUPABASE_URL") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Estados temporários do cadastro
let cadastroData = {
    email: "",
    password: "",
    username: "",
    theme: "lime"
};

// Elementos das Etapas
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step4 = document.getElementById("step-4");

const formStep1 = document.getElementById("form-step-1");
const formStep2 = document.getElementById("form-step-2");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const errorMsg = document.getElementById("error-msg");
const toggleSignupPassword = document.getElementById("toggle-signup-password");
const btnFinalize = document.getElementById("btn-finalize");

// Mostrar/Ocultar Senha
if (toggleSignupPassword) {
    toggleSignupPassword.addEventListener("click", () => {
        const isPass = passwordInput.type === "password";
        passwordInput.type = isPass ? "text" : "password";
    });
}

// ETAPA 1: Submeter E-mail e Senha -> Avança para a Etapa 2
formStep1.addEventListener("submit", (e) => {
    e.preventDefault();
    cadastroData.email = emailInput.value.trim();
    cadastroData.password = passwordInput.value;

    if (!cadastroData.email || !cadastroData.password) return;

    step1.classList.remove("active");
    step2.classList.add("active");
});

// ETAPA 2: Validar e Escolher Nome de Utilizador
formStep2.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    errorMsg.style.display = "none";

    if (!username) return;

    // Verificar se o username já existe na base de dados via Supabase
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from("profiles")
                .select("username")
                .eq("username", username)
                .maybeSingle();

            if (data) {
                // Se encontrar um registo, exibe o aviso em laranja idêntico à imagem
                errorMsg.style.display = "block";
                return;
            }
        } catch (err) {
            console.error("Erro ao validar utilizador:", err);
        }
    }

    cadastroData.username = username;

    // Atualiza os nomes nos cards de pré-visualização da última tela
    document.querySelectorAll(".display-username").forEach(el => {
        el.textContent = username;
    });

    // Avança para a etapa final
    step2.classList.remove("active");
    step4.classList.add("active");
});

// Seleção de Tema nos Cards da Etapa Final
document.querySelectorAll(".preview-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".preview-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        cadastroData.theme = card.getAttribute("data-theme");
    });
});

// ETAPA 4: Finalizar e Gravar no Supabase Auth + Profiles
btnFinalize.addEventListener("click", async () => {
    btnFinalize.disabled = true;
    btnFinalize.textContent = "A criar conta...";

    if (supabaseClient) {
        try {
            // 1. Criar utilizador no Supabase Auth
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: cadastroData.email,
                password: cadastroData.password
            });

            if (authError) throw authError;

            // 2. Inserir dados adicionais na tabela 'profiles'
            if (authData.user) {
                const { error: profileError } = await supabaseClient
                    .from("profiles")
                    .insert([
                        {
                            id: authData.user.id,
                            username: cadastroData.username,
                            email: cadastroData.email,
                            theme: cadastroData.theme
                        }
                    ]);

                if (profileError) throw profileError;
            }

            alert("Conta criada com sucesso! Redirecionando para o login...");
            window.location.href = "../Login/login.html";

        } catch (error) {
            console.error("Erro no registo:", error);
            alert("Erro ao criar conta: " + (error.message || "Tente novamente."));
            btnFinalize.disabled = false;
            btnFinalize.textContent = "Finalizar";
        }
    } else {
        // Modo simulação caso o Supabase não esteja configurado
        alert("Simulação de cadastro concluída com sucesso!");
        window.location.href = "../Login/login.html";
    }
});