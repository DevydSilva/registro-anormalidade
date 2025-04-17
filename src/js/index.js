/* ==========================================================================
   Initialization and Login Verification
   ========================================================================== */

// Global DOM Elements
const elements = {
    video: null,
    canvas: null,
    takePhotoButton: null,
    retakePhotoButton: null,
    startCameraButton: null,
    imagePreview: null,
    uploadButton: null,
    fileInput: null,
    logoutButton: null,
    anomalyForm: null,
    downloadQRButton: null,
    stream: null
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    elements.video = document.getElementById('video');
    elements.canvas = document.getElementById('canvas');
    elements.takePhotoButton = document.querySelector('.camera-button');
    elements.retakePhotoButton = document.querySelector('.camera-button:nth-child(2)');
    elements.startCameraButton = document.getElementById('startCamera');
    elements.imagePreview = document.getElementById('imagePreview');
    elements.uploadButton = document.getElementById('uploadButton');
    elements.fileInput = document.getElementById('image');
    elements.logoutButton = document.getElementById('logoutButton');
    elements.anomalyForm = document.getElementById('anormalidadeForm');
    elements.downloadQRButton = document.getElementById('downloadQR');

    // Setup event listeners
    if (elements.logoutButton) {
        elements.logoutButton.addEventListener('click', logout);
    }

    if (elements.startCameraButton) {
        elements.startCameraButton.addEventListener('click', startCamera);
    }

    if (elements.takePhotoButton) {
        elements.takePhotoButton.addEventListener('click', takePhoto);
    }

    if (elements.retakePhotoButton) {
        elements.retakePhotoButton.addEventListener('click', retakePhoto);
    }

    if (elements.downloadQRButton) {
        elements.downloadQRButton.addEventListener('click', downloadQRCode);
    }

    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileUpload);
    }

    if (elements.anomalyForm) {
        elements.anomalyForm.addEventListener('submit', handleFormSubmit);
    }

    // Add cleanup event
    window.addEventListener('beforeunload', stopCamera);

    // Check login and initialize camera
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        window.location.href = 'login.html';
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        checkCameraPermission();
    } else {
        console.error('Browser does not support camera access');
        showCameraError('Your browser does not support camera access. Please use a modern browser.');
    }
});

/**
 * Inicializa todos os elementos do DOM
 */
window.addEventListener('load', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializa câmera se suportado pelo navegador
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        verificarPermissaoCamera();
    } else {
        console.error('Navegador não suporta acesso à câmera');
        mostrarErroCamera('Seu navegador não suporta acesso à câmera. Por favor, use um navegador mais recente.');
    }
});

/* ==========================================================================
   Elementos do DOM
   ========================================================================== */

/**
 * Manipula o upload de arquivo
 */
const anomalyForm = document.getElementById('anormalidadeForm');
const imagePreview = document.getElementById('imagePreview');
const downloadQRButton = document.getElementById('downloadQR');
const startCameraButton = document.getElementById('startCamera');
const takePhotoButton = document.querySelector('.camera-button');
const retakePhotoButton = document.querySelector('.camera-button:nth-child(2)');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('image');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const logoutButton = document.getElementById('logoutButton');

/* ==========================================================================
   Funções de Autenticação
   ========================================================================== */

/**
 * Solicita permissão da câmera
 */
async function requestCamera() {
    try {
        await startCamera();
    } catch (error) {
        mostrarErroCamera('Não foi possível acessar a câmera. Por favor, verifique as permissões do seu navegador.');
    }
}

/**
 * Tenta iniciar a câmera novamente
 */
async function retryCamera() {
    try {
        await startCamera();
    } catch (error) {
        mostrarErroCamera('Não foi possível acessar a câmera. Por favor, verifique as permissões do seu navegador.');
    }
}

/**
 * Inicia a câmera
 */
async function startCamera() {
    try {
        elements.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        elements.video.srcObject = elements.stream;
        elements.video.style.display = 'block';
        startCameraButton.style.display = 'none';
        takePhotoButton.style.display = 'block';
        takePhotoButton.disabled = false;
        uploadButton.style.display = 'none';
        
        if (canvas) canvas.style.display = 'none';
        if (botaoTirarFoto) {
            botaoTirarFoto.style.display = 'block';
            botaoTirarFoto.disabled = false;
        }
        if (botaoRepetirFoto) {
            botaoRepetirFoto.style.display = 'none';
        }

        await elements.video.play();

    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        try {
            elements.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            
            elements.video.srcObject = elements.stream;
            elements.video.style.display = 'block';
            await elements.video.play();
            
        } catch (fallbackError) {
            console.error('Erro ao tentar câmera frontal:', fallbackError);
            mostrarErroCamera('Não foi possível acessar nenhuma câmera. Verifique as permissões do navegador.');
        }
    }
}

/**
 * Para a câmera
 */
