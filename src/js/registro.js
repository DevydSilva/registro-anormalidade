// Verificação de login
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
});

// Elementos do DOM
const cameraContainer = document.getElementById('cameraContainer');
const camera = document.getElementById('camera');
const photoPreview = document.getElementById('photoPreview');
const captureButton = document.getElementById('captureButton');
const retakeButton = document.getElementById('retakeButton');
const anormalidadeForm = document.getElementById('anormalidadeForm');
const carouselInner = document.querySelector('.carousel-inner');

// Estado da câmera
let stream = null;
let photoData = null;

// Inicialização da câmera
async function initializeCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera.srcObject = stream;
        camera.style.display = 'block';
        photoPreview.style.display = 'none';
        captureButton.style.display = 'block';
        retakeButton.style.display = 'none';
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
    }
}

// Captura da foto
function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    canvas.getContext('2d').drawImage(camera, 0, 0);
    photoData = canvas.toDataURL('image/jpeg');
    
    photoPreview.src = photoData;
    camera.style.display = 'none';
    photoPreview.style.display = 'block';
    captureButton.style.display = 'none';
    retakeButton.style.display = 'block';
}

// Retomar foto
function retakePhoto() {
    photoPreview.style.display = 'none';
    camera.style.display = 'block';
    captureButton.style.display = 'block';
    retakeButton.style.display = 'none';
    photoData = null;
}

// Carregar itens do carrossel
function loadCarouselItems() {
    const items = JSON.parse(localStorage.getItem('anormalidades') || '[]');
    carouselInner.innerHTML = '';
    
    if (items.length === 0) {
        carouselInner.innerHTML = `
            <div class="carousel-item">
                <h3>Nenhum item disponível</h3>
                <p>Registre um novo item para que ele apareça aqui</p>
            </div>
        `;
        return;
    }
    
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'carousel-item';
        itemElement.innerHTML = `
            <img src="${item.photo}" alt="Foto da anormalidade">
            <h3>${item.data} - ${item.hora}</h3>
            <p>${item.local}</p>
            <p>${item.descricao}</p>
            <div class="item-actions">
                <button onclick="editItem(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        carouselInner.appendChild(itemElement);
    });
}

// Editar item
function editItem(index) {
    const items = JSON.parse(localStorage.getItem('anormalidades') || '[]');
    const item = items[index];
    
    document.getElementById('data').value = item.data;
    document.getElementById('hora').value = item.hora;
    document.getElementById('local').value = item.local;
    document.getElementById('descricao').value = item.descricao;
    photoData = item.photo;
    
    photoPreview.src = photoData;
    camera.style.display = 'none';
    photoPreview.style.display = 'block';
    captureButton.style.display = 'none';
    retakeButton.style.display = 'block';
    
    items.splice(index, 1);
    localStorage.setItem('anormalidades', JSON.stringify(items));
    loadCarouselItems();
}

// Deletar item
function deleteItem(index) {
    const items = JSON.parse(localStorage.getItem('anormalidades') || '[]');
    items.splice(index, 1);
    localStorage.setItem('anormalidades', JSON.stringify(items));
    loadCarouselItems();
}

// Envio do formulário
anormalidadeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!photoData) {
        alert('Por favor, capture uma foto da anormalidade.');
        return;
    }
    
    const formData = {
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        local: document.getElementById('local').value,
        descricao: document.getElementById('descricao').value,
        photo: photoData
    };
    
    const items = JSON.parse(localStorage.getItem('anormalidades') || '[]');
    items.push(formData);
    localStorage.setItem('anormalidades', JSON.stringify(items));
    
    alert('Anormalidade registrada com sucesso!');
    anormalidadeForm.reset();
    retakePhoto();
    loadCarouselItems();
});

// Event Listeners
captureButton.addEventListener('click', capturePhoto);
retakeButton.addEventListener('click', retakePhoto);

// Inicialização
initializeCamera();
loadCarouselItems(); 