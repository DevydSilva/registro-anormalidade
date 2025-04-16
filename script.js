// Get DOM elements
const loginScreen = document.getElementById('loginScreen');
const userRegisterScreen = document.getElementById('userRegisterScreen');
const anomalyScreen = document.getElementById('anomalyScreen');

const loginForm = document.getElementById('loginForm');
const userRegisterForm = document.getElementById('userRegisterForm');
const anomalyForm = document.getElementById('anomalyForm');
const imagePreview = document.getElementById('imagePreview');

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Store user data
    localStorage.setItem('userData', JSON.stringify({ name, email, phone }));

    // Show anomaly screen
    loginScreen.classList.add('hidden');
    anomalyScreen.classList.remove('hidden');
});

// Handle user registration form submission
userRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;

    // Store user data
    localStorage.setItem('userData', JSON.stringify({ name, email, phone }));

    // Show anomaly screen
    userRegisterScreen.classList.add('hidden');
    anomalyScreen.classList.remove('hidden');
});

// Handle anomaly form submission
anomalyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const imageFile = document.getElementById('image').files[0];

    // Create form data
    const formData = new FormData();
    formData.append('description', description);
    formData.append('location', location);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    alert('Anormalidade registrada com sucesso!');
    anomalyForm.reset();
    imagePreview.innerHTML = '';
});

// Handle image preview
document.getElementById('image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
    }
});

// Phone number formatting
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

// Add phone formatting to all phone inputs
document.getElementById('phone').addEventListener('input', (e) => formatPhoneNumber(e.target));
document.getElementById('regPhone').addEventListener('input', (e) => formatPhoneNumber(e.target)); 