// Funciones de utilidad
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function calculateDiscount(normalPrice, offerPrice) {
    if (!normalPrice || !offerPrice) return 0;
    return Math.round(((normalPrice - offerPrice) / normalPrice) * 100);
}

// Obtener el ID del producto de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

console.log('ID del producto:', productId); // Debug log

// Elementos del DOM
const productNameElement = document.getElementById('product-name');
const productCategoryElement = document.getElementById('product-category');
const sizeOptionsElement = document.getElementById('size-options');
const originalPriceElement = document.getElementById('original-price');
const offerPriceElement = document.getElementById('offer-price');
const discountBadgeElement = document.getElementById('discount-badge');
const shortDescriptionElement = document.getElementById('short-description');
const detailedDescriptionElement = document.getElementById('detailed-description');
const galleryMainElement = document.getElementById('gallery-main');
const galleryThumbsElement = document.getElementById('gallery-thumbs');
const breadcrumbElement = document.getElementById('breadcrumb');

// Verificar que todos los elementos existen
console.log('Elementos del DOM:', {
    productName: !!productNameElement,
    productCategory: !!productCategoryElement,
    sizeOptions: !!sizeOptionsElement,
    originalPrice: !!originalPriceElement,
    offerPrice: !!offerPriceElement,
    discountBadge: !!discountBadgeElement,
    shortDescription: !!shortDescriptionElement,
    detailedDescription: !!detailedDescriptionElement,
    galleryMain: !!galleryMainElement,
    galleryThumbs: !!galleryThumbsElement,
    breadcrumb: !!breadcrumbElement
});

// Cargar los detalles del producto
async function loadProductDetails() {
    try {
        console.log('Cargando detalles del producto...'); // Debug log
        const response = await fetch(`${CONFIG.API_URL}/products/${productId}`, window.fetchConfig);
        console.log('Respuesta del servidor:', response.status); // Debug log

        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }

        const product = await response.json();
        console.log('Datos del producto:', product); // Debug log

        // Actualizar el título de la página
        document.title = `${product.name} - Sueños de Oro`;

        // Actualizar el breadcrumb
        breadcrumbElement.innerHTML = `
            <a href="index.html">Inicio</a> /
            <a href="products.html">Productos</a> /
            <a href="products.html?category=${product.category}">${product.category}</a> /
            <span>${product.name}</span>
        `;

        // Actualizar la información del producto
        productNameElement.textContent = product.name;
        productCategoryElement.innerHTML = `
            <span class="category">${product.category}</span>
            ${product.subcategory ? `<span class="subcategory">${product.subcategory}</span>` : ''}
        `;

        // Cargar las imágenes en el carrusel principal
        galleryMainElement.innerHTML = '';
        galleryThumbsElement.innerHTML = '';
        
        console.log('Imágenes del producto:', product.images); // Debug log
        
        product.images.forEach(imageUrl => {
            galleryMainElement.innerHTML += `
                <div class="swiper-slide">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=No+imagen'">
                </div>
            `;
            
            galleryThumbsElement.innerHTML += `
                <div class="swiper-slide">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/100x100?text=No+imagen'">
                </div>
            `;
        });

        // Inicializar los carruseles de Swiper
        console.log('Inicializando Swiper...'); // Debug log
        const galleryThumbs = new Swiper('.gallery-thumbs', {
            spaceBetween: 10,
            slidesPerView: 4,
            freeMode: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
        });

        const galleryMain = new Swiper('.gallery-main', {
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: galleryThumbs
            }
        });

        // Mostrar las opciones de tamaño
        sizeOptionsElement.innerHTML = '';
        console.log('Tamaños disponibles:', Object.keys(product.sizes)); // Debug log
        
        Object.entries(product.sizes).forEach(([size, details]) => {
            const discount = calculateDiscount(details.normal_price, details.offer_price);
            const dimensionsHtml = details.dimensions ? 
                `<span class="size-dimensions">
                    ${details.dimensions.largo || 0}x${details.dimensions.ancho || 0}x${details.dimensions.altura || 0} cm
                </span>` : '';
            
            sizeOptionsElement.innerHTML += `
                <div class="size-option" data-size="${size}">
                    <input type="radio" name="size" id="size-${size}" value="${size}">
                    <label for="size-${size}">
                        <span class="size-name">${size.toUpperCase()}</span>
                        ${dimensionsHtml}
                        <span class="size-price">
                            <span class="offer-price">${formatPrice(details.offer_price)}</span>
                            <span class="original-price">${formatPrice(details.normal_price)}</span>
                            ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                        </span>
                    </label>
                </div>
            `;
        });

        // Mostrar la descripción
        shortDescriptionElement.textContent = product.description;
        detailedDescriptionElement.innerHTML = product.long_description.replace(/\n/g, '<br>');

        // Agregar event listeners a las opciones de tamaño
        document.querySelectorAll('.size-option input').forEach(input => {
            input.addEventListener('change', function() {
                const size = this.value;
                const sizeDetails = product.sizes[size];
                
                // Actualizar precios mostrados
                originalPriceElement.textContent = formatPrice(sizeDetails.normal_price);
                offerPriceElement.textContent = formatPrice(sizeDetails.offer_price);
                
                const discount = calculateDiscount(sizeDetails.normal_price, sizeDetails.offer_price);
                if (discount > 0) {
                    discountBadgeElement.textContent = `-${discount}%`;
                    discountBadgeElement.style.display = 'block';
                } else {
                    discountBadgeElement.style.display = 'none';
                }
            });
        });

        // Seleccionar el primer tamaño por defecto
        const firstSizeInput = document.querySelector('.size-option input');
        if (firstSizeInput) {
            firstSizeInput.checked = true;
            firstSizeInput.dispatchEvent(new Event('change'));
        }

        console.log('Carga de producto completada'); // Debug log

    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
        document.querySelector('.product-container').innerHTML = `
            <div class="error-message">
                Error al cargar el producto. 
                <a href="index.html">Volver al inicio</a>
            </div>
        `;
    }
}

// Función para agregar al carrito
function addToCart() {
    const selectedSize = document.querySelector('input[name="size"]:checked');
    if (!selectedSize) {
        alert('Por favor selecciona un tamaño');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    if (isNaN(quantity) || quantity < 1) {
        alert('Por favor selecciona una cantidad válida');
        return;
    }

    // Aquí iría la lógica para agregar al carrito
    alert('Producto agregado al carrito');
}

// Función para comprar ahora
function buyNow() {
    const selectedSize = document.querySelector('input[name="size"]:checked');
    if (!selectedSize) {
        alert('Por favor selecciona un tamaño');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    if (isNaN(quantity) || quantity < 1) {
        alert('Por favor selecciona una cantidad válida');
        return;
    }

    // Aquí iría la lógica para la compra directa
    alert('Redirigiendo al checkout...');
}

// Funciones para el selector de cantidad
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    const newValue = parseInt(quantityInput.value) - 1;
    if (newValue >= 1) {
        quantityInput.value = newValue;
    }
}

// Cargar los detalles del producto cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, iniciando carga de producto...'); // Debug log
    loadProductDetails();
}); 