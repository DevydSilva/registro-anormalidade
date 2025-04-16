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
        
        // Esperar o vídeo carregar antes de habilitar o botão de tirar foto
        video.onloadedmetadata = () => {
            video.play();
            takePhotoButton.disabled = false;
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
    try {
        if (!stream) {
            throw new Error('Câmera não está ativa');
        }

        // Garantir que o canvas esteja visível
        canvas.style.display = 'block';
        
        // Configurar o tamanho do canvas para corresponder ao vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Desenhar o frame atual do vídeo no canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Converter o canvas para uma imagem JPEG
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Exibir a imagem capturada
        imagePreview.innerHTML = `<img src="${photoData}" alt="Foto capturada">`;
        
        // Parar a câmera e atualizar a interface
        stopCamera();
        takePhotoButton.style.display = 'none';
        retakePhotoButton.style.display = 'block';
        startCameraButton.style.display = 'block';
        uploadButton.style.display = 'block';
        
        // Esconder o canvas após a captura
        canvas.style.display = 'none';
    } catch (error) {
        console.error('Erro ao tirar foto:', error);
        alert('Erro ao capturar a foto. Por favor, tente novamente.');
    }
}

// Função para tirar nova foto
function retakePhoto() {
    try {
        imagePreview.innerHTML = '';
        retakePhotoButton.style.display = 'none';
        startCamera();
    } catch (error) {
        console.error('Erro ao tentar nova foto:', error);
        alert('Erro ao reiniciar a câmera. Por favor, tente novamente.');
    }
}

// Função para gerar o QR Code e retornar a promessa com a URL da imagem
function generateQRCode(data) {
    return new Promise((resolve, reject) => {
        try {
            const qrcodeElement = document.getElementById('qrcode');
            if (!qrcodeElement) {
                throw new Error('Elemento QR Code não encontrado no DOM');
            }

            // Limpar o elemento QR Code
            qrcodeElement.innerHTML = '';

            // Criar um texto simples com os dados essenciais
            const qrText = `ID: ${data.id}\nLocal: ${data.location}\nData: ${new Date(data.timestamp).toLocaleString('pt-BR')}`;
            console.log('Texto para QR Code:', qrText);

            // Criar o QR Code
            const qr = new QRCode(qrcodeElement, {
                text: qrText,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Aguardar um momento para o QR Code ser gerado
            setTimeout(() => {
                try {
                    const canvas = qrcodeElement.querySelector('canvas');
                    if (canvas) {
                        const qrCodeImage = canvas.toDataURL('image/png');
                        console.log('QR Code gerado com sucesso');
                        resolve(qrCodeImage);
                    } else {
                        throw new Error('Canvas do QR Code não encontrado');
                    }
                } catch (err) {
                    console.error('Erro ao converter QR Code para imagem:', err);
                    reject(err);
                }
            }, 100);
        } catch (error) {
            console.error('Erro na geração do QR Code:', error);
            reject(error);
        }
    });
}

// Função para baixar o QR Code
function downloadQRCode() {
    try {
        if (!qrcode) {
            throw new Error('QR Code não foi gerado');
        }
        
        const canvas = document.querySelector('#qrcode canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'qrcode-anomalia.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            throw new Error('Canvas do QR Code não encontrado');
        }
    } catch (error) {
        console.error('Erro ao baixar QR Code:', error);
        alert('Erro ao baixar o QR Code. Por favor, tente novamente.');
    }
}

// Função para formatar a data
function formatarData(data) {
    try {
        return new Date(data).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return new Date().toLocaleString('pt-BR');
    }
}

// Função para enviar email
async function sendEmail(anomalyData, qrCodeImage) {
    try {
        console.log('Iniciando envio de email...');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            throw new Error('Dados do usuário não encontrados');
        }

        console.log('Dados do usuário:', userData);

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

        console.log('Template do email preparado');

        const emailParams = {
            to_email: userData.email,
            to_name: userData.name,
            from_name: "Sistema de Registro de Anormalidades",
            subject: `Registro de Anormalidade - ${formatarData(anomalyData.timestamp)}`,
            message: emailTemplate,
            anomaly_image: anomalyData.image,
            qr_code: qrCodeImage
        };

        console.log('Parâmetros do email:', emailParams);

        const response = await emailjs.send(
            "service_2g8768o",
            "template_gvn13j7",
            emailParams
        );

        console.log('Resposta do EmailJS:', response);

        if (response.status === 200) {
            alert('Registro enviado com sucesso para seu email!');
        } else {
            throw new Error(`Status da resposta: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro detalhado ao enviar email:', error);
        alert('Erro ao enviar email. Por favor, verifique o console para mais detalhes e tente novamente.');
    }
}

// Event Listeners
startCameraButton.addEventListener('click', startCamera);
takePhotoButton.addEventListener('click', takePhoto);
retakePhotoButton.addEventListener('click', retakePhoto);
uploadButton.addEventListener('click', () => fileInput.click());

// Preview da imagem quando fizer upload
fileInput.addEventListener('change', (e) => {
    try {
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
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
    }
});

// Manipula o envio do formulário
anomalyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        console.log('Iniciando processo de registro...');
        
        const description = document.getElementById('description').value;
        const location = document.getElementById('location').value;
        let imageData = null;

        // Validar campos obrigatórios
        if (!description || !location) {
            throw new Error('Por favor, preencha todos os campos obrigatórios');
        }

        // Pegar a imagem (seja da câmera ou do upload)
        const previewImage = imagePreview.querySelector('img');
        if (previewImage) {
            imageData = previewImage.src;
        }

        console.log('Dados coletados:', { description, location, hasImage: !!imageData });

        const anomalyData = {
            description,
            location,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
            image: imageData
        };

        console.log('Gerando QR Code...');
        let qrCodeImage;
        try {
            qrCodeImage = await generateQRCode(anomalyData);
            if (!qrCodeImage) {
                throw new Error('Falha ao gerar QR Code');
            }
        } catch (error) {
            console.error('Erro na geração do QR Code:', error);
            throw new Error('Não foi possível gerar o QR Code. Por favor, tente novamente.');
        }

        console.log('QR Code gerado com sucesso, enviando email...');
        await sendEmail(anomalyData, qrCodeImage);

    } catch (error) {
        console.error('Erro detalhado no processo de registro:', error);
        alert(error.message || 'Ocorreu um erro no processo de registro. Por favor, tente novamente.');
    }
});

// Evento para download do QR Code
downloadQRButton.addEventListener('click', downloadQRCode);

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 