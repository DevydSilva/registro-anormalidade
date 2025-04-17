// Módulo de Autenticação
const AuthModule = (function() {
    // Constantes
    const STORAGE_KEYS = {
        USERS: 'users',
        USER_DATA: 'userData'
    };

    // Elementos do DOM
    const elements = {
        loginForm: null,
        nameInput: null,
        emailInput: null,
        passwordInput: null,
        messageElement: null
    };

    // Funções privadas
    function initializeElements() {
        elements.loginForm = document.getElementById('loginForm');
        elements.nameInput = document.getElementById('name');
        elements.emailInput = document.getElementById('email');
        elements.passwordInput = document.getElementById('password');
        elements.messageElement = document.querySelector('.register-message');

        if (!elements.loginForm || !elements.nameInput || !elements.emailInput || !elements.passwordInput) {
            throw new Error('Elementos do formulário não encontrados!');
        }
    }

    function checkUserExists(email) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        return users.some(user => user.email === email);
    }

    function checkCredentials(name, email, password) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        return users.find(user => 
            user.name === name && 
            user.email === email && 
            user.password === password
        );
    }

    function showErrorMessage(message) {
        if (elements.messageElement) {
            elements.messageElement.style.display = 'block';
            elements.messageElement.textContent = message;
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        
        const name = elements.nameInput.value.trim();
        const email = elements.emailInput.value.trim();
        const password = elements.passwordInput.value;

        if (!name || !email || !password) {
            showErrorMessage('Por favor, preencha todos os campos!');
            return;
        }

        if (!checkUserExists(email)) {
            showErrorMessage('Usuário não encontrado. Por favor, cadastre-se.');
            return;
        }

        const user = checkCredentials(name, email, password);
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
                name: user.name,
                email: user.email,
                lastLogin: new Date().toISOString()
            }));
            window.location.href = 'index.html';
        } else {
            showErrorMessage('Credenciais inválidas. Por favor, tente novamente.');
        }
    }

    function checkLoggedInUser() {
        const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
        if (userData && userData.email) {
            window.location.href = 'index.html';
        }
    }

    // Interface pública
    return {
        init: function() {
            try {
                initializeElements();
                checkLoggedInUser();
                elements.loginForm.addEventListener('submit', handleLogin);
            } catch (error) {
                console.error('Erro ao inicializar módulo de autenticação:', error);
                showErrorMessage('Erro ao carregar a página. Por favor, recarregue.');
            }
        }
    };
})();

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
}); 