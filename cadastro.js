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

// Formatar número de telefone
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
        value = `${value.slice(0, 9)}-${value.slice(9)}`;
    }
    
    input.value = value;
}

// Adicionar formatação ao campo de telefone
document.getElementById('regPhone').addEventListener('input', (e) => formatPhoneNumber(e.target));

// Manipular envio do formulário
userRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.replace(/\D/g, '');
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validações
    if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    if (isEmailRegistered(email)) {
        alert('Este email já está cadastrado.');
        return;
    }

    // Criar objeto do usuário
    const user = {
        name,
        email,
        phone,
        password
    };

    try {
        // Salvar usuário na lista de usuários
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));

        // Mostrar mensagem de sucesso
        alert('Cadastro realizado com sucesso! Por favor, faça login para continuar.');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        alert('Ocorreu um erro ao salvar os dados. Por favor, tente novamente.');
    }
}); 