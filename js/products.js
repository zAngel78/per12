// Variables globales
let currentFilters = {
    categories: [],
    subcategories: [],
    sizes: [],
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '',
    page: 1
};

const ITEMS_PER_PAGE = 12;

// Inicializar filtros desde la URL
window.initializeFiltersFromURL = function() {
    const params = new URLSearchParams(window.location.search);
    
    // Categoría desde la URL
    const category = params.get('category');
    if (category) {
        currentFilters.categories = [category];
        const categoryCheckbox = document.querySelector(`input[value="${category}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }
}

// Configurar eventos de filtros
window.setupFilterEvents = function() {
    // Checkboxes de categorías
    const categoryCheckboxes = document.querySelectorAll('#category-filters input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const category = e.target.value;
            if (e.target.checked) {
                // Desmarcar otros checkboxes
                categoryCheckboxes.forEach(cb => {
                    if (cb !== e.target) {
                        cb.checked = false;
                    }
                });
                currentFilters.categories = [category];
            } else {
                currentFilters.categories = [];
            }
            currentFilters.page = 1; // Resetear a la primera página
            window.loadProducts(); // Cargar productos inmediatamente al cambiar categoría
        });
    });

    // Inputs de rango de precio
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    if (minPriceInput && maxPriceInput) {
        minPriceInput.addEventListener('input', (e) => {
            currentFilters.minPrice = e.target.value;
            window.loadProducts(); // Cargar productos al cambiar precio
        });
        maxPriceInput.addEventListener('input', (e) => {
            currentFilters.maxPrice = e.target.value;
            window.loadProducts(); // Cargar productos al cambiar precio
        });
    }

    // Input de búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
            // Debounce para la búsqueda
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.page = 1;
                window.loadProducts();
            }, 300);
        });
    }
}

// Cargar productos
window.loadProducts = async function() {
    try {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';

        // Construir URL con filtros
        const params = new URLSearchParams();
        
        // Usar solo la primera categoría seleccionada
        if (currentFilters.categories.length) {
            params.append('category', currentFilters.categories[0]);
        }
        
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        if (currentFilters.minPrice) {
            params.append('minPrice', currentFilters.minPrice);
        }
        if (currentFilters.maxPrice) {
            params.append('maxPrice', currentFilters.maxPrice);
        }
        params.append('page', currentFilters.page);
        params.append('limit', ITEMS_PER_PAGE);

        const response = await fetch(`${CONFIG.API_URL}/products?${params.toString()}`, window.fetchConfig);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();

        if (!data.products || !data.products.length) {
            productsGrid.innerHTML = '<div class="no-results">No se encontraron productos</div>';
            return;
        }

        productsGrid.innerHTML = '';
        
        // Usar Promise.all para esperar que todas las tarjetas se creen
        const productCards = await Promise.all(data.products.map(product => window.createProductCard(product)));
        productCards.forEach(card => {
            if (card instanceof Node) {
                productsGrid.appendChild(card);
            } else {
                console.error('Card no es un elemento del DOM:', card);
            }
        });

        // Actualizar paginación
        updatePagination(data.total);
        
        // Actualizar URL
        updateURL();

    } catch (error) {
        console.error('Error al cargar productos:', error);
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = '<div class="error">Error al cargar los productos. Por favor, intenta de nuevo más tarde.</div>';
        }
    }
}

// Actualizar paginación
function updatePagination(total) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn');
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentFilters.page === 1;
    prevButton.addEventListener('click', () => changePage(currentFilters.page - 1));
    pagination.appendChild(prevButton);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // Primera página
            i === totalPages || // Última página
            (i >= currentFilters.page - 1 && i <= currentFilters.page + 1) // Páginas alrededor de la actual
        ) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('pagination-btn');
            if (i === currentFilters.page) pageButton.classList.add('active');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => changePage(i));
            pagination.appendChild(pageButton);
        } else if (
            i === currentFilters.page - 2 ||
            i === currentFilters.page + 2
        ) {
            const dots = document.createElement('span');
            dots.classList.add('pagination-dots');
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }

    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn');
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = currentFilters.page === totalPages;
    nextButton.addEventListener('click', () => changePage(currentFilters.page + 1));
    pagination.appendChild(nextButton);
}

// Cambiar página
function changePage(page) {
    currentFilters.page = page;
    window.loadProducts();
    window.scrollTo(0, 0);
}

// Actualizar URL con filtros actuales
function updateURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (currentFilters.categories.length) {
        params.set('category', currentFilters.categories[0]);
    } else {
        params.delete('category');
    }
    
    if (currentFilters.search) {
        params.set('search', currentFilters.search);
    } else {
        params.delete('search');
    }
    
    if (currentFilters.page > 1) {
        params.set('page', currentFilters.page);
    } else {
        params.delete('page');
    }

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
}

// Funcionalidad para filtros móviles
const filtersToggle = document.getElementById('filters-toggle');
const filtersSection = document.querySelector('.filters-section');

if (filtersToggle && filtersSection) {
    filtersToggle.addEventListener('click', () => {
        filtersSection.classList.toggle('active');
    });

    // Cerrar filtros al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!filtersSection.contains(e.target) && !filtersToggle.contains(e.target)) {
            filtersSection.classList.remove('active');
        }
    });

    // Cerrar filtros al hacer scroll
    window.addEventListener('scroll', () => {
        filtersSection.classList.remove('active');
    });
}

// Inicializar la página cuando el DOM esté listo
if (window.location.pathname.includes('products.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeFiltersFromURL();
        window.setupFilterEvents();
        window.loadProducts();
    });
} 