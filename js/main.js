// Constantes
// Usar CONFIG.API_URL directamente

// Función para formatear precio
function formatPrice(price) {
    return `$${price.toLocaleString('es-CO')}`;
}

// Función para calcular descuento
function calculateDiscount(normalPrice, offerPrice) {
    if (!normalPrice || !offerPrice) return 0;
    return Math.round(((normalPrice - offerPrice) / normalPrice) * 100);
}

// Función para navegar a la página del producto
function navigateToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Función para crear una tarjeta de producto
async function createProductCard(product) {
    // Crear el contenedor principal
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => navigateToProduct(product._id);

    // Crear la sección de imagen
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image';

    const image = document.createElement('img');
    const defaultImage = 'https://via.placeholder.com/300x300?text=No+imagen';
    
    if (product.images && product.images.length > 0) {
        try {
            const imageUrl = await window.loadImage(product.images[0]);
            image.src = imageUrl;
        } catch (error) {
            console.error('Error loading image:', error);
            image.src = defaultImage;
        }
    } else {
        image.src = defaultImage;
    }
    
    image.alt = product.name;
    imageContainer.appendChild(image);

    // Si hay descuento, mostrar el badge
    const firstSize = product.sizes && Object.values(product.sizes)[0];
    if (firstSize && firstSize.normal_price && firstSize.offer_price) {
        const discount = calculateDiscount(firstSize.normal_price, firstSize.offer_price);
        if (discount > 0) {
            const discountBadge = document.createElement('div');
            discountBadge.className = 'discount-badge';
            discountBadge.textContent = `-${discount}%`;
            imageContainer.appendChild(discountBadge);
        }
    }

    // Crear la sección de información
    const info = document.createElement('div');
    info.className = 'product-info';

    const name = document.createElement('h3');
    name.textContent = product.name;

    const category = document.createElement('div');
    category.className = 'product-category';
    category.textContent = product.category;

    const price = document.createElement('div');
    price.className = 'product-price';

    // Mostrar precios si hay tamaños disponibles
    if (firstSize) {
        if (firstSize.offer_price) {
            const offerPrice = document.createElement('span');
            offerPrice.className = 'offer-price';
            offerPrice.textContent = formatPrice(firstSize.offer_price);
            price.appendChild(offerPrice);
        }

        if (firstSize.normal_price) {
            const normalPrice = document.createElement('span');
            normalPrice.className = 'original-price';
            normalPrice.textContent = formatPrice(firstSize.normal_price);
            price.appendChild(normalPrice);
        }
    }

    // Ensamblar la tarjeta
    info.appendChild(name);
    info.appendChild(category);
    info.appendChild(price);

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}

// Función para agregar al carrito
function addToCart(product, quantity = 1, size = null) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const cartItem = {
        productId: product._id,
        name: product.name,
        image: product.images[0],
        size: size,
        price: product.sizes[size]?.offer_price || Object.values(product.sizes)[0].offer_price,
        quantity: quantity
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    updateCartCount();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Funciones para la API
async function fetchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${CONFIG.API_URL}/products${queryString ? '?' + queryString : ''}`);
    return await response.json();
}

async function fetchProductById(id) {
    const response = await fetch(`${CONFIG.API_URL}/products/${id}`);
    return await response.json();
}

// Inicializar contador del carrito al cargar la página
document.addEventListener('DOMContentLoaded', updateCartCount); 

// Variables para el scroll
let lastScroll = 0;
const nav = document.querySelector('.nav-container');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';

// Crear botón de menú móvil
const createMobileMenuButton = () => {
    const button = document.createElement('button');
    button.className = 'mobile-menu-button';
    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    return button;
};

// Crear menú móvil
const createMobileMenu = () => {
    mobileMenu.innerHTML = `
        <div class="mobile-menu-search">
            <input type="text" placeholder="Buscar producto...">
        </div>
        <nav class="mobile-menu-nav">
            <a href="index.html">Inicio</a>
            <a href="products.html">Productos</a>
            <a href="products.html?category=COLCHONES">Colchones</a>
            <a href="products.html?category=ESPALDARES">Espaldares</a>
            <a href="products.html?category=BASE CAMAS">Base Camas</a>
            <a href="products.html?category=LENCERIA">Lencería</a>
            <a href="products.html?category=COMBOS">Combos</a>
        </nav>
        <div class="mobile-menu-contact">
            <div>(602) 558 1548</div>
            <div>(602) 524 4663</div>
            <div>Calle 9 #32-33, Cali, Valle del Cauca</div>
            <div>colchonessandretty1@hotmail.com</div>
        </div>
    `;
    document.body.appendChild(mobileMenu);
};

// Inicializar navegación móvil
const initMobileNav = () => {
    const navContent = document.querySelector('.nav-content');
    // Solo inicializar si estamos en una página que tiene nav-content
    if (!navContent) return;

    const menuButton = createMobileMenuButton();
    
    // Insertar botón de menú antes del logo
    navContent.insertBefore(menuButton, navContent.firstChild);
    
    // Crear menú móvil
    createMobileMenu();
    
    // Manejar click en el botón de menú
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
            mobileMenu.classList.remove('active');
            menuButton.classList.remove('active');
        }
    });
};

// Manejar scroll para mostrar/ocultar navegación
const handleScroll = () => {
    const nav = document.querySelector('.nav-container');
    // Solo manejar scroll si existe el nav
    if (!nav) return;

    const currentScroll = window.pageYOffset;
    
    // Mostrar/ocultar nav basado en la dirección del scroll
    if (currentScroll > lastScroll && currentScroll > 150) {
        nav.classList.add('hidden');
        mobileMenu.classList.remove('active');
    } else {
        nav.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
};

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    window.addEventListener('scroll', handleScroll);
});

// Manejar resize de la ventana
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        mobileMenu.classList.remove('active');
    }
}); 