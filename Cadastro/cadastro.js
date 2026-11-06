// Cliente do Supabase (configurado em ../Shared/metohelp.js)
const supabaseClient = Metohelp.client;

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

    // Verificar se o nome de usuário está livre (função segura no Supabase)
    if (supabaseClient) {
        try {
            const { data: livre, error } = await supabaseClient.rpc(
                "username_disponivel",
                { input_username: username }
            );

            if (error) throw error;

            if (livre === false) {
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
    if (!supabaseClient) {
        alert("Configure os dados do Supabase no arquivo Shared/metohelp.js.");
        return;
    }

    btnFinalize.disabled = true;
    btnFinalize.textContent = "A criar conta...";

    try {
        // O perfil (username e tema) é criado automaticamente no banco por um trigger
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: cadastroData.email,
            password: cadastroData.password,
            options: {
                data: {
                    username: cadastroData.username,
                    theme: cadastroData.theme
                }
            }
        });

        if (authError) throw authError;

        // Com "Confirm email" ligado no Supabase, não há sessão até confirmar o e-mail
        if (authData.session) {
            await supabaseClient.auth.signOut();
            alert("Conta criada com sucesso! Redirecionando para o login...");
        } else {
            alert("Conta criada! Confirme seu e-mail e depois faça login.");
        }

        localStorage.setItem("metohelp_ja_visitou", "true");
        window.location.href = "../Login/login.html";

    } catch (error) {
        console.error("Erro no registo:", error);
        const msg = String(error.message || "");
        if (/already registered/i.test(msg)) {
            alert("Este e-mail já está cadastrado. Tente fazer login.");
        } else if (/database error|duplicate|unique/i.test(msg)) {
            alert("Esse nome de usuário acabou de ser escolhido por outra pessoa. Volte e tente outro.");
        } else {
            alert("Erro ao criar conta: " + (msg || "Tente novamente."));
        }
        btnFinalize.disabled = false;
        btnFinalize.textContent = "Finalizar";
    }
});
