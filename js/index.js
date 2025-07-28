// Solo ejecutar este código si estamos en la página principal
async function renderProducts(products, container) {
    if (!container) {
        console.error('El contenedor no existe');
        return;
    }
    container.innerHTML = '';
    const productCards = await Promise.all(products.map(product => createProductCard(product)));
    productCards.forEach(card => container.appendChild(card));
}

async function loadProducts() {
    try {
        // Primero cargar los productos regulares (no combos)
        const responseRegular = await fetch(`${CONFIG.API_URL}/products`, window.fetchConfig);
        const dataRegular = await responseRegular.json();
        console.log('Datos regulares recibidos:', dataRegular);

        const regularProducts = dataRegular.products.filter(product => product.category !== 'COMBOS');
        const featuredContainer = document.querySelector('.featured-products .products-grid');
        if (featuredContainer) {
            await renderProducts(regularProducts.slice(0, 4), featuredContainer);
        } else {
            console.error('No se encontró el contenedor de productos destacados');
        }

        // Cargar específicamente los combos
        const responseCombos = await fetch(`${CONFIG.API_URL}/products?category=COMBOS`, window.fetchConfig);
        const dataCombos = await responseCombos.json();
        const comboProducts = dataCombos.products;
        console.log('Combos recibidos:', comboProducts);

        // Crear la sección de combos si no existe
        let combosSection = document.querySelector('.combos-section');
        if (!combosSection && comboProducts && comboProducts.length > 0) {
            combosSection = document.createElement('section');
            combosSection.className = 'combos-section container';
            combosSection.innerHTML = `
                <h2>Combos Especiales</h2>
                <div class="products-grid combos-grid"></div>
            `;
            const featuredSection = document.querySelector('.featured-products');
            if (featuredSection) {
                featuredSection.after(combosSection);
            }
        }

        const combosContainer = combosSection ? combosSection.querySelector('.products-grid') : null;
        if (combosContainer && comboProducts && comboProducts.length > 0) {
            await renderProducts(comboProducts, combosContainer);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Asegurarse de que el DOM esté completamente cargado antes de ejecutar
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProducts);
    } else {
        loadProducts();
    }
} 