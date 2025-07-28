// Solo ejecutar este código si estamos en la página principal
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    async function renderProducts(products, container) {
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
            const featuredContainer = document.querySelector('.featured-products-grid');
            await renderProducts(regularProducts.slice(0, 4), featuredContainer);

            // Cargar específicamente los combos
            const responseCombos = await fetch(`${CONFIG.API_URL}/products?category=COMBOS`, window.fetchConfig);
            const dataCombos = await responseCombos.json();
            const comboProducts = dataCombos.products;
            console.log('Combos recibidos:', comboProducts);

            const combosContainer = document.querySelector('.combos-grid');
            if (combosContainer) {
                await renderProducts(comboProducts, combosContainer);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Cargar productos cuando se carga la página
    document.addEventListener('DOMContentLoaded', loadProducts);
} 