/* ==========================================================================
   Initialization and Login Verification
   ========================================================================== */

// Elementos globais
let video = null;
let canvas = null;
let startCameraButton = null;
let takePhotoButton = null;
let retakePhotoButton = null;
let imagePreview = null;
let stream = null;

// Variável global para armazenar o item selecionado
let itemSelecionado = null;

// Função para mostrar erros da câmera
function showCameraError(message) {
    alert(message);
    if (startCameraButton) startCameraButton.style.display = 'block';
    if (takePhotoButton) takePhotoButton.style.display = 'none';
    if (retakePhotoButton) retakePhotoButton.style.display = 'none';
}

// Função para verificar suporte à câmera
function checkCameraSupport() {
    return new Promise((resolve, reject) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            reject(new Error('Seu navegador não suporta acesso à câmera'));
        return;
    }

        // Verifica se o navegador suporta a API de mídia
        if (!navigator.mediaDevices.enumerateDevices) {
            reject(new Error('Seu navegador não suporta listagem de dispositivos'));
            return;
        }

        // Lista os dispositivos disponíveis
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length === 0) {
                    reject(new Error('Nenhuma câmera encontrada'));
                    return;
                }
                console.log('Dispositivos de vídeo encontrados:', videoDevices);
                resolve(videoDevices);
            })
            .catch(error => {
                console.error('Erro ao listar dispositivos:', error);
                reject(error);
            });
    });
}

