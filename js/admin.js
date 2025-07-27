// Variables globales
let currentProducts = [];
let currentSection = 'productos';

// Cargar productos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupSidebarNavigation();
});

// Configurar navegación del sidebar
function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Actualizar clases activas
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Actualizar contenido
            currentSection = section;
            updateMainContent(section);
        });
    });

    // Activar la sección inicial
    document.querySelector('[data-section="productos"]').classList.add('active');
}

// Actualizar contenido principal según la sección
function updateMainContent(section) {
    const mainTitle = document.querySelector('.admin-header h1');
    const addButton = document.querySelector('.add-button');

    if (section === 'productos') {
        mainTitle.textContent = 'Productos';
        addButton.style.display = 'flex';
        loadProducts();
    } else if (section === 'combos') {
        mainTitle.textContent = 'Combos';
        addButton.style.display = 'flex';
        loadCombos();
    }
}

// Función para cargar productos
async function loadProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/products`, window.fetchConfig);
        const data = await response.json();
        currentProducts = data.products;
        renderProductsTable(currentProducts);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showError('Error al cargar los productos');
    }
}

// Función para cargar combos
async function loadCombos() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/products?category=COMBOS`, window.fetchConfig);
        const data = await response.json();
        currentProducts = data.products;
        renderProductsTable(currentProducts);
    } catch (error) {
        console.error('Error al cargar combos:', error);
        showError('Error al cargar los combos');
    }
}

// Función para renderizar la tabla de productos
function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    products.forEach(product => {
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0].replace('http://localhost:3000', CONFIG.BASE_URL)
            : 'https://via.placeholder.com/50';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product._id}</td>
            <td>
                <img src="${imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatPrice(getLowestPrice(product))}</td>
            <td>
                <button onclick="editProduct('${product._id}')" class="edit-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button onclick="deleteProduct('${product._id}')" class="delete-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <path d="M10 11v6M14 11v6"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Funciones de utilidad
function formatPrice(price) {
    return `$${price.toLocaleString('es-CO')}`;
}

function getLowestPrice(product) {
    const prices = Object.values(product.sizes).map(size => size.offer_price);
    return Math.min(...prices);
}

// Funciones del modal
function openAddProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    resetForm();
}

function resetForm() {
    document.getElementById('product-form').reset();
    const imageUrlsContainer = document.getElementById('image-urls-container');
    imageUrlsContainer.innerHTML = `
        <div class="image-url-input">
            <input type="url" placeholder="URL de la imagen" class="image-url">
            <button type="button" class="remove-image-url" onclick="removeImageUrl(this)">×</button>
        </div>
    `;
}

// Funciones para manejar URLs de imágenes
function addImageUrl() {
    const container = document.getElementById('image-urls-container');
    const newInput = document.createElement('div');
    newInput.className = 'image-url-input';
    newInput.innerHTML = `
        <input type="url" placeholder="URL de la imagen" class="image-url">
        <button type="button" class="remove-image-url" onclick="removeImageUrl(this)">×</button>
    `;
    container.appendChild(newInput);
}

function removeImageUrl(button) {
    const container = document.getElementById('image-urls-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

// Manejo del formulario
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value,
        images: Array.from(document.querySelectorAll('.image-url'))
                    .map(input => input.value)
                    .filter(url => url.trim() !== ''),
        sizes: {
            sencillo: {
                normal_price: parseInt(document.querySelector('.size-price:nth-child(1) input:nth-child(2)').value) || 0,
                offer_price: parseInt(document.querySelector('.size-price:nth-child(1) input:nth-child(3)').value) || 0
            },
            semidoble: {
                normal_price: parseInt(document.querySelector('.size-price:nth-child(2) input:nth-child(2)').value) || 0,
                offer_price: parseInt(document.querySelector('.size-price:nth-child(2) input:nth-child(3)').value) || 0
            },
            doble: {
                normal_price: parseInt(document.querySelector('.size-price:nth-child(3) input:nth-child(2)').value) || 0,
                offer_price: parseInt(document.querySelector('.size-price:nth-child(3) input:nth-child(3)').value) || 0
            }
        }
    };
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/products`, {
            method: 'POST',
            ...window.fetchConfig,
            headers: {
                ...window.fetchConfig.headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el producto');
        }

        // Recargar la página después de guardar exitosamente
        await loadProducts();
        closeModal();
        showSuccess('Producto guardado exitosamente');
        window.location.reload(); // Forzar recarga de la página
    } catch (error) {
        console.error('Error:', error);
        showError(`Error al guardar el producto: ${error.message}`);
    }
});

// Funciones CRUD
async function editProduct(id) {
    const product = currentProducts.find(p => p._id === id);
    if (!product) return;

    // Llenar el formulario con los datos del producto
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-description').value = product.description;

    // Llenar URLs de imágenes
    const imageUrlsContainer = document.getElementById('image-urls-container');
    imageUrlsContainer.innerHTML = '';
    product.images.forEach(url => {
        const input = document.createElement('div');
        input.className = 'image-url-input';
        input.innerHTML = `
            <input type="url" placeholder="URL de la imagen" class="image-url" value="${url}">
            <button type="button" class="remove-image-url" onclick="removeImageUrl(this)">×</button>
        `;
        imageUrlsContainer.appendChild(input);
    });

    // Llenar precios
    const sizePrices = document.querySelectorAll('.size-price');
    ['sencillo', 'semidoble', 'doble'].forEach((size, index) => {
        if (product.sizes[size]) {
            sizePrices[index].querySelector('input:nth-child(2)').value = product.sizes[size].normal_price;
            sizePrices[index].querySelector('input:nth-child(3)').value = product.sizes[size].offer_price;
        }
    });

    // Cambiar el título del modal
    document.querySelector('.modal-header h2').textContent = 'Editar Producto';
    
    // Abrir el modal
    openAddProductModal();
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Error al eliminar el producto');

        if (currentSection === 'productos') {
            await loadProducts();
        } else if (currentSection === 'combos') {
            await loadCombos();
        }
        showSuccess('Producto eliminado exitosamente');
    } catch (error) {
        console.error('Error:', error);
        showError('Error al eliminar el producto');
    }
}

// Funciones de notificación
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <span>✓</span>
            <p>${message}</p>
        </div>
    `;
    showNotification(notification);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <span>⚠</span>
            <p>${message}</p>
        </div>
    `;
    showNotification(notification);
}

function showNotification(notification) {
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
} 