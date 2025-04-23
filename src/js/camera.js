// Camera and image upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const startCamera = document.getElementById('startCamera');
    const takePhoto = document.getElementById('takePhoto');
    const retakePhoto = document.getElementById('retakePhoto');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const noImageText = document.getElementById('noImageText');
    const deleteImage = document.getElementById('deleteImage');
    let stream = null;

    // Start camera
    startCamera.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';
            startCamera.style.display = 'none';
            takePhoto.style.display = 'block';
        } catch (err) {
            console.error('Erro ao acessar a câmera:', err);
            alert('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
        }
    });

    // Take photo
    takePhoto.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        
        previewImage.src = imageData;
        previewImage.style.display = 'block';
        noImageText.style.display = 'none';
        video.style.display = 'none';
        takePhoto.style.display = 'none';
        retakePhoto.style.display = 'block';
        
        // Stop camera stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });

    // Retake photo
    retakePhoto.addEventListener('click', () => {
        previewImage.style.display = 'none';
        noImageText.style.display = 'block';
        retakePhoto.style.display = 'none';
        startCamera.style.display = 'block';
    });

    // Handle file upload
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                noImageText.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // Delete image
    deleteImage.addEventListener('click', () => {
        previewImage.src = '';
        previewImage.style.display = 'none';
        noImageText.style.display = 'block';
        imageInput.value = '';
    });

    // Form submission
    document.getElementById('anormalidadeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            alert('Usuário não está logado!');
            return;
        }

        const formData = {
            userId: userData.email,
            data: document.getElementById('data').value,
            hora: document.getElementById('hora').value,
            local: document.getElementById('local').value,
            descricao: document.getElementById('descricao').value,
            imagem: previewImage.src || '',
            timestamp: new Date().toISOString()
        };

        // Get existing records or create new array
        let records = JSON.parse(localStorage.getItem('records')) || [];
        records.push(formData);
        
        // Save back to localStorage
        localStorage.setItem('records', JSON.stringify(records));
        
        alert('Registro salvo com sucesso!');
        
        // Reset the form
        this.reset();
        previewImage.src = '';
        previewImage.style.display = 'none';
        noImageText.style.display = 'block';
    });
}); 