// Função para obter stream da câmera
async function getCameraStream(facingMode) {
    try {
        // Primeiro, tenta obter a lista de dispositivos
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Dispositivos de vídeo encontrados:', videoDevices);

        let constraints;
        
        if (facingMode === 'environment') {
            // Tenta encontrar a câmera traseira pelo deviceId
            const rearCamera = videoDevices.find(device => {
                const label = device.label.toLowerCase();
                return label.includes('back') || label.includes('traseira') || label.includes('rear');
            });

            if (rearCamera) {
                console.log('Câmera traseira encontrada:', rearCamera);
                constraints = {
                    video: {
                        deviceId: { exact: rearCamera.deviceId },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };
            } else {
                // Se não encontrar pelo label, tenta pelo facingMode
                constraints = {
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
                };
            }
        } else {
            constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
        }

        console.log('Tentando acessar câmera com constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Stream obtido com sucesso');
        return stream;
    } catch (error) {
        console.error(`Erro ao acessar câmera ${facingMode}:`, error);
        throw error;
    }
}

// Função para inicializar o vídeo
function initializeVideo(stream) {
    return new Promise((resolve, reject) => {
        if (!video) {
            video = document.getElementById('video');
        }

        // Remove qualquer stream existente
        if (video.srcObject) {
            try {
                video.pause();
                video.srcObject.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            } catch (error) {
                console.warn('Erro ao limpar stream anterior:', error);
            }
        }

        // Configura o novo stream
        try {
        video.srcObject = stream;
        video.style.display = 'block';
            video.autoplay = true;
            video.playsinline = true;
            video.muted = true; // Adiciona muted para evitar problemas de autoplay

            // Aguarda os metadados serem carregados
            video.onloadedmetadata = () => {
                console.log('Metadados do vídeo carregados');
                video.play()
                    .then(() => {
                        console.log('Vídeo iniciado com sucesso');
                        resolve();
                    })
                    .catch(error => {
                        console.error('Erro ao iniciar vídeo:', error);
                        reject(error);
                    });
            };

            // Timeout para evitar que o código fique preso
            setTimeout(() => {
                if (video.readyState < 2) {
                    reject(new Error('A câmera demorou muito para responder'));
                }
            }, 10000);

        } catch (error) {
            console.error('Erro ao configurar stream:', error);
            reject(error);
        }
    });
}

// Função para verificar se todos os campos obrigatórios estão preenchidos
function verificarCamposObrigatorios() {
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const local = document.getElementById('local').value;
    const descricao = document.getElementById('descricao').value;
    
    return data && hora && local && descricao;
}

// Função para mostrar mensagem de campos obrigatórios
function mostrarMensagemCamposObrigatorios() {
    alert('Por favor, preencha todos os campos obrigatórios (Data, Hora, Local e Descrição) antes de tirar a foto.');
}

// Função para iniciar a câmera
async function startCamera() {
    try {
        // Verifica se todos os campos obrigatórios estão preenchidos
        if (!verificarCamposObrigatorios()) {
            mostrarMensagemCamposObrigatorios();
            return;
        }

        // Verifica suporte à câmera
        await checkCameraSupport();

        // Inicializa elementos
        if (!video) video = document.getElementById('video');
        if (!startCameraButton) startCameraButton = document.getElementById('startCamera');
        if (!takePhotoButton) takePhotoButton = document.getElementById('takePhoto');
        if (!retakePhotoButton) retakePhotoButton = document.getElementById('retakePhoto');

        // Para qualquer stream existente
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // Desabilita o botão durante a inicialização
        if (startCameraButton) {
            startCameraButton.disabled = true;
            startCameraButton.textContent = 'Iniciando câmera...';
        }

        try {
            // Tenta acessar a câmera traseira primeiro
            console.log('Tentando acessar câmera traseira...');
            stream = await getCameraStream('environment');
            console.log('Stream obtido, inicializando vídeo...');
            await initializeVideo(stream);
            
            // Atualiza botões somente após o vídeo estar pronto
            if (startCameraButton) {
        startCameraButton.style.display = 'none';
                startCameraButton.disabled = false;
                startCameraButton.textContent = 'Abrir Câmera';
            }
            if (takePhotoButton) {
        takePhotoButton.style.display = 'block';
        takePhotoButton.disabled = false;
            }
            if (retakePhotoButton) retakePhotoButton.style.display = 'none';
            
        } catch (error) {
            console.error('Erro ao acessar câmera traseira:', error);
            
            try {
                // Tenta a câmera frontal
                console.log('Tentando acessar câmera frontal...');
                stream = await getCameraStream('user');
                console.log('Stream obtido, inicializando vídeo...');
                await initializeVideo(stream);
                
                // Atualiza botões somente após o vídeo estar pronto
                if (startCameraButton) {
                    startCameraButton.style.display = 'none';
                    startCameraButton.disabled = false;
                    startCameraButton.textContent = 'Abrir Câmera';
                }
                if (takePhotoButton) {
                    takePhotoButton.style.display = 'block';
            takePhotoButton.disabled = false;
                }
                if (retakePhotoButton) retakePhotoButton.style.display = 'none';
                
            } catch (frontError) {
                console.error('Erro ao tentar câmera frontal:', frontError);
                if (startCameraButton) {
                    startCameraButton.disabled = false;
                    startCameraButton.textContent = 'Abrir Câmera';
                }
                throw frontError;
            }
        }

    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        if (startCameraButton) {
            startCameraButton.disabled = false;
            startCameraButton.textContent = 'Abrir Câmera';
        }
        showCameraError('Não foi possível acessar a câmera. Por favor:\n1. Verifique se você permitiu o acesso à câmera\n2. Se já negou a permissão, clique no ícone de cadeado/câmera na barra de endereços\n3. Limpe as permissões do site e tente novamente');
        throw error;
    }
}

// Função para parar a câmera
function stopCamera() {
    try {
    if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        stream = null;
        }
        if (video) {
            video.srcObject = null;
        video.style.display = 'none';
    }
    } catch (error) {
        console.error('Erro ao parar câmera:', error);
    }
}

// Função para selecionar um item
function selecionarItem(itemElement) {
    // Remove a seleção anterior
    document.querySelectorAll('.item-card').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Adiciona a seleção ao novo item
    itemElement.classList.add('selected');
    itemSelecionado = itemElement;
    
    // Atualiza o botão da câmera
    const startCameraButton = document.getElementById('startCamera');
    if (startCameraButton) {
        startCameraButton.disabled = false;
        startCameraButton.textContent = 'Tirar Foto do Item';
    }
}