function pararCamera() {
    if (elements.stream) {
        elements.stream.getTracks().forEach(track => track.stop());
        if (video) {
            video.srcObject = null;
            video.style.display = 'none';
        }
        elements.stream = null;
    }
}

/**
 * Tira foto
 */
function tirarFoto() {
    if (!video || !canvas) return;
    
    try {
        canvas.style.display = 'block';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        if (previewImagem) {
            previewImagem.innerHTML = `<img src="${photoData}" alt="Foto capturada">`;
        }
        
        pararCamera();
        
        if (botaoTirarFoto) botaoTirarFoto.style.display = 'none';
        if (botaoRepetirFoto) botaoRepetirFoto.style.display = 'block';
        canvas.style.display = 'none';
    } catch (error) {
        console.error('Erro ao tirar foto:', error);
        alert('Erro ao capturar a foto. Por favor, tente novamente.');
    }
}

/**
 * Reinicia o processo de foto
 */
function repetirFoto() {
    if (previewImagem) {
        previewImagem.innerHTML = '';
    }
    if (botaoRepetirFoto) {
        botaoRepetirFoto.style.display = 'none';
    }
    startCamera();
}

// Expõe funções necessárias globalmente
window.requestCamera = requestCamera;
window.retryCamera = retryCamera;
window.tirarFoto = tirarFoto;
window.repetirFoto = repetirFoto;

/* ==========================================================================
   Funções do QR Code
   ========================================================================== */

/**
 * Gera um QR Code com os dados da anomalia
 * @param {Object} data - Dados da anomalia
 * @returns {Promise<string>} Promessa com a URL da imagem do QR Code
 */
function gerarQRCode(data) {
    return new Promise((resolve, reject) => {
        try {
            const qrcodeElement = document.getElementById('qrcode');
            if (!qrcodeElement) {
                throw new Error('Elemento QR Code não encontrado no DOM');
            }

            qrcodeElement.innerHTML = '';
            const qrText = `ID: ${data.id}\nLocal: ${data.location}\nData: ${new Date(data.timestamp).toLocaleString('pt-BR')}`;
            console.log('Texto para QR Code:', qrText);

            QRCode.toCanvas(qrcodeElement, qrText, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, (error, canvas) => {
                if (error) {
                    console.error('Erro ao gerar QR Code:', error);
                    reject(error);
                } else {
                    console.log('QR Code gerado com sucesso');
                    const qrCodeImage = canvas.toDataURL('image/png');
                    resolve(qrCodeImage);
                }
            });
        } catch (error) {
            console.error('Erro na geração do QR Code:', error);
            reject(error);
        }
    });
}

/**
 * Baixa o QR Code gerado
 */
function baixarQRCode() {
    try {
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

/* ==========================================================================
   Funções de Utilitários
   ========================================================================== */

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} Data formatada
 */
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

/**
 * Comprime uma imagem
 * @param {string} imageData - Dados da imagem em base64
 * @param {number} maxWidth - Largura máxima da imagem
 * @param {number} maxHeight - Altura máxima da imagem
 * @param {number} quality - Qualidade da compressão (0-1)
 * @returns {Promise<string>} Promessa com os dados da imagem comprimida
 */
function compressImage(imageData, maxWidth = 800, maxHeight = 600, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth * height) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (maxHeight * width) / height;
                height = maxHeight;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedData = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedData);
        };
        img.src = imageData;
    });
}

/* ==========================================================================
   Funções de Processamento de Imagem
   ========================================================================== */

/**
 * Cria uma imagem com os dados do formulário
 * @param {Object} data - Dados do formulário
 * @returns {Promise<string>} Promessa com os dados da imagem gerada
 */
function criarImagemInfo(data) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, 80);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Registro de Anormalidade', canvas.width / 2, 50);

            ctx.fillStyle = '#34495e';
            ctx.font = '16px Arial';
            ctx.textAlign = 'right';
            const dataFormatada = new Date(data.timestamp).toLocaleString('pt-BR');
            ctx.fillText(`Registrado em: ${dataFormatada}`, canvas.width - 20, 120);

            ctx.fillStyle = '#7f8c8d';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`ID: ${data.id}`, 20, 120);

            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Local:', 20, 180);
            ctx.fillText('Descrição:', 20, 280);

            ctx.fillStyle = '#34495e';
            ctx.font = '16px Arial';
            
            const localLines = wrapText(ctx, data.location, canvas.width - 40, 20);
            ctx.fillText(localLines, 20, 210);

            const descLines = wrapText(ctx, data.description, canvas.width - 40, 20);
            ctx.fillText(descLines, 20, 310);

            if (data.image) {
                const img = new Image();
                img.onload = async () => {
                    try {
                        const compressedImage = await compressImage(data.image);
                        const compressedImg = new Image();
                        compressedImg.onload = () => {
                            const maxWidth = canvas.width - 40;
                            const maxHeight = 200;
                            let width = compressedImg.width;
                            let height = compressedImg.height;

                            if (width > maxWidth) {
                                height = (maxWidth * height) / width;
                                width = maxWidth;
                            }

                            if (height > maxHeight) {
                                width = (maxHeight * width) / height;
                                height = maxHeight;
                            }

                            const x = (canvas.width - width) / 2;
                            const y = 400;
                            ctx.drawImage(compressedImg, x, y, width, height);

                            const imageData = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(imageData);
                        };
                        compressedImg.src = compressedImage;
                    } catch (error) {
                        console.error('Erro ao comprimir imagem:', error);
                        const imageData = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(imageData);
                    }
                };
                img.onerror = () => {
                    const imageData = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(imageData);
                };
                img.src = data.image;
            } else {
                const imageData = canvas.toDataURL('image/jpeg', 0.7);
                resolve(imageData);
            }
        } catch (error) {
            console.error('Erro ao criar imagem:', error);
            reject(error);
        }
    });
}

