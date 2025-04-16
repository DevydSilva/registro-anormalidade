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
        
        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
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

// Função para gerar o QR Code e retornar a promessa com a URL da imagem
function generateQRCode(data) {
    return new Promise((resolve) => {
        document.getElementById('qrcode').innerHTML = '';
        qrcode = new QRCode(document.getElementById('qrcode'), {
            text: JSON.stringify(data),
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Esperar um momento para garantir que o QR Code foi gerado
        setTimeout(() => {
            const qrCodeCanvas = document.querySelector('#qrcode canvas');
            if (qrCodeCanvas) {
                const qrCodeImage = qrCodeCanvas.toDataURL('image/png');
                resolve(qrCodeImage);
            } else {
                resolve(null);
            }
        }, 100);
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
            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Registro de Anormalidade</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 10px 0;"><strong>Data:</strong> ${formatarData(anomalyData.timestamp)}</p>
                <p style="margin: 10px 0;"><strong>Local:</strong> ${anomalyData.location}</p>
                <p style="margin: 10px 0;"><strong>Descrição:</strong> ${anomalyData.description}</p>
            </div>
            ${anomalyData.image ? `
            <div style="margin: 20px 0;">
                <h3 style="color: #444; font-size: 18px;">Imagem da Anormalidade:</h3>
                <img src="${anomalyData.image}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            </div>
            ` : ''}
            <div style="margin: 20px 0; text-align: center;">
                <h3 style="color: #444; font-size: 18px;">QR Code do Registro:</h3>
                <img src="${qrCodeImage}" style="width: 200px; height: 200px; margin: 10px auto; display: block;">
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
                <p style="margin: 5px 0;">Registrado por: ${userData.name}</p>
                <p style="margin: 5px 0;">Telefone: ${userData.phone}</p>
                <p style="margin: 5px 0;">Email: ${userData.email}</p>
            </div>
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
            "service_2g8768o", // Service ID
            "template_gvn13j7", // Template ID atualizado
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
    
    try {
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

        // Gerar QR Code e esperar pela URL da imagem
        const qrCodeImage = await generateQRCode(anomalyData);
        if (!qrCodeImage) {
            throw new Error('Erro ao gerar QR Code');
        }

        // Enviar email com o QR Code
        await sendEmail(anomalyData, qrCodeImage);

    } catch (error) {
        console.error('Erro no processo:', error);
        alert('Ocorreu um erro ao processar o registro. Por favor, tente novamente.');
    }
});

// Evento para download do QR Code
downloadQRButton.addEventListener('click', downloadQRCode);

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 