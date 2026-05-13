export async function initChat() {
    const chatContainer = document.getElementById('chat-box');
    if (!chatContainer) return;

    const chatForm = document.querySelector('.chat-controls');

    if (chatForm) {
        chatForm.onsubmit = function (e) {
            e.preventDefault();
            enviarMensaje();
        };
    }

    if (window.chatInterval) clearInterval(window.chatInterval);

    cargarChat();
    window.chatInterval = setInterval(cargarChat, 4000); 
}

async function enviarMensaje() {
    const usuarioInput = document.getElementById('chat-nombre');
    const mensajeInput = document.getElementById('chat-msg');
    const submitBtn = document.querySelector('.btn-chat-send');

    const usuario = usuarioInput.value || "Invitado";
    const mensaje = mensajeInput.value;

    if (!mensaje || !mensaje.trim()) return;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
    }

    try {
        // RESTAURADO: Ruta absoluta
        const response = await fetch('https://latinalive.net/api/enviar-web', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuario: usuario,
                mensaje: mensaje
            })
        });

        if (response.ok) {
            mensajeInput.value = '';
            await cargarChat();
        }
    } catch (e) {
        console.error("Error al enviar mensaje", e);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar Mensaje";
        }
        mensajeInput.focus();
    }
}

let lastMessageId = null; // Usaremos una combinación de fecha y mensaje como ID único temporal
let isInitialLoad = true;

async function cargarChat() {
    try {
        const box = document.getElementById('mensajes-box');
        if (!box) return;

        const res = await fetch('https://latinalive.net/api/leer-chat');
        if (!res.ok) return;
        
        const mensajes = await res.json(); 
        
        if (mensajes.length === 0) return;

        // Si es la primera carga, mostramos todo
        if (isInitialLoad) {
            box.innerHTML = mensajes.map(m => renderMessage(m)).join('');
            const lastM = mensajes[mensajes.length - 1];
            lastMessageId = `${lastM.fecha}-${lastM.mensaje}`;
            isInitialLoad = false;
            scrollToBottom();
            return;
        }

        // Buscamos el índice del último mensaje que ya tenemos
        let index = -1;
        for (let i = mensajes.length - 1; i >= 0; i--) {
            if (`${mensajes[i].fecha}-${mensajes[i].mensaje}` === lastMessageId) {
                index = i;
                break;
            }
        }

        // Si no encontramos el último mensaje (ej: chat vaciado), mostramos todo de nuevo
        if (index === -1 && lastMessageId !== null) {
            box.innerHTML = mensajes.map(m => renderMessage(m)).join('');
        } else {
            // Añadimos solo lo nuevo
            const nuevos = mensajes.slice(index + 1);
            if (nuevos.length > 0) {
                nuevos.forEach(m => {
                    const temp = document.createElement('div');
                    temp.innerHTML = renderMessage(m);
                    box.appendChild(temp.firstElementChild);
                });
            }
        }

        const lastM = mensajes[mensajes.length - 1];
        lastMessageId = `${lastM.fecha}-${lastM.mensaje}`;
        scrollToBottom();

    } catch (e) {
        console.error("Error cargando el chat", e);
    }
}


function renderMessage(m) {
    const timeStr = m.fecha || ''; 
    const timestampHTML = timeStr ? `<small style="color: var(--color-royal-blue); margin-right: 0.5rem;">[${timeStr}]</small>` : '';

    return `
    <p style="margin-bottom: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
        ${timestampHTML} 
        <strong style="color: var(--color-royal-blue);">${m.usuario}:</strong> 
        <span style="color: var(--color-navy);">${m.mensaje}</span>
    </p>
    `;
}

function scrollToBottom() {
    const chatBox = document.getElementById('chat-box');
    if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

