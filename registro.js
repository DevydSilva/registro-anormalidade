// Elementos do DOM
const anomalyForm = document.getElementById('anomalyForm');
const imagePreview = document.getElementById('imagePreview');
const downloadQRButton = document.getElementById('downloadQR');
const startCameraButton = document.getElementById('startCamera');
const takePhotoButton = document.getElementById('takePhoto');
const retakePhotoButton = document.getElementById('retakePhoto');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('image');
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
let qrcode = null;
let stream = null;

// Função para iniciar a câmera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
        video.style.display = 'block';
        startCameraButton.style.display = 'none';
        takePhotoButton.style.display = 'block';
        uploadButton.style.display = 'none';
        
        // Garantir que o vídeo está carregado antes de mostrar
        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
    }
}

// Função para parar a câmera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        stream = null;
        video.style.display = 'none';
    }
}

// Função para tirar foto
function takePhoto() {
    const context = canvas.getContext('2d');
    // Ajustar o tamanho do canvas para corresponder ao vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Converter para imagem
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    imagePreview.innerHTML = `<img src="${photoData}" alt="Foto capturada">`;
    
    // Parar a câmera e atualizar botões
    stopCamera();
    takePhotoButton.style.display = 'none';
    retakePhotoButton.style.display = 'block';
    startCameraButton.style.display = 'block';
    uploadButton.style.display = 'block';
}

// Função para tirar nova foto
function retakePhoto() {
    imagePreview.innerHTML = '';
    retakePhotoButton.style.display = 'none';
    startCamera();
}

// Função para gerar o QR Code
function generateQRCode(data) {
    document.getElementById('qrcode').innerHTML = '';
    qrcode = new QRCode(document.getElementById('qrcode'), {
        text: JSON.stringify(data),
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Função para baixar o QR Code
function downloadQRCode() {
    if (!qrcode) return;
    
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'qrcode-anomalia.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}

// Função para enviar email
async function sendEmail(anomalyData, qrCodeImage) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        const emailParams = {
            to_email: userData.email,
            to_name: userData.name,
            description: anomalyData.description,
            location: anomalyData.location,
            date: new Date(anomalyData.timestamp).toLocaleString(),
            qr_code: qrCodeImage
        };

        const response = await emailjs.send(
            "YOUR_SERVICE_ID",
            "YOUR_TEMPLATE_ID",
            emailParams
        );

        if (response.status === 200) {
            alert('Email enviado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        alert('Erro ao enviar email. Por favor, tente novamente.');
    }
}

// Event Listeners
startCameraButton.addEventListener('click', startCamera);
takePhotoButton.addEventListener('click', takePhoto);
retakePhotoButton.addEventListener('click', retakePhoto);
uploadButton.addEventListener('click', () => fileInput.click());

// Preview da imagem quando fizer upload
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            stopCamera();
            video.style.display = 'none';
            takePhotoButton.style.display = 'none';
            retakePhotoButton.style.display = 'none';
            startCameraButton.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Manipula o envio do formulário
anomalyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    let imageData = null;

    // Pegar a imagem (seja da câmera ou do upload)
    const previewImage = imagePreview.querySelector('img');
    if (previewImage) {
        imageData = previewImage.src;
    }

    const anomalyData = {
        description,
        location,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9),
        image: imageData
    };

    generateQRCode(anomalyData);

    // Espera um momento para o QR Code ser gerado
    setTimeout(async () => {
        const qrCodeCanvas = document.querySelector('#qrcode canvas');
        if (qrCodeCanvas) {
            const qrCodeImage = qrCodeCanvas.toDataURL('image/png');
            await sendEmail(anomalyData, qrCodeImage);
        }
    }, 500);

    alert('Anormalidade registrada com sucesso!');
});

// Evento para download do QR Code
downloadQRButton.addEventListener('click', downloadQRCode);

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 