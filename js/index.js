// Solo ejecutar este código si estamos en la página principal
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    async function loadFeaturedProducts() {
        try {
            console.log('Iniciando carga de productos...');
            
            // Primero cargar los productos regulares (no combos)
            const responseRegular = await fetch(`${CONFIG.API_URL}/products`, window.fetchConfig);
            const dataRegular = await responseRegular.json();
            console.log('Datos regulares recibidos:', dataRegular);

            // Filtrar productos que no son combos para la sección de destacados
            const regularProducts = dataRegular.products.filter(product => product.category !== 'COMBOS');
            const featuredProducts = regularProducts.slice(0, 4);
            console.log('Productos destacados:', featuredProducts);

            // Mostrar productos destacados
            const featuredContainer = document.querySelector('.featured-products');
            console.log('Featured container encontrado:', featuredContainer);
            
            if (featuredContainer) {
                const productsGrid = featuredContainer.querySelector('.products-grid');
                console.log('Products grid encontrado:', productsGrid);
                
                if (productsGrid) {
                    productsGrid.innerHTML = '';
                    featuredProducts.forEach(product => {
                        const productCard = createProductCard(product);
                        productsGrid.appendChild(productCard);
                    });
                    console.log('Productos destacados agregados al grid');
                }
            }

            // Cargar específicamente los combos
            const responseCombos = await fetch(`${CONFIG.API_URL}/products?category=COMBOS`, window.fetchConfig);
            const dataCombos = await responseCombos.json();
            const comboProducts = dataCombos.products;
            console.log('Combos encontrados:', comboProducts);

            // Mostrar combos en su propia sección
            const combosSection = document.createElement('section');
            combosSection.className = 'combos-section container';
            combosSection.id = 'combos-section'; // Agregar el ID para el scroll
            combosSection.innerHTML = `
                <h2>Combos Especiales</h2>
                <p class="section-description">¡Aprovecha nuestros combos especiales y ahorra!</p>
                <div class="products-grid combos-grid"></div>
            `;
            console.log('Sección de combos creada:', combosSection);

            // Agregar estilos específicos para la sección de combos
            const style = document.createElement('style');
            style.textContent = `
                .combos-section {
                    padding: 40px 20px;
                    background-color: #f8f9fa;
                    margin-top: 40px;
                }
                .combos-section h2 {
                    text-align: center;
                    color: var(--primary-color);
                    margin-bottom: 10px;
                    font-size: 2em;
                }
                .section-description {
                    text-align: center;
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 1.1em;
                }
                .combos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .combos-grid .product-card {
                    background: white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transform: translateY(0);
                    transition: transform 0.3s ease;
                }
                .combos-grid .product-card:hover {
                    transform: translateY(-5px);
                }
                .combos-grid .discount-badge {
                    background: #ff4444;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 3px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
            console.log('Estilos de combos agregados');

            // Insertar la sección de combos después de los productos destacados
            if (featuredContainer) {
                console.log('Intentando insertar sección de combos después de:', featuredContainer);
                featuredContainer.parentNode.insertBefore(combosSection, featuredContainer.nextSibling);
                console.log('Sección de combos insertada en el DOM');

                // Agregar los combos a la grid
                const combosGrid = combosSection.querySelector('.combos-grid');
                console.log('Grid de combos encontrado:', combosGrid);
                
                if (combosGrid && comboProducts.length > 0) {
                    comboProducts.forEach(combo => {
                        console.log('Creando tarjeta para combo:', combo.name);
                        const comboCard = createProductCard(combo);
                        combosGrid.appendChild(comboCard);
                    });
                    console.log('Combos agregados al grid');
                } else {
                    console.log('No se encontraron combos o el contenedor no existe');
                    console.log('combosGrid:', combosGrid);
                    console.log('comboProducts.length:', comboProducts.length);
                }
            }

        } catch (error) {
            console.error('Error al cargar productos destacados:', error);
        }
    }

    // Cargar productos cuando se carga la página
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
} 