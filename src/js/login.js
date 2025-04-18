// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');

    // Verificar se os elementos foram encontrados
    if (!loginForm || !nameInput || !emailInput || !passwordInput) {
        console.error('Elementos do formulário não encontrados!');
        return;
    }

    // Verificar se o usuário já está logado
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.email) {
        window.location.href = 'index.html';
        return;
    }

    // Função para mostrar/esconder senha
    if (togglePassword) {
        togglePassword.addEventListener('click', (e) => {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // Função para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Função para mostrar mensagem de erro
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Função para validar o login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Limpar mensagem de erro anterior
        if (errorMessage) {
            errorMessage.textContent = '';
        }
        
        // Validar campos
        if (!name || !email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Por favor, insira um e-mail válido.');
            return;
        }

        try {
            // Buscar usuários no localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password && u.name === name);

            if (user) {
                // Salvar usuário atual na sessão
                localStorage.setItem('userData', JSON.stringify({
                    name: user.name,
                    email: user.email
                }));
                
                // Redirecionar para a página principal usando replace
                window.location.replace('index.html');
            } else {
                showError('Nome, e-mail ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro ao processar login:', error);
            showError('Ocorreu um erro ao processar seu login. Por favor, tente novamente.');
        }
    });

    // Remover qualquer interceptação do link de recuperação
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'recuperacao.html';
        });
    }

    // Melhorias para dispositivos móveis
    if ('ontouchstart' in window) {
        // Ajustar tamanho dos inputs para melhor usabilidade em touch
        [nameInput, emailInput, passwordInput].forEach(input => {
            input.style.minHeight = '44px'; // Tamanho mínimo recomendado para touch
        });

        // Melhorar feedback visual em touch
        loginForm.querySelectorAll('button, input').forEach(element => {
            element.style.webkitTapHighlightColor = 'rgba(0, 123, 255, 0.3)';
        });
    }

    // Prevenir zoom automático em iOS
    document.addEventListener('focusin', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            window.scrollTo(0, 0);
        }
    });
}); 