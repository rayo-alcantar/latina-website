/**
 * Crea una animación de destellos (sparkles) cuando se hace clic en un botón.
 */
document.addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (!button) return;

    // Crear múltiples destellos
    for (let i = 0; i < 8; i++) {
        createSparkle(button, e.clientX, e.clientY);
    }
});

function createSparkle(button, clickX, clickY) {
    const sparkle = document.createElement('span');
    sparkle.classList.add('sparkle');

    const rect = button.getBoundingClientRect();
    const size = Math.random() * 8 + 4; // Tamaño entre 4px y 12px
    
    // Posición relativa al botón
    const x = clickX - rect.left;
    const y = clickY - rect.top;

    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    // Dirección aleatoria
    const destinationX = (Math.random() - 0.5) * 100;
    const destinationY = (Math.random() - 0.5) * 100;

    sparkle.animate([
        { transform: 'translate(0, 0) scale(0)', opacity: 1 },
        { transform: `translate(${destinationX}px, ${destinationY}px) scale(1)`, opacity: 0 }
    ], {
        duration: 400 + Math.random() * 200,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
    });

    button.appendChild(sparkle);

    // Eliminar el elemento después de la animación
    setTimeout(() => {
        sparkle.remove();
    }, 600);
}