// Função para tirar foto
function takePhoto() {
    if (!video || !canvas) {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
    }
    
    if (!video || !canvas) return;
    
    try {
        // Captura a foto
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Redimensiona a imagem para um tamanho menor
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400; // Largura máxima
        tempCanvas.height = 300; // Altura máxima
        const tempContext = tempCanvas.getContext('2d');
        tempContext.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Converte para base64 com qualidade reduzida
        const photoData = tempCanvas.toDataURL('image/jpeg', 0.6);
        
        // Exibe a imagem no preview
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = imagePreview.querySelector('img');
        const deleteButton = imagePreview.querySelector('.btn-deletar-imagem');
        
        if (imagePreview && previewImg && deleteButton) {
            previewImg.src = photoData;
            previewImg.style.display = 'block';
            deleteButton.style.display = 'flex';
        }
        
        // Salva a foto no localStorage
        localStorage.setItem('lastPhoto', photoData);
        
        // Para a câmera
        stopCamera();
        
        // Atualiza os botões
        const takePhotoButton = document.getElementById('takePhoto');
        const retakePhotoButton = document.getElementById('retakePhoto');
        if (takePhotoButton) takePhotoButton.style.display = 'none';
        if (retakePhotoButton) retakePhotoButton.style.display = 'block';
        
        // Esconde o canvas
        canvas.style.display = 'none';
        
    } catch (error) {
        console.error('Erro ao tirar foto:', error);
        alert('Erro ao capturar a foto. Por favor, tente novamente.');
    }
}

// Função para refazer foto
function retakePhoto() {
    if (!imagePreview) {
        imagePreview = document.getElementById('imagePreview');
    }
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    
    if (!retakePhotoButton) {
        retakePhotoButton = document.getElementById('retakePhoto');
    }
    if (!startCameraButton) {
        startCameraButton = document.getElementById('startCamera');
    }
    
    if (retakePhotoButton) retakePhotoButton.style.display = 'none';
    if (startCameraButton) startCameraButton.style.display = 'block';
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa elementos
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    startCameraButton = document.getElementById('startCamera');
    takePhotoButton = document.getElementById('takePhoto');
    retakePhotoButton = document.getElementById('retakePhoto');
    imagePreview = document.getElementById('imagePreview');

    // Setup event listeners
    if (startCameraButton) {
        startCameraButton.addEventListener('click', function() {
            startCamera().catch(error => {
                console.error('Erro ao iniciar câmera:', error);
            });
        });
    }

    if (takePhotoButton) {
        takePhotoButton.addEventListener('click', takePhoto);
    }

    if (retakePhotoButton) {
        retakePhotoButton.addEventListener('click', retakePhoto);
    }

    // Add cleanup event
    window.addEventListener('beforeunload', stopCamera);

    // Verifica login
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.email) {
        window.location.href = 'login.html';
        return;
    }

    // Adiciona o event listener do formulário
    const form = document.getElementById('anormalidadeForm');
    if (form) {
        form.addEventListener('submit', processForm);
    }

    // Adiciona event listeners para os campos
    const campos = ['data', 'hora', 'local', 'descricao'];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('change', function() {
                const startCameraButton = document.getElementById('startCamera');
                if (startCameraButton) {
                    startCameraButton.disabled = !verificarCamposObrigatorios();
                }
            });
        }
    });

    // Inicializa o botão da câmera como desabilitado
    if (startCameraButton) {
        startCameraButton.disabled = true;
    }

    // Carregar histórico ao iniciar
    carregarHistorico();
    
    // Event listener para botões de enviar email
    document.querySelectorAll('.btn-enviar-email').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.closest('.btn-enviar-email').dataset.index;
            $('#emailModal').modal('show');
            
            document.getElementById('enviarEmailBtn').onclick = () => {
                enviarEmail(index);
            };
        });
    });
    
    // Event listener para fechar modal
    document.querySelectorAll('[data-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', () => {
            $('#emailModal').modal('hide');
        });
    });

    // Carrossel de Itens
    const itemList = document.querySelector('.item-list');
    const items = document.querySelectorAll('.item-card');
    const wrapper = document.createElement('div');
    wrapper.className = 'item-list-wrapper';
    
    // Envolve os itens em um wrapper
    items.forEach(item => wrapper.appendChild(item.cloneNode(true)));
    itemList.innerHTML = '';
    itemList.appendChild(wrapper);

    // Configuração do carrossel
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 30; // Largura do item + gap
    const totalItems = items.length;
    const visibleItems = Math.floor(itemList.offsetWidth / itemWidth);
    
    // Cria os dots de navegação
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-nav';
    for (let i = 0; i < Math.ceil(totalItems / visibleItems); i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    itemList.appendChild(dotsContainer);

    // Função para mover o carrossel
    function goToSlide(index) {
        currentIndex = index;
        const offset = -currentIndex * itemWidth * visibleItems;
        wrapper.style.transform = `translateX(${offset}px)`;
        
        // Atualiza os dots ativos
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Rotação automática
    let autoRotate = setInterval(() => {
        currentIndex = (currentIndex + 1) % Math.ceil(totalItems / visibleItems);
        goToSlide(currentIndex);
    }, 3000); // Muda a cada 3 segundos

    // Pausa a rotação quando o mouse está sobre o carrossel
    itemList.addEventListener('mouseenter', () => clearInterval(autoRotate));
    itemList.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => {
            currentIndex = (currentIndex + 1) % Math.ceil(totalItems / visibleItems);
            goToSlide(currentIndex);
        }, 3000);
    });

    // Botões de navegação
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-button prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + Math.ceil(totalItems / visibleItems)) % Math.ceil(totalItems / visibleItems);
        goToSlide(currentIndex);
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-button next';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % Math.ceil(totalItems / visibleItems);
        goToSlide(currentIndex);
    });

    itemList.appendChild(prevButton);
    itemList.appendChild(nextButton);

    // Inicialização do carrossel
    const carousel = document.getElementById('carouselExampleIndicators');
    if (carousel) {
        var myCarousel = new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true,
            keyboard: true
        });

        // Adiciona eventos para pausar o carrossel no hover
        carousel.addEventListener('mouseenter', () => {
            bootstrap.Carousel.getInstance(carousel).pause();
        });

        carousel.addEventListener('mouseleave', () => {
            bootstrap.Carousel.getInstance(carousel).cycle();
        });
    }

    // Adiciona event listeners para os itens
    document.querySelectorAll('.item-card').forEach(item => {
        item.addEventListener('click', function() {
            selecionarItem(this);
        });
    });

    // Função para limpar todos os itens disponíveis e o histórico
    function limparTodosOsRegistros() {
        // Limpa o localStorage
        localStorage.removeItem('itensAchados');
        localStorage.removeItem('registros');
        
        // Atualiza o carrossel para mostrar a mensagem padrão
        const carouselInner = document.querySelector('.carousel-inner');
        if (carouselInner) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <div class="item-list">
                        <div class="item-card">
                            <div class="item-info">
                                <h4>Nenhum item disponível</h4>
                                <p>Registre um novo item para que ele apareça aqui</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Limpa o histórico
        const historicoRegistros = document.getElementById('historicoRegistros');
        if (historicoRegistros) {
            historicoRegistros.innerHTML = '';
        }
    }

    // Adiciona o event listener para limpar os registros quando a página carregar
    limparTodosOsRegistros();
});

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
        if (file && imagePreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                stopCamera();
                if (video) video.style.display = 'none';
                if (takePhotoButton) takePhotoButton.style.display = 'none';
                if (retakePhotoButton) retakePhotoButton.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
    }
}

