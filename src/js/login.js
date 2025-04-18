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
        togglePassword.addEventListener('click', () => {
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

    // Função para validar o login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Limpar mensagem de erro anterior
        if (errorMessage) {
            errorMessage.textContent = '';
        }
        
        // Validar campos
        if (!name || !email || !password) {
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, preencha todos os campos.';
            }
            return;
        }

        if (!validateEmail(email)) {
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, insira um e-mail válido.';
            }
            return;
        }

        // Buscar usuários no localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password && u.name === name);

        if (user) {
            // Salvar usuário atual na sessão
            localStorage.setItem('userData', JSON.stringify({
                name: user.name,
                email: user.email
            }));
            
            // Redirecionar para a página principal
            window.location.href = 'index.html';
        } else {
            if (errorMessage) {
                errorMessage.textContent = 'Nome, e-mail ou senha incorretos.';
            }
        }
    });

    // Função para recuperação de senha
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Digite seu e-mail para recuperar a senha:');
            if (email) {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === email);
                
                if (user) {
                    alert(`Sua senha é: ${user.password}`);
                } else {
                    alert('E-mail não encontrado.');
                }
            }
        });
    }
}); 