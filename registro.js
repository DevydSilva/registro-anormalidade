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
        takePhotoButton.disabled = false;
        uploadButton.style.display = 'none';
        
        // Garantir que o vídeo está carregado antes de mostrar
        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
        // Restaurar estado inicial em caso de erro
        startCameraButton.style.display = 'block';
        takePhotoButton.style.display = 'none';
        uploadButton.style.display = 'block';
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
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

// Função para formatar a data
function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para enviar email
async function sendEmail(anomalyData, qrCodeImage) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            throw new Error('Dados do usuário não encontrados');
        }

        // Preparar o template do email com HTML
        const emailTemplate = `
            <h2>Registro de Anormalidade</h2>
            <p><strong>Data:</strong> ${formatarData(anomalyData.timestamp)}</p>
            <p><strong>Local:</strong> ${anomalyData.location}</p>
            <p><strong>Descrição:</strong> ${anomalyData.description}</p>
            <div style="margin: 20px 0;">
                <h3>Imagem da Anormalidade:</h3>
                ${anomalyData.image ? `<img src="${anomalyData.image}" style="max-width: 100%; height: auto; margin: 10px 0;">` : 'Nenhuma imagem anexada'}
            </div>
            <div style="margin: 20px 0;">
                <h3>QR Code do Registro:</h3>
                <img src="${qrCodeImage}" style="max-width: 200px; height: auto;">
            </div>
            <p style="margin-top: 20px; color: #666;">
                Registrado por: ${userData.name}<br>
                Telefone: ${userData.phone}
            </p>
        `;

        const emailParams = {
            to_email: userData.email,
            to_name: userData.name,
            from_name: "Sistema de Registro de Anormalidades",
            subject: `Registro de Anormalidade - ${formatarData(anomalyData.timestamp)}`,
            message: emailTemplate,
            anomaly_image: anomalyData.image,
            qr_code: qrCodeImage
        };

        const response = await emailjs.send(
            "YOUR_SERVICE_ID",
            "YOUR_TEMPLATE_ID",
            emailParams
        );

        if (response.status === 200) {
            alert('Registro enviado com sucesso para seu email!');
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
});

// Evento para download do QR Code
downloadQRButton.addEventListener('click', downloadQRCode);

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 