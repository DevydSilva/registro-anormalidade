// Aguardar o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Verificar se os elementos foram encontrados
    if (!loginForm || !emailInput || !passwordInput) {
        console.error('Elementos do formulário não encontrados!');
        return;
    }

    // Verificar se o usuário já está logado
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.email) {
        window.location.href = 'registro.html';
        return;
    }

    // Função para verificar se o usuário existe
    function checkUserExists(email) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.some(user => user.email === email);
    }

    // Função para verificar as credenciais
    function checkCredentials(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.email === email && user.password === password);
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
    document.getElementById('phone').addEventListener('input', (e) => formatPhoneNumber(e.target));

    // Manipula o envio do formulário
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Verificar se o usuário existe
        if (!checkUserExists(email)) {
            // Mostrar a mensagem de cadastro
            const messageElement = document.querySelector('.register-message');
            if (messageElement) {
                messageElement.style.display = 'block';
                messageElement.style.color = 'red';
                messageElement.style.margin = '10px 0';
                messageElement.style.padding = '10px';
                messageElement.style.backgroundColor = '#ffe6e6';
                messageElement.style.border = '1px solid #ff9999';
                messageElement.style.borderRadius = '5px';
            }
            return;
        }
        
        // Verificar as credenciais
        const user = checkCredentials(email, password);
        if (user) {
            // Salvar dados do usuário logado
            localStorage.setItem('userData', JSON.stringify({
                email: user.email,
                name: user.name
            }));
            
            // Redirecionar para a página de registro
            window.location.href = 'registro.html';
        } else {
            alert('Senha incorreta!');
        }
    });
}); 