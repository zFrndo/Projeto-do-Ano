// Configurações do Supabase
const SUPABASE_URL = "SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "SUA_SUPABASE_ANON_KEY";

let supabaseClient = null;

if (
    window.supabase &&
    SUPABASE_URL !== "SUA_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "SUA_SUPABASE_ANON_KEY"
) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
}

// VERIFICAÇÃO DE PRIMEIRO ACESSO:
// Se ainda não existi a chave 'ja_visitou' no navegador, redireciona para a tela de boas-vindas
if (!localStorage.getItem("metohelp_ja_visitou")) {
    window.location.href = "../Login/boasvindas.html";
}

// Elementos da tela
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const feedback = document.getElementById("feedback");
const togglePassword = document.getElementById("toggle-password");

// Exibe mensagens na tela
function showFeedback(message, type = "") {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

// Mostrar ou ocultar senha
if (togglePassword) {
    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        togglePassword.setAttribute(
            "aria-label",
            isPassword ? "Ocultar senha" : "Mostrar senha"
        );
    });
}

// Realizar login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    showFeedback("");

    if (!supabaseClient) {
        showFeedback(
            "Configure os dados do Supabase no arquivo login.js.",
            "error"
        );
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showFeedback("Preencha seu usuário e sua senha.", "error");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";

    try {
        let email = username;

        // Se não for um e-mail, busca o e-mail pelo nome de usuário via RPC
        if (!username.includes("@")) {
            const { data, error } = await supabaseClient.rpc(
                "get_email_by_username",
                {
                    input_username: username
                }
            );

            if (error) throw error;

            if (!data) {
                throw new Error("Usuário ou senha inválidos.");
            }

            email = data;
        }

        // Autenticação pelo Supabase Auth
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        showFeedback("Login realizado com sucesso!", "success");
        console.log("Usuário autenticado:", data.user);

        // Marca que o utilizador já realizou login/acesso com sucesso
        localStorage.setItem("metohelp_ja_visitou", "true");

        // Redirecionamento para a página inicial (Home)
        setTimeout(() => {
            window.location.href = "../Home/home.html";
        }, 1000);

    } catch (error) {
        console.error("Erro ao realizar login:", error);
        showFeedback(
            traduzirErro(error.message),
            "error"
        );
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
    }
});

// Traduz mensagens de erro do Supabase
function traduzirErro(message) {
    const mensagens = {
        "Invalid login credentials": "Usuário ou senha incorretos.",
        "Email not confirmed": "Confirme seu e-mail antes de entrar."
    };

    return mensagens[message] || message || "Não foi possível entrar. Tente novamente.";
}