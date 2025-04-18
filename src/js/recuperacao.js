document.addEventListener('DOMContentLoaded', () => {
    const recoverPasswordBtn = document.getElementById('recoverPasswordBtn');
    const recoverEmailBtn = document.getElementById('recoverEmailBtn');
    const passwordRecoveryForm = document.getElementById('passwordRecoveryForm');
    const emailRecoveryForm = document.getElementById('emailRecoveryForm');
    const recoveryOptions = document.querySelector('.recovery-options');

    // Função para mostrar mensagens de erro/sucesso
    function showMessage(message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isError ? 'error' : 'success'}`;
        messageDiv.textContent = message;
        
        // Remove mensagem anterior se existir
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        document.querySelector('.form-container').insertBefore(messageDiv, recoveryOptions);
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Mostrar formulário de recuperação de senha
    recoverPasswordBtn.addEventListener('click', () => {
        passwordRecoveryForm.style.display = 'block';
        emailRecoveryForm.style.display = 'none';
        recoverPasswordBtn.classList.add('active');
        recoverEmailBtn.classList.remove('active');
    });

    // Mostrar formulário de recuperação de e-mail
    recoverEmailBtn.addEventListener('click', () => {
        emailRecoveryForm.style.display = 'block';
        passwordRecoveryForm.style.display = 'none';
        recoverEmailBtn.classList.add('active');
        recoverPasswordBtn.classList.remove('active');
    });

    // Função para validar senha
    function validatePassword(password) {
        const minLength = 6;
        const hasNumber = /\d/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);
        
        if (password.length < minLength) {
            return 'A senha deve ter pelo menos 6 caracteres';
        }
        if (!hasNumber) {
            return 'A senha deve conter pelo menos um número';
        }
        if (!hasLetter) {
            return 'A senha deve conter pelo menos uma letra';
        }
        return null;
    }

    // Manipular recuperação de senha
    passwordRecoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('recoveryName').value.trim();
        const email = document.getElementById('recoveryEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (!name || !email || !newPassword || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos', true);
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('As senhas não coincidem!', true);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            showMessage(passwordError, true);
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => 
            user.name.toLowerCase() === name.toLowerCase() && 
            user.email.toLowerCase() === email.toLowerCase()
        );

        if (userIndex === -1) {
            showMessage('Usuário não encontrado! Verifique o nome e e-mail informados.', true);
            return;
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        showMessage('Senha alterada com sucesso!');
        
        // Limpa o formulário
        passwordRecoveryForm.reset();
        
        // Redireciona após 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });

    // Manipular recuperação de e-mail
    emailRecoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('emailRecoveryName').value.trim();
        const password = document.getElementById('emailRecoveryPassword').value;
        const newEmail = document.getElementById('newEmail').value.trim();

        if (!name || !password || !newEmail) {
            showMessage('Por favor, preencha todos os campos', true);
            return;
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showMessage('Por favor, insira um e-mail válido', true);
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => 
            user.name.toLowerCase() === name.toLowerCase() && 
            user.password === password
        );

        if (userIndex === -1) {
            showMessage('Usuário não encontrado! Verifique o nome e senha informados.', true);
            return;
        }

        // Verifica se o novo email já está em uso
        const emailExists = users.some(user => 
            user.email.toLowerCase() === newEmail.toLowerCase() && 
            user.name.toLowerCase() !== name.toLowerCase()
        );

        if (emailExists) {
            showMessage('Este e-mail já está em uso por outro usuário', true);
            return;
        }

        users[userIndex].email = newEmail;
        localStorage.setItem('users', JSON.stringify(users));
        showMessage('E-mail alterado com sucesso!');
        
        // Limpa o formulário
        emailRecoveryForm.reset();
        
        // Redireciona após 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}); 