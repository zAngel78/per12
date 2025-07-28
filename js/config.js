const CONFIG = {
    API_URL: 'https://4c002dda3b87.ngrok-free.app/api',
    BASE_URL: 'https://4c002dda3b87.ngrok-free.app',
    IMAGES_URL: 'https://4c002dda3b87.ngrok-free.app/images'
};

// Configuración global para fetch
window.fetchConfig = {
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
};

// Función para cargar imágenes con el header de ngrok
window.loadImage = function(url) {
    return fetch(url, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));
};

// Hacer CONFIG disponible globalmente
window.CONFIG = CONFIG;

// Interceptar todas las imágenes para agregar el header de ngrok
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[src*="ngrok-free.app"]');
    images.forEach(img => {
        const originalSrc = img.src;
        window.loadImage(originalSrc).then(url => {
            img.src = url;
        });
    });
}); 