// Função para salvar registro no histórico
function salvarRegistroNoHistorico(anomalyData) {
    // Obtém o histórico atual do localStorage
    let historico = JSON.parse(localStorage.getItem('registros') || '[]');
    
    // Adiciona o novo registro
    historico.unshift(anomalyData);
    
    // Limita o histórico aos últimos 50 registros
    if (historico.length > 50) {
        historico = historico.slice(0, 50);
    }
    
    // Salva no localStorage
    localStorage.setItem('registros', JSON.stringify(historico));
    
    // Atualiza a exibição
    carregarHistorico();
}

// Função para carregar o histórico de registros
function carregarHistorico() {
    const carouselInner = document.querySelector('#historicoCarousel .carousel-inner');
    if (!carouselInner) return;

    const registros = JSON.parse(localStorage.getItem('registros') || '[]');
    
    if (registros.length === 0) {
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="historico-container">
                    <div class="registro-card">
                        <div class="registro-info">
                            <h5>Nenhum registro encontrado</h5>
                            <p>Registre uma nova anormalidade para que ela apareça aqui</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Cria um único slide com todos os registros lado a lado
    carouselInner.innerHTML = `
        <div class="carousel-item active">
            <div class="historico-container">
                ${registros.map(registro => `
                    <div class="registro-card">
                        <div class="registro-imagem-container">
                            <img src="${registro.image}" alt="Registro" class="registro-imagem">
                        </div>
                        <div class="registro-info">
                            <h5>${new Date(registro.timestamp).toLocaleDateString('pt-BR')}</h5>
                            <p><strong>Local:</strong> ${registro.location}</p>
                            <p><strong>Descrição:</strong> ${registro.description}</p>
                            <button class="btn-enviar-email" data-index="${registros.indexOf(registro)}">
                                <i class="fas fa-envelope"></i> Enviar por Email
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Adiciona event listeners para os botões de email
    document.querySelectorAll('.btn-enviar-email').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const registro = registros[index];
            if (registro) {
                abrirModalEmail(registro);
            }
        });
    });
}

