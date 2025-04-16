// Verificar se o usuário está logado
window.addEventListener('load', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = 'login.html';
        return;
    }
});

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

// Função para comprimir imagem
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

// Função para criar uma imagem com os dados do formulário
function createInfoImage(data) {
    return new Promise((resolve, reject) => {
        try {
            // Criar um canvas para a imagem
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');

            // Fundo branco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Cabeçalho
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, 80);
            
            // Título
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Registro de Anormalidade', canvas.width / 2, 50);

            // Data e hora
            ctx.fillStyle = '#34495e';
            ctx.font = '16px Arial';
            ctx.textAlign = 'right';
            const dataFormatada = new Date(data.timestamp).toLocaleString('pt-BR');
            ctx.fillText(`Registrado em: ${dataFormatada}`, canvas.width - 20, 120);

            // ID do registro
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`ID: ${data.id}`, 20, 120);

            // Informações principais
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Local:', 20, 180);
            ctx.fillText('Descrição:', 20, 280);

            // Valores
            ctx.fillStyle = '#34495e';
            ctx.font = '16px Arial';
            
            // Local
            const localLines = wrapText(ctx, data.location, canvas.width - 40, 20);
            ctx.fillText(localLines, 20, 210);

            // Descrição
            const descLines = wrapText(ctx, data.description, canvas.width - 40, 20);
            ctx.fillText(descLines, 20, 310);

            // Se houver imagem, adicionar ao canvas
            if (data.image) {
                const img = new Image();
                img.onload = async () => {
                    try {
                        // Comprimir a imagem antes de adicionar ao canvas
                        const compressedImage = await compressImage(data.image);
                        const compressedImg = new Image();
                        compressedImg.onload = () => {
                            // Calcular dimensões mantendo a proporção
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

                            // Centralizar a imagem
                            const x = (canvas.width - width) / 2;
                            const y = 400;
                            ctx.drawImage(compressedImg, x, y, width, height);

                            // Converter para PNG e comprimir
                            const imageData = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(imageData);
                        };
                        compressedImg.src = compressedImage;
                    } catch (error) {
                        console.error('Erro ao comprimir imagem:', error);
                        // Se houver erro na compressão, continuar sem a imagem
                        const imageData = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(imageData);
                    }
                };
                img.onerror = () => {
                    // Se houver erro ao carregar a imagem, continuar sem ela
                    const imageData = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(imageData);
                };
                img.src = data.image;
            } else {
                // Se não houver imagem, converter direto para JPEG
                const imageData = canvas.toDataURL('image/jpeg', 0.7);
                resolve(imageData);
            }
        } catch (error) {
            console.error('Erro ao criar imagem:', error);
            reject(error);
        }
    });
}

// Função auxiliar para quebrar texto em múltiplas linhas
function wrapText(context, text, maxWidth, lineHeight) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines.join('\n');
}

// Função para salvar imagem localmente
function saveImageLocally(imageData) {
    return new Promise((resolve, reject) => {
        try {
            // Criar um link para download
            const link = document.createElement('a');
            link.download = 'comprovante-anomalia.png';
            link.href = imageData;
            link.click();
            resolve('Imagem salva localmente');
        } catch (error) {
            reject(error);
        }
    });
}

// Função para enviar email
async function sendEmail(anomalyData, infoImage) {
    try {
        console.log('Iniciando envio de email...');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            throw new Error('Dados do usuário não encontrados. Por favor, faça login novamente.');
        }

        console.log('Dados do usuário:', userData);

        // Salvar a imagem localmente
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

        // Verificar se o EmailJS está inicializado
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS não está inicializado corretamente. Por favor, recarregue a página.');
        }

        // Verificar se o serviço e template existem
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

        const anomalyData = {
            description,
            location,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
            image: imageData
        };

        console.log('Criando imagem com informações...');
        const infoImage = await createInfoImage(anomalyData);
        
        console.log('Enviando email...');
        await sendEmail(anomalyData, infoImage);

        // Limpar o formulário após envio bem-sucedido
        anomalyForm.reset();
        imagePreview.innerHTML = '';
        stopCamera();
        
    } catch (error) {
        console.error('Erro no processo de registro:', error);
        alert(error.message || 'Ocorreu um erro no processo de registro. Por favor, tente novamente.');
    }
});

// Evento para download do QR Code
downloadQRButton.addEventListener('click', downloadQRCode);

// Limpar recursos ao sair da página
window.addEventListener('beforeunload', stopCamera); 