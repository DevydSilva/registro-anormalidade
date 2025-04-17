// Função para inicializar os formulários de recuperação
function initRecoveryForms() {
    const recoverPasswordBtn = document.getElementById('recoverPasswordBtn');
    const recoverEmailBtn = document.getElementById('recoverEmailBtn');
    const passwordRecoveryForm = document.getElementById('passwordRecoveryForm');
    const emailRecoveryForm = document.getElementById('emailRecoveryForm');

    // Mostrar formulário de recuperação de senha
    recoverPasswordBtn.addEventListener('click', () => {
        passwordRecoveryForm.style.display = 'block';
        emailRecoveryForm.style.display = 'none';
    });

    // Mostrar formulário de recuperação de e-mail
    recoverEmailBtn.addEventListener('click', () => {
        emailRecoveryForm.style.display = 'block';
        passwordRecoveryForm.style.display = 'none';
    });

    // Manipular recuperação de senha
    passwordRecoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('recoveryName').value;
        const email = document.getElementById('recoveryEmail').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => 
            user.name === name && user.email === email
        );

        if (userIndex === -1) {
            alert('Usuário não encontrado! Verifique o nome e e-mail informados.');
            return;
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Senha alterada com sucesso!');
        window.location.href = 'login.html';
    });

    // Manipular recuperação de e-mail
    emailRecoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('emailRecoveryName').value;
        const password = document.getElementById('emailRecoveryPassword').value;
        const newEmail = document.getElementById('newEmail').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => 
            user.name === name && user.password === password
        );

        if (userIndex === -1) {
            alert('Usuário não encontrado! Verifique o nome e senha informados.');
            return;
        }

        users[userIndex].email = newEmail;
        localStorage.setItem('users', JSON.stringify(users));
        alert('E-mail alterado com sucesso!');
        window.location.href = 'login.html';
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initRecoveryForms); 