// Função para abrir o modal de email
function abrirModalEmail(registro) {
    const modal = new bootstrap.Modal(document.getElementById('emailModal'));
    const enviarEmailBtn = document.getElementById('enviarEmailBtn');
    
    // Armazena o registro atual no botão
    enviarEmailBtn.dataset.registro = JSON.stringify(registro);
    
    // Limpa o formulário
    document.getElementById('emailForm').reset();
    
    // Abre o modal
    modal.show();
}

// Função para validar os dados do email
function validarDadosEmail(dados) {
    try {
        console.log('Validando dados do email...', dados);
        // Verifica se todos os campos obrigatórios estão presentes
        const camposObrigatorios = ['to_email', 'from_name', 'message'];
        for (const campo of camposObrigatorios) {
            if (!dados[campo]) {
                console.error(`Campo obrigatório ausente: ${campo}`);
                throw new Error(`Campo obrigatório ausente: ${campo}`);
            }
        }

        // Valida o formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.to_email)) {
            console.error('Formato de email inválido');
            throw new Error('Formato de email inválido');
        }

        // Valida o tamanho da mensagem
        if (dados.message.length > 10000) {
            console.error('Mensagem muito longa');
            throw new Error('Mensagem muito longa. Limite de 10.000 caracteres.');
        }

        console.log('Validação concluída com sucesso');
        return true;
    } catch (error) {
        console.error('Erro na validação dos dados do email:', error);
        throw error;
    }
}

// Função para enviar email com anexo
async function enviarEmailComAnexo(dados, anexo) {
    try {
        // Valida os dados básicos
        validarDadosEmail(dados);

        // Verifica se o anexo é válido
        if (!anexo || !anexo.type || !anexo.data) {
            throw new Error('Anexo inválido');
        }

        // Limita o tamanho do anexo (5MB)
        if (anexo.data.length > 5 * 1024 * 1024) {
            throw new Error('Anexo muito grande. Limite de 5MB.');
        }

        // Adiciona o anexo aos dados
        const dadosComAnexo = {
            ...dados,
            attachment: {
                name: anexo.name || 'anexo',
                data: anexo.data,
                type: anexo.type
            }
        };

        // Configura o timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout ao enviar email com anexo')), 45000);
        });

        // Tenta enviar o email
        const sendPromise = emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            dadosComAnexo
        );

        // Aguarda o envio ou timeout
        const resultado = await Promise.race([sendPromise, timeoutPromise]);
        
        console.log('Email com anexo enviado com sucesso:', resultado);
        return resultado;
    } catch (error) {
        console.error('Erro ao enviar email com anexo:', error);
        throw error;
    }
}

// Função para converter imagem em base64
function converterImagemParaBase64(imagem) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(imagem);
        } catch (error) {
            reject(error);
        }
    });
}

// Event listener para o botão de enviar email
document.addEventListener('DOMContentLoaded', function() {
    const enviarEmailBtn = document.getElementById('enviarEmailBtn');
    if (enviarEmailBtn) {
        enviarEmailBtn.addEventListener('click', async function() {
            try {
                const registro = JSON.parse(this.dataset.registro);
                const emailDestino = document.getElementById('emailDestino').value;
                const mensagemAdicional = document.getElementById('mensagemEmail').value;
                
                if (!emailDestino) {
                    alert('Por favor, insira um email de destino');
        return;
    }
                
                this.disabled = true;
                this.textContent = 'Enviando...';
                
                await enviarEmailRegistro(registro, emailDestino, mensagemAdicional);
                
                // Fecha o modal
                bootstrap.Modal.getInstance(document.getElementById('emailModal')).hide();
                
            } catch (error) {
                console.error('Erro ao enviar email:', error);
                alert('Erro ao enviar email. Por favor, tente novamente.');
            } finally {
                this.disabled = false;
                this.textContent = 'Enviar';
            }
        });
    }
    
    // Atualiza a exibição do histórico quando a página carrega
    carregarHistorico();
});

