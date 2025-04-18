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
    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const avatarPreview = document.getElementById('avatarPreview');
    const errorMessage = document.querySelector('.error-message');

    // Criar input de arquivo oculto
    const avatarInput = document.createElement('input');
    avatarInput.type = 'file';
    avatarInput.accept = 'image/*';
    avatarInput.style.display = 'none';
    document.body.appendChild(avatarInput);

    // Quando o avatar for clicado, mostrar opções
    avatarWrapper.addEventListener('click', function() {
        const options = [
            { text: 'Escolher Imagem', action: () => avatarInput.click() },
            { text: 'Tirar Selfie', action: startCamera }
        ];

        showOptionsModal(options);
    });

    // Preview da imagem do avatar
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
                avatarPreview.classList.add('active');
            }
            reader.readAsDataURL(file);
        }
    });

    function showOptionsModal(options) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.style.display = 'block';
            button.style.width = '100%';
            button.style.padding = '10px';
            button.style.margin = '5px 0';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.addEventListener('click', () => {
                option.action();
                document.body.removeChild(modal);
            });
            modalContent.appendChild(button);
        });

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    function startCamera() {
        // Implementar a funcionalidade de câmera aqui
        alert('Funcionalidade de câmera será implementada em breve!');
    }

    // Validação do formulário
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const avatar = avatarInput.files[0];

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
            password,
            avatar: avatar ? avatarPreview.src : null
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
        // Obter usuários existentes ou criar array vazio
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar se o email já está cadastrado
        if (users.some(user => user.email === userData.email)) {
            showError('Este email já está cadastrado.');
            return;
        }

        // Adicionar novo usuário
        users.push(userData);
        
        // Salvar no localStorage
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