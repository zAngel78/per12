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

// Hacer CONFIG disponible globalmente
window.CONFIG = CONFIG; 