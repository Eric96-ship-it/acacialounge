// Menu page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const drinkContainer = document.getElementById('drinkContainer');
    
    // Check if we have a category parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    // Set initial filter based on URL parameter or default to 'all'
    let currentFilter = categoryParam || 'all';
    
    // Display drinks based on filter
    displayDrinks(currentFilter);
    
    // Set active filter button
    setActiveFilterByCategory(currentFilter);
    
    // Event listeners for filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            setActiveFilter(btn);
            displayDrinks(filter);
        });
    });
    
    // Display drinks based on filter
    function displayDrinks(filter) {
        drinkContainer.innerHTML = '';
        
        const allDrinks = getAllDrinks();
        const filteredDrinks = filter === 'all' 
            ? allDrinks 
            : allDrinks.filter(drink => drink.category === filter);
        
        filteredDrinks.forEach(drink => {
            const drinkCard = document.createElement('div');
            drinkCard.className = 'drink-card';
            drinkCard.innerHTML = `
                <div class="drink-img">
                    ${drink.image ? 
                        `<img src="${drink.image}" alt="${drink.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                        ''
                    }
                    <div class="drink-icon-fallback" style="${drink.image ? 'display: none;' : ''}">
                        <i class="fas fa-glass-${getDrinkIcon(drink.category)}"></i>
                    </div>
                </div>
                <div class="drink-content">
                    <h3>${drink.name}</h3>
                    <div class="drink-price">Ksh ${drink.price}</div>
                    <p class="drink-desc">${drink.description}</p>
                    <button class="add-to-cart" data-id="${drink.id}">Add to Cart</button>
                </div>
            `;
            drinkContainer.appendChild(drinkCard);
        });
        
        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                addToCart(id);
            });
        });
    }
    
    // Set active filter button
    function setActiveFilter(activeBtn) {
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    // Set active filter by category
    function setActiveFilterByCategory(category) {
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
});