// Modifica a função processForm para salvar no histórico
async function processForm(event) {
    event.preventDefault();
    
    try {
        // Obtém os dados do formulário
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const local = document.getElementById('local').value;
        const descricao = document.getElementById('descricao').value;
        
        // Verifica se todos os campos obrigatórios foram preenchidos
        if (!data || !hora || !local || !descricao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Obtém a foto do localStorage ou do preview
        let imageData = null;
        const lastPhoto = localStorage.getItem('lastPhoto');
        const imagePreview = document.getElementById('imagePreview');
        
        if (lastPhoto) {
            imageData = lastPhoto;
        } else if (imagePreview && imagePreview.querySelector('img')) {
            imageData = imagePreview.querySelector('img').src;
        }
        
        if (!imageData) {
            alert('Por favor, tire uma foto antes de enviar o registro.');
            return;
        }
        
        // Cria o objeto com os dados da anomalia
        const anomalyData = {
            id: Date.now().toString(),
            timestamp: new Date(`${data}T${hora}`).toISOString(),
            location: local,
            description: descricao,
            image: imageData
        };

        // Salva no histórico
        salvarRegistroNoHistorico(anomalyData);
        
        // Salva também na lista de itens achados
        const itensAchados = JSON.parse(localStorage.getItem('itensAchados') || '[]');
        const novoItem = {
            id: anomalyData.id,
            titulo: descricao.substring(0, 30) + (descricao.length > 30 ? '...' : ''),
            local: local,
            data: new Date(`${data}T${hora}`).toLocaleDateString('pt-BR'),
            descricao: descricao,
            imagem: imageData
        };
        itensAchados.push(novoItem);
        localStorage.setItem('itensAchados', JSON.stringify(itensAchados));
        
        // Atualiza o carrossel de itens
        atualizarCarrosselItens();
        
        // Cria a imagem com as informações
        const infoImage = await criarImagemInfo(anomalyData);
        
        // Envia o email
        await enviarEmail(anomalyData, infoImage);
        
        // Limpa o formulário após o envio bem-sucedido
        event.target.reset();
        if (imagePreview) {
        imagePreview.innerHTML = '';
        }
        localStorage.removeItem('lastPhoto');
        
        alert('Registro enviado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao processar formulário:', error);
        alert(`Erro ao enviar registro: ${error.message}`);
    }
}

// Exporta funções para o escopo global
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.takePhoto = takePhoto;
window.retakePhoto = retakePhoto;
window.showCameraError = showCameraError;

// Função para atualizar o carrossel de itens
function atualizarCarrosselItens() {
    const carouselInner = document.querySelector('.carousel-inner');
    if (!carouselInner) return;

    const itens = JSON.parse(localStorage.getItem('itensAchados') || '[]');
    
    if (itens.length === 0) {
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="item-list">
                    <div class="item-card">
                        <div class="item-info">
                            <h4>Nenhum item disponível</h4>
                            <p>Registre um novo item para que ele apareça aqui</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    carouselInner.innerHTML = '';
    itens.forEach((item, index) => {
        const itemHTML = `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <div class="item-list">
                    <div class="item-card">
                        <div class="item-imagem-container">
                            <img src="${item.imagem}" alt="${item.titulo}" class="item-imagem">
                        </div>
                        <div class="item-info">
                            <h4>${item.titulo}</h4>
                            <p><strong>Local:</strong> ${item.local}</p>
                            <p><strong>Data:</strong> ${item.data}</p>
                            <p><strong>Descrição:</strong> ${item.descricao}</p>
                            <span class="item-status available">Disponível</span>
                            <button class="btn-encontrado" data-id="${item.id}">
                                <i class="fas fa-check-circle"></i> Item Encontrado
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        carouselInner.innerHTML += itemHTML;
    });

    // Adiciona event listeners para os botões
    document.querySelectorAll('.btn-encontrado').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            marcarItemComoEncontrado(itemId);
        });
    });
}

// Função para marcar item como encontrado
function marcarItemComoEncontrado(itemId) {
    try {
        // Obtém os itens do localStorage
        let itens = JSON.parse(localStorage.getItem('itensAchados') || '[]');
        
        // Filtra o item que foi encontrado
        itens = itens.filter(item => item.id !== itemId);
        
        // Salva a lista atualizada
        localStorage.setItem('itensAchados', JSON.stringify(itens));
        
        // Atualiza o carrossel
        atualizarCarrosselItens();
        
        alert('Item marcado como encontrado e removido da lista!');
    } catch (error) {
        console.error('Erro ao marcar item como encontrado:', error);
        alert('Erro ao processar a operação. Por favor, tente novamente.');
    }
}

// Função para inicializar o EmailJS
function inicializarEmailJS() {
    try {
        // Verifica se o EmailJS está disponível
        if (!window.emailjs) {
            throw new Error('Biblioteca EmailJS não carregada');
        }

        // Inicializa o EmailJS com a chave pública
        emailjs.init("UhX1NQMUijjOeEFNH"); // Chave pública do EmailJS

        // Verifica se a inicialização foi bem sucedida
        if (!emailjs.send) {
            throw new Error('Falha na inicialização do EmailJS');
        }

        console.log('EmailJS inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao inicializar EmailJS:', error);
        return false;
    }
}

// Adiciona o listener para inicializar o EmailJS quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o EmailJS
    if (!inicializarEmailJS()) {
        console.warn('EmailJS não inicializado. O envio de emails não estará disponível.');
    }
});

// Função para enviar email com registro
async function enviarEmailRegistro(dados) {
    try {
        console.log('Iniciando envio de email...', dados);
        // Valida os dados antes de enviar
        validarDadosEmail(dados);
        console.log('Dados validados com sucesso');

        // Verifica se há uma imagem para anexar
        if (dados.imagem) {
            console.log('Processando imagem para anexo...');
            try {
                // Converte a imagem para base64
                const imagemBase64 = await converterImagemParaBase64(dados.imagem);
                console.log('Imagem convertida para base64');
                
                // Prepara o anexo
                const anexo = {
                    name: 'registro.jpg',
                    type: 'image/jpeg',
                    data: imagemBase64
                };

                // Envia o email com anexo
                return await enviarEmailComAnexo(dados, anexo);
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                // Continua sem anexo se houver erro
            }
        }

        // Configura o timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout ao enviar email')), 30000);
        });

        // Tenta enviar o email sem anexo
        const sendPromise = emailjs.send(
            "service_2g8768o", // Service ID
            "template_gvn13j7", // Template ID
            dados
        );

        // Aguarda o envio ou timeout
        const resultado = await Promise.race([sendPromise, timeoutPromise]);
        
        console.log('Email enviado com sucesso:', resultado);
        return resultado;
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw error;
    }
}

// Função para deletar a imagem
function deletarImagem() {
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
        localStorage.removeItem('lastPhoto');
    }
}

// Adiciona o event listener para o botão de deletar
document.addEventListener('DOMContentLoaded', function() {
    const btnDeletar = document.querySelector('.btn-deletar-imagem');
    if (btnDeletar) {
        btnDeletar.addEventListener('click', deletarImagem);
    }
});

// Adicionar evento de clique ao botão de logout
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.onclick = function() {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    };
}

// Funções do Menu de Navegação
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove a classe active de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Adiciona a classe active ao link clicado
            this.classList.add('active');
            
            // Lógica para cada item do menu
            const menuItem = this.querySelector('i').className;
            
            if (menuItem.includes('fa-home')) {
                // Página inicial já está ativa
            } else if (menuItem.includes('fa-history')) {
                // Mostrar histórico
                document.querySelector('.historico-section').scrollIntoView({ behavior: 'smooth' });
            } else if (menuItem.includes('fa-chart-bar')) {
                // Mostrar relatórios (implementar futuramente)
                alert('Funcionalidade de relatórios em desenvolvimento');
            } else if (menuItem.includes('fa-cog')) {
                // Mostrar configurações (implementar futuramente)
                alert('Funcionalidade de configurações em desenvolvimento');
            }
        });
    });
}); 