let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let currentState = 'initial'; // initial, recording, paused, stopped

document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const sendAudioBtn = document.getElementById('send-audio-btn'); // Botón específico de audio
    const audioPreviewContainer = document.getElementById('audio-preview-container');
    const audioPreview = document.getElementById('audio-preview');
    const statusLabel = document.getElementById('status-record');
    const peticionForm = document.getElementById('peticionForm');

    if (recordBtn) {
        recordBtn.addEventListener('click', async () => {
            if (currentState === 'initial' || currentState === 'stopped') {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const options = { mimeType: 'audio/webm' }; 
                    mediaRecorder = new MediaRecorder(stream, options);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        audioUrl = URL.createObjectURL(audioBlob);
                        if(audioPreview) audioPreview.src = audioUrl;
                        updateUI('stopped');
                        stream.getTracks().forEach(track => track.stop());
                    };

                    mediaRecorder.start();
                    updateUI('recording');
                } catch (err) {
                    console.error("Micrófono no disponible:", err);
                    if(statusLabel) statusLabel.innerText = "❌ Micrófono no disponible";
                }
            } else if (mediaRecorder.state === 'recording') {
                mediaRecorder.pause();
                updateUI('paused');
            } else if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
                updateUI('recording');
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            if (currentState === 'recording' || currentState === 'paused') {
                mediaRecorder.stop();
            } else if (currentState === 'stopped') {
                if (audioPreviewContainer) {
                    const isHidden = audioPreviewContainer.classList.contains('hidden');
                    if(isHidden) {
                        audioPreviewContainer.classList.remove('hidden');
                        audioPreview.play();
                        stopBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    } else {
                        audioPreview.pause();
                        stopBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }
            }
        });
    }

    if (audioPreview) {
        audioPreview.onended = () => {
            if (currentState === 'stopped') {
                stopBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        };
    }

    // Lógica para enviar SOLO el audio
    if (sendAudioBtn) {
        sendAudioBtn.addEventListener('click', async () => {
            if (!audioBlob) return;
            const nombre = document.getElementById('nombre').value || 'Anónimo';
            
            if(statusLabel) statusLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando audio...';
            
            try {
                const audioData = new FormData();
                audioData.append('audio', audioBlob, 'voz.webm');
                audioData.append('nombre', nombre);
                
                // RESTAURADO: Llamada original absoluta
                const response = await fetch('https://latinalive.net/api/nota-voz', {
                    method: 'POST',
                    body: audioData
                });

                if (response.ok || response.type === 'opaqueredirect') {
                    if(statusLabel) {
                        statusLabel.innerText = "✅ ¡Audio enviado con éxito!";
                        resetRecorder();
                        setTimeout(() => { if(statusLabel) statusLabel.innerText = ""; }, 3000);
                    }
                } else {
                    if(statusLabel) statusLabel.innerText = "❌ Error al enviar audio";
                }
            } catch (error) {
                console.error("Error envío audio:", error);
                if(statusLabel) statusLabel.innerText = "❌ Error de conexión";
            }
        });
    }

    function updateUI(state) {
        currentState = state;
        switch(state) {
            case 'recording':
                recordBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
                recordBtn.className = 'btn btn-pause recording';
                stopBtn.innerHTML = '<i class="fas fa-stop"></i>';
                stopBtn.classList.remove('hidden');
                sendAudioBtn.classList.add('hidden');
                audioPreviewContainer.classList.add('hidden');
                if(statusLabel) statusLabel.innerHTML = '<span class="recording-indicator"></span> Grabando...';
                break;
            case 'paused':
                recordBtn.innerHTML = '<i class="fas fa-play"></i> Reanudar';
                recordBtn.className = 'btn btn-record';
                if(statusLabel) statusLabel.innerHTML = '<i class="fas fa-pause"></i> En pausa';
                break;
            case 'stopped':
                recordBtn.innerHTML = '<i class="fas fa-redo"></i> Regrabar';
                recordBtn.className = 'btn btn-record';
                stopBtn.innerHTML = '<i class="fas fa-play"></i>';
                stopBtn.classList.remove('hidden');
                sendAudioBtn.classList.remove('hidden');
                if(statusLabel) statusLabel.innerText = "Audio listo para enviar.";
                break;
        }
    }

    function resetRecorder() {
        audioBlob = null;
        currentState = 'initial';
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Iniciar grabación';
        stopBtn.classList.add('hidden');
        sendAudioBtn.classList.add('hidden');
        audioPreviewContainer.classList.add('hidden');
    }

    if (peticionForm) {
        peticionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(peticionForm);
            
            const artista = formData.get('artista') || '';
            const cancionOriginal = formData.get('cancion') || '';
            const cancionCombinada = artista ? `${artista} - ${cancionOriginal}` : cancionOriginal;
            
            const params = new URLSearchParams();
            params.append('nombre', formData.get('nombre') || 'Anónimo');
            params.append('cancion', cancionCombinada);
            params.append('mensaje', formData.get('mensaje') || '');
            
            if(statusLabel) statusLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando petición...';
            
            try {
                // RESTAURADO: Llamada original absoluta
                const resText = await fetch('https://latinalive.net/api/pedido', {
                    method: 'POST',
                    body: params
                });

                if (resText.ok || resText.type === 'opaqueredirect') {
                    if(statusLabel) {
                        statusLabel.innerText = "✅ ¡Petición de texto enviada!";
                        peticionForm.reset();
                        setTimeout(() => { if(statusLabel) statusLabel.innerText = ""; }, 3000);
                    }
                }
            } catch (error) {
                console.error("Error envío texto:", error);
                if(statusLabel) statusLabel.innerText = "❌ Error al enviar petición";
            }
        });
    }
});
