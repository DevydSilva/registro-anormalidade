// Verificar se o usuário já está logado
window.addEventListener('load', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.email) {
        window.location.href = 'registro.html';
    }

    // Verificar se há um email pendente do login
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (pendingEmail) {
        document.getElementById('regEmail').value = pendingEmail;
        localStorage.removeItem('pendingEmail');
    }
});

// Elementos do DOM
const userRegisterForm = document.getElementById('userRegisterForm');

// Função para verificar se o email já está cadastrado
function isEmailRegistered(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.email === email);
}

// Função para formatar o número de telefone
function formatPhoneNumber(input) {
    // Remove todos os caracteres não numéricos
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    value = value.substring(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    }
    if (value.length > 10) {
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    input.value = value;
}

// Adiciona o evento de input para o campo de telefone
document.getElementById('regPhone').addEventListener('input', function(e) {
    formatPhoneNumber(e.target);
});

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.querySelector('.error-message');

    // Validação do formulário
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Validações básicas
        if (!name || !email || !phone || !password || !confirmPassword) {
            showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPassword) {
            showError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Criar objeto com os dados do usuário
        const userData = {
            name,
            email,
            phone,
            password
        };

        // Salvar no localStorage (simulando um banco de dados)
        saveUser(userData);
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    });

    function showError(message) {
        if (!errorMessage) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            registerForm.insertBefore(errorDiv, registerForm.firstChild);
        }
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    function saveUser(userData) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
    }
});

// Função para validar o formato do email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modifica a função de validação do formulário
function validateForm() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const phone = document.getElementById('regPhone').value;
    
    // Validação do email
    if (!validateEmail(email)) {
        showError('Por favor, insira um email válido');
        return false;
    }
    
    // Validação do telefone (deve ter pelo menos 14 caracteres com a máscara)
    if (phone.length < 14) {
        showError('Por favor, insira um número de telefone válido');
        return false;
    }
    
    // ... existing validation code ...
} 