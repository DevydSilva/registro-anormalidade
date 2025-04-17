/* ==========================================================================
   Inicialização e Verificação de Login
   ========================================================================== */

/**
 * Verifica se o usuário está logado ao carregar a página
 * Redireciona para a página de login se não estiver autenticado
 */
window.addEventListener('load', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verifica se o navegador suporta a API de mídia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Inicializa a câmera automaticamente
        checkCameraPermission();
    } else {
        console.error('Navegador não suporta acesso à câmera');
        showCameraError('Seu navegador não suporta acesso à câmera. Por favor, use um navegador mais recente.');
    }
});

/* ==========================================================================
   Elementos do DOM
   ========================================================================== */

/**
 * Elementos do formulário e da interface
 * Referências aos elementos HTML necessários para o funcionamento da página
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
let stream = null;

/* ==========================================================================
   Funções de Autenticação
   ========================================================================== */

/**
 * Verifica se o usuário está logado
 * @returns {boolean} Retorna true se o usuário estiver logado, false caso contrário
 */
function checkLogin() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/* ==========================================================================
   Funções da Câmera
   ========================================================================== */

/**
 * Verifica a permissão da câmera e tenta inicializá-la
 */
async function checkCameraPermission() {
    try {
        // Primeiro, verifica se já temos permissão
        const permission = await navigator.permissions.query({ name: 'camera' });
        
        if (permission.state === 'granted') {
            startCamera();
        } else if (permission.state === 'prompt') {
            // Se precisar pedir permissão, mostra uma mensagem ao usuário
            showCameraPrompt();
        } else {
            showCameraError('Permissão da câmera negada. Por favor, permita o acesso à câmera nas configurações do seu navegador.');
        }
    } catch (error) {
        // Se não puder verificar a permissão, tenta iniciar a câmera diretamente
        startCamera();
    }
}

/**
 * Mostra uma mensagem de erro da câmera
 * @param {string} message - Mensagem de erro para mostrar
 */
function showCameraError(message) {
    const cameraContainer = document.querySelector('.camera-container');
    if (cameraContainer) {
        cameraContainer.innerHTML = `
            <div class="camera-error">
                <p>${message}</p>
                <button onclick="retryCamera()" class="camera-button">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Mostra um prompt para o usuário permitir a câmera
 */
function showCameraPrompt() {
    const cameraContainer = document.querySelector('.camera-container');
    if (cameraContainer) {
        cameraContainer.innerHTML = `
            <div class="camera-prompt">
                <p>Para tirar fotos, precisamos do seu permissão para acessar a câmera.</p>
                <button onclick="startCamera()" class="camera-button">
                    <i class="fas fa-camera"></i> Permitir Câmera
                </button>
            </div>
        `;
    }
}

/**
 * Tenta iniciar a câmera novamente
 */
function retryCamera() {
    startCamera();
}

/**
 * Inicia a câmera do dispositivo
 * @async
 * @returns {Promise<void>}
 */
async function startCamera() {
    try {
        // Tenta primeiro a câmera traseira
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        canvas.style.display = 'none';
        
        // Atualiza os botões
        if (startCameraButton) startCameraButton.style.display = 'none';
        if (takePhotoButton) {
            takePhotoButton.style.display = 'block';
            takePhotoButton.disabled = false;
        }
        if (uploadButton) uploadButton.style.display = 'none';
        if (retakePhotoButton) retakePhotoButton.style.display = 'none';
        
        // Aguarda o carregamento do vídeo
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(resolve);
            };
        });
        
    } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        
        // Tenta a câmera frontal como fallback
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            video.srcObject = stream;
            video.style.display = 'block';
            video.play();
            
        } catch (frontErr) {
            console.error('Erro ao acessar câmera frontal:', frontErr);
            showCameraError('Não foi possível acessar a câmera. Por favor, verifique as permissões do seu navegador.');
        }
    }
}

/**
 * Para a câmera e limpa os recursos
 */
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        stream = null;
        video.style.display = 'none';
    }
}

/**
 * Captura uma foto usando a câmera
 */
function takePhoto() {
    try {
        if (!stream) {
            throw new Error('Câmera não está ativa');
        }

        canvas.style.display = 'block';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        imagePreview.innerHTML = `<img src="${photoData}" alt="Foto capturada">`;
        
        stopCamera();
        takePhotoButton.style.display = 'none';
        retakePhotoButton.style.display = 'block';
        startCameraButton.style.display = 'block';
        uploadButton.style.display = 'block';
        canvas.style.display = 'none';
    } catch (error) {
        console.error('Erro ao tirar foto:', error);
        alert('Erro ao capturar a foto. Por favor, tente novamente.');
    }
}

/**
 * Reinicia o processo de captura de foto
 */
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

/* ==========================================================================
   Funções do QR Code
   ========================================================================== */

/**
 * Gera um QR Code com os dados da anomalia
 * @param {Object} data - Dados da anomalia
 * @returns {Promise<string>} Promessa com a URL da imagem do QR Code
 */
function generateQRCode(data) {
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
function downloadQRCode() {
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
function createInfoImage(data) {
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
function saveImageLocally(imageData) {
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
async function sendEmail(anomalyData, infoImage) {
    try {
        console.log('Iniciando envio de email...');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            throw new Error('Dados do usuário não encontrados. Por favor, faça login novamente.');
        }

        console.log('Dados do usuário:', userData);

        await saveImageLocally(infoImage);

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
function logout() {
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */

// Adiciona os event listeners necessários
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

if (startCameraButton) {
    startCameraButton.addEventListener('click', startCamera);
}

if (takePhotoButton) {
    takePhotoButton.addEventListener('click', takePhoto);
}

if (retakePhotoButton) {
    retakePhotoButton.addEventListener('click', retakePhoto);
}

if (downloadQRButton) {
    downloadQRButton.addEventListener('click', downloadQRCode);
}

if (anomalyForm) {
    anomalyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!checkLogin()) return;

        try {
            const formData = new FormData(anomalyForm);
            const anomalyData = {
                id: Math.random().toString(36).substr(2, 9),
                location: formData.get('local'),
                description: formData.get('descricao'),
                timestamp: new Date().toISOString(),
                image: imagePreview.querySelector('img')?.src || null
            };

            const qrCodeImage = await generateQRCode(anomalyData);
            const infoImage = await createInfoImage(anomalyData);
            
            await sendEmail(anomalyData, infoImage);
            saveImageLocally(infoImage);
            
            alert('Anomalia registrada com sucesso!');
            anomalyForm.reset();
            imagePreview.innerHTML = '';
        } catch (error) {
            console.error('Erro ao registrar anomalia:', error);
            alert('Erro ao registrar a anomalia. Por favor, tente novamente.');
        }
    });
}

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

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 