/**
 * Quebra o texto em linhas para caber no canvas
 * @param {CanvasRenderingContext2D} context - Contexto do canvas
 * @param {string} text - Texto a ser quebrado
 * @param {number} maxWidth - Largura máxima da linha
 * @param {number} lineHeight - Altura da linha
 * @returns {Array<string>} Array com as linhas do texto
 */
function wrapText(context, text, maxWidth, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const width = context.measureText(currentLine + ' ' + words[i]).width;
        if (width < maxWidth) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

/* ==========================================================================
   Funções de Armazenamento e Envio
   ========================================================================== */

/**
 * Salva a imagem localmente
 * @param {string} imageData - Dados da imagem em base64
 */
function salvarImagemLocalmente(imageData) {
    try {
        const link = document.createElement('a');
        link.download = 'anomalia-info.png';
        link.href = imageData;
        link.click();
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        alert('Erro ao salvar a imagem. Por favor, tente novamente.');
    }
}

/**
 * Envia um email com os dados da anomalia
 * @param {Object} anomalyData - Dados da anomalia
 * @param {string} infoImage - Dados da imagem em base64
 * @returns {Promise<void>}
 */
async function enviarEmail(anomalyData, infoImage) {
    try {
        console.log('Iniciando envio de email...');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            throw new Error('Dados do usuário não encontrados. Por favor, faça login novamente.');
        }

        console.log('Dados do usuário:', userData);

        await salvarImagemLocalmente(infoImage);

        const emailParams = {
            to_email: userData.email,
            to_name: userData.name,
            from_name: "Sistema de Registro de Anormalidades",
            subject: `Registro de Anormalidade - ${formatarData(anomalyData.timestamp)}`,
            message: `
                <h2>Registro de Anormalidade</h2>
                <p><strong>Data:</strong> ${formatarData(anomalyData.timestamp)}</p>
                <p><strong>Local:</strong> ${anomalyData.location}</p>
                <p><strong>Descrição:</strong> ${anomalyData.description}</p>
                <p><strong>Registrado por:</strong> ${userData.name}</p>
                <p><strong>Telefone:</strong> ${userData.phone}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p>O comprovante do registro foi salvo localmente no seu dispositivo.</p>
            `
        };

        console.log('Enviando email com os seguintes parâmetros:', {
            to_email: userData.email,
            subject: emailParams.subject
        });

        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS não está inicializado corretamente. Por favor, recarregue a página.');
        }

        if (!emailjs.send) {
            throw new Error('Função de envio do EmailJS não está disponível. Verifique a configuração.');
        }

        try {
            const response = await emailjs.send(
                "service_2g8768o",
                "template_gvn13j7",
                emailParams
            );

            console.log('Resposta do EmailJS:', response);

            if (response && response.status === 200) {
                alert('Registro enviado com sucesso para seu email! O comprovante foi salvo localmente.');
                return true;
            } else {
                throw new Error(`Falha no envio do email. Status: ${response ? response.status : 'desconhecido'}`);
            }
        } catch (emailError) {
            console.error('Erro específico do EmailJS:', emailError);
            throw new Error(`Erro ao enviar email: ${emailError.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
        }
    } catch (error) {
        console.error('Erro detalhado ao enviar email:', error);
        throw new Error(`Erro ao enviar email: ${error.message || 'Erro desconhecido'}. Por favor, verifique sua conexão e tente novamente.`);
    }
}

/* ==========================================================================
   Funções de Logout
   ========================================================================== */

/**
 * Realiza o logout do usuário
 */
function fazerLogout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */

/**
 * Manipula o upload de arquivo
 */
function handleFileUpload(e) {
    try {
        const file = e.target.files[0];
        if (file && previewImagem) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImagem.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                pararCamera();
                if (video) video.style.display = 'none';
                if (botaoTirarFoto) botaoTirarFoto.style.display = 'none';
                if (botaoRepetirFoto) botaoRepetirFoto.style.display = 'none';
                if (botaoIniciarCamera) botaoIniciarCamera.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
    }
} 