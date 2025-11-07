// Common JavaScript for all pages

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on all pages
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Add item to cart
function addToCart(id) {
    const drink = getDrinkById(id);
    if (!drink) return;
    
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: drink.id,
            name: drink.name,
            price: drink.price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show confirmation
    const btn = document.querySelector(`[data-id="${id}"]`);
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.background = 'var(--accent)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    }
}

// Get drink by ID
function getDrinkById(id) {
    // This would typically come from an API or database
    // For now, we'll search in our sample data
    const allDrinks = getAllDrinks();
    return allDrinks.find(drink => drink.id === id);
}

// Get all drinks (this would typically come from an API)
function getAllDrinks() {
    // Sample drink data - in a real application, this would come from a database
    return [
// Cocktails (30 items)
{ 
    id: 1, 
    name: "Mojito", 
    category: "cocktails", 
    price: 650, 
    description: "Our signature cocktail with a blend of tropical flavors", 
    image: "images/drinks/cocktails/mojito.jpg", 
    width:200, 
    height:200 
},
{ 
    id: 2, 
    name: "Tequila Sunrise", 
    category: "cocktails", 
    price: 550, 
    description: "A refreshing mix of vodka and tropical juices", 
    image: "images/drinks/cocktails/tequilla sunrise.jpg" // UPDATED with the specific image
},
{ 
    id: 3, 
    name: "Pina Colada", 
    category: "cocktails", 
    price: 700, 
    description: "A sophisticated blend of gin and berry flavors", 
    image: "images/drinks/cocktails/pina colada.jpg"
},
{ 
    id: 4, 
    name: "Safari Martini", 
    category: "cocktails", 
    price: 750, 
    description: "Classic martini with an African twist", 
    image: "images/drinks/cocktails/c1.jpg"
},
{ 
    id: 5, 
    name: "Margarita", 
    category: "cocktails", 
    price: 600, 
    description: "Kenyan twist on the classic Moscow mule", 
    image: "images/drinks/cocktails/margarita.jpg"
},
{ 
    id: 6, 
    name: "Tusker Twist", 
    category: "cocktails", 
    price: 580, 
    description: "Cocktail inspired by Kenya's favorite beer", 
    image: "images/drinks/cocktails/tequilla sunrise.jpg" // Image from daiquiri.jpg is maintained here for the placeholder
},
{ 
    id: 7, 
    name: "Daiquiri", 
    category: "cocktails", 
    price: 500, 
    description: "Traditional Kenyan cocktail meaning 'medicine'", 
    image: "images/drinks/cocktails/daiquiri.jpg"
},
{ 
    id: 8, 
    name: "Cosmopolitan", 
    category: "cocktails", 
    price: 550, 
    description: "Refreshing mojito with coastal flavors", 
    image: "images/drinks/cocktails/cosmopolitan.jpg"
},
{ 
    id: 9, 
    name: "Long Island Iced Tea", 
    category: "cocktails", 
    price: 650, 
    description: "Beautifully layered cocktail inspired by African sunsets", 
    image: "images/drinks/cocktails/Long Island Iced Tea.jpg"
},
{ 
    id: 10, 
    name: "Kilimanjaro Cooler", 
    category: "cocktails", 
    price: 680, 
    description: "Tall refreshing cocktail with mountain-inspired flavors", 
    image: "images/drinks/cocktails/Kilimanjaro Cooler.jpg"
},
{ 
    id: 11, 
    name: "Rift Valley Refresher", 
    category: "cocktails", 
    price: 520, 
    description: "Light and citrusy cocktail perfect for warm days", 
    image: "images/drinks/cocktails/Rift Valley Refresher.jpg"
},
        // Beers (30 items)
// Beers (30 items)
{ 
    id: 31, 
    name: "Tusker Lager", 
    category: "beers", 
    price: 300, 
    description: "Kenya's iconic beer since 1922, known for its clean and crisp taste.", 
    image: "images/drinks/beer/tusker.jpg" // PATH CORRECTED
},
{ 
    id: 32, 
    name: "Tusker Malt", 
    category: "beers", 
    price: 320, 
    description: "A premium, smoother version of the classic Tusker with a rich malty flavor.", 
    image: "images/drinks/beer/Tusker Malt.jpg" // PATH CORRECTED
},
{ 
    id: 33, 
    name: "White Cap", 
    category: "beers", 
    price: 280, 
    description: "A crisp, full-bodied lager known for its balanced taste and distinctive label.", 
    image: "images/drinks/beer/White Cap.jpg" // PATH CORRECTED
},
{ 
    id: 34, 
    name: "Pilsner Ice", 
    category: "beers", 
    price: 290, 
    description: "A smooth and easy-drinking pale lager that is clear and bright.", 
    image: "images/drinks/beer/Pilsner Ice.jpg" // PATH CORRECTED
},
{ 
    id: 35, 
    name: "Balozi", 
    category: "beers", 
    price: 270, 
    description: "A crisp, refreshing Kenyan lager, often sold in cans (Balozi means 'Ambassador').", 
    image: "images/drinks/beer/Balozi.png" // PATH CORRECTED
},
{ 
    id: 36, 
    name: "Guinness", 
    category: "beers", 
    price: 350, 
    description: "World-famous dry stout from Ireland, known for its dark color and creamy head.", 
    image: "images/drinks/beer/Guinness.jpg" // PATH CORRECTED
},
{ 
    id: 37, 
    name: "Heineken", 
    category: "beers", 
    price: 330, 
    description: "An international pale lager known for its subtle fruit notes and balanced bitterness.", 
    image: "images/drinks/beer/Heineken.png" // PATH CORRECTED
},
{ 
    id: 38, 
    name: "Corona Extra", 
    category: "beers", 
    price: 380, 
    description: "A popular pale lager from Mexico, traditionally served with a wedge of lime or lemon.", 
    image: "images/drinks/beer/Corona Extra.jpg" // PATH CORRECTED
},
{ 
    id: 39, 
    name: "Budweiser", 
    category: "beers", 
    price: 320, 
    description: "An American-style pale lager, known as the 'King of Beers,' with a light, crisp flavor.", 
    image: "images/drinks/beer/Budweiser.jpg" // PATH CORRECTED
},
{ 
    id: 40, 
    name: "Stella Artois", 
    category: "beers", 
    price: 360, 
    description: "A classic Belgian pilsner, known for its light gold color and sophisticated, clean finish.", 
    image: "images/drinks/beer/Stella Artois.jpg" // PATH CORRECTED
},
       
        
// Wines (30 items)
{ 
    id: 61, 
    name: "4th Street Sweet Red", 
    category: "wines", 
    price: 1200, 
    description: "A popular, easy-drinking sweet red wine from South Africa, known for its fruity finish.", 
    image: "images/drinks/wines/4th Street Sweet Red.jfif" // UPDATED path
},
{ 
    id: 62, 
    name: "Robertson Sweet White", 
    category: "wines", 
    price: 1100, 
    description: "Robertson Winery's sweet white, offering tropical fruit aromas and a naturally sweet finish.", 
    image: "images/drinks/wines/Robertson Sweet White.jfif" // UPDATED path
},
{ 
    id: 63, 
    name: "Drostdy-Hof Claret Select", 
    category: "wines", 
    price: 1150, 
    description: "A smooth, medium-bodied red blend from South Africa with rich berry flavours.", 
    image: "images/drinks/wines/Drostdy-Hof Claret Select.jfif" // UPDATED path
},
{ 
    id: 64, 
    name: "Frontera Cabernet Sauvignon", 
    category: "wines", 
    price: 1300, 
    description: "A dry, full-bodied Cabernet Sauvignon from Chile with notes of dark fruit and vanilla.", 
    image: "images/drinks/wines/Frontera Cabernet Sauvignonc.jfif" // UPDATED path (File name slightly different)
},
{ 
    id: 65, 
    name: "Nederburg Rosé", 
    category: "wines", 
    price: 1400, 
    description: "A light, crisp South African Rosé with fresh strawberry and floral notes.", 
    image: "images/drinks/wines/Nederburg Rosé.jfif" // UPDATED path
},
{ 
    id: 66, 
    name: "4th Street Rosé", 
    category: "wines", 
    price: 2500, 
    description: "A vibrant, refreshing sweet rosé wine from South Africa with a fruity bouquet.", 
    image: "images/drinks/wines/4th Street Rosé.jfif" // UPDATED path
},
{ 
    id: 67, 
    name: "Robertson Natural Sweet Red", 
    category: "wines", 
    price: 2800, 
    description: "Robertson Winery's famous sweet red, enjoyed chilled, with soft, ripe berry flavours.", 
    image: "images/drinks/wines/Robertson Natural Sweet Red.jfif" // UPDATED path
},
{ 
    id: 68, 
    name: "Drostdy-Hof Extra Light", 
    category: "wines", 
    price: 1600, 
    description: "A delicate, naturally sweet white wine from Drostdy-Hof, lower in alcohol.", 
    image: "images/drinks/wines/Drostdy-Hof Extra Light.jfif" // UPDATED path
},       
        
// Spirits (30 items)
{ 
    id: 91, 
    name: "Gilbey’s Gin", 
    category: "spirits", 
    price: 850, 
    description: "A classic London Dry Gin, known for its balanced blend of botanicals.", 
    image: "images/drinks/spirits/Gilbey’s Gin.jpg" // UPDATED path
},
{ 
    id: 92, 
    name: "Smirnoff Vodka", 
    category: "spirits", 
    price: 900, 
    description: "A world-renowned triple-distilled vodka, famous for its purity and smoothness.", 
    image: "images/drinks/spirits/Smirnoff Vodka.jfif" // UPDATED path
},
{ 
    id: 93, 
    name: "Johnnie Walker Black Label", 
    category: "spirits", 
    price: 1200, 
    description: "A premium 12-year-old blended Scotch whisky, rich, deep, and complex.", 
    image: "images/drinks/spirits/Johnnie Walker Black Label.jfif" // UPDATED path
},
{ 
    id: 94, 
    name: "Johnnie Walker Red", 
    category: "spirits", 
    price: 1500, 
    description: "The world's best-selling Scotch whisky, famous for its bold, vibrant flavour.", 
    image: "images/drinks/spirits/Johnnie Walker Red.jfif" // UPDATED path
},
{ 
    id: 95, 
    name: "Jack Daniel’s", 
    category: "spirits", 
    price: 1800, 
    description: "Old No. 7 Tennessee Whiskey, charcoal mellowed for a signature smooth finish.", 
    image: "images/drinks/spirits/Jack Daniel’s.jfif" // UPDATED path
},
{ 
    id: 96, 
    name: "Absolut Vodka", 
    category: "spirits", 
    price: 800, 
    description: "A clean, full-bodied Swedish premium vodka, continuously distilled for purity.", 
    image: "images/drinks/spirits/Absolut Vodka.jfif" // UPDATED path (Image is Absolut Vanilia)
},
{ 
    id: 97, 
    name: "Captain Morgan", 
    category: "spirits", 
    price: 1300, 
    description: "A popular spiced rum, distilled from molasses and flavoured with spices.", 
    image: "images/drinks/spirits/Captain Morgan.jfif" // UPDATED path (Image is Spiced Gold)
},
{ 
    id: 98, 
    name: "Chrome Vodka", 
    category: "spirits", 
    price: 950, 
    description: "A smooth, crisp, and affordable vodka brand, popular in East Africa.", 
    image: "images/drinks/spirits/Chrome Vodka.jfif" // UPDATED path
},
{ 
    id: 99, 
    name: "Kenya Cane", 
    category: "spirits", 
    price: 1000, 
    description: "A proudly Kenyan cane spirit, famously smooth and versatile for mixing.", 
    image: "images/drinks/spirits/Kenya Cane.jfif" // UPDATED path (Image is Lemon and Ginger Special Edition)
},       
// Sodas (30 items)
{ 
    id: 121, 
    name: "Coca-Cola", 
    category: "sodas", 
    price: 120, 
    description: "The original and iconic carbonated soft drink.", 
    image: "images/drinks/sodas/Coca-Cola.jfif" // UPDATED path
},
{ 
    id: 122, 
    name: "Fanta Orange", 
    category: "sodas", 
    price: 120, 
    description: "A bright, bubbly, and sweet sparkling orange-flavored drink.", 
    image: "images/drinks/sodas/Fanta Orange.jfif" // UPDATED path
},
{ 
    id: 123, 
    name: "Sprite", 
    category: "sodas", 
    price: 120, 
    description: "A refreshing, caffeine-free lemon-lime flavoured soda.", 
    image: "images/drinks/sodas/Sprite.jfif" // UPDATED path
},
{ 
    id: 124, 
    name: "Stoney Tangawizi", 
    category: "sodas", 
    price: 130, 
    description: "Kenya's famous ginger beer with a distinctive, fiery 'tangawizi' (ginger) bite.", 
    image: "images/drinks/sodas/Stoney Tangawizi.jfif" // UPDATED path
},
{ 
    id: 125, 
    name: "Krest Bitter Lemon", 
    category: "sodas", 
    price: 130, 
    description: "A crisp and tart bitter lemon soda, often used as a mixer (Note: Image shows Schweppes, common alternative).", 
    image: "images/drinks/sodas/Krest Bitter Lemon.jfif" // UPDATED path
},
{ 
    id: 126, 
    name: "Krest Tonic Water", 
    category: "sodas", 
    price: 130, 
    description: "Classic quinine-based tonic water, essential for Gin and Tonics.", 
    image: "images/drinks/sodas/Krest Tonic Water.jfif" // UPDATED path
},
{ 
    id: 127, 
    name: "Pepsi", 
    category: "sodas", 
    price: 120, 
    description: "A sweet and bubbly alternative to classic cola.", 
    image: "images/drinks/sodas/Pepsi.jfif" // UPDATED path
},
{ 
    id: 128, 
    name: "Mirinda", 
    category: "sodas", 
    price: 120, 
    description: "A popular, bright orange-flavoured carbonated soft drink.", 
    image: "images/drinks/sodas/Mirinda.jfif" // UPDATED path
},
{ 
    id: 129, 
    name: "Mountain Dew", 
    category: "sodas", 
    price: 130, 
    description: "A highly caffeinated, citrus-flavoured soda.", 
    image: "images/drinks/sodas/Mountain Dew.jfif" // UPDATED path
},
{ 
    id: 130, 
    name: "7UP", 
    category: "sodas", 
    price: 120, 
    description: "A clear, caffeine-free lemon-lime soda known for its clean taste.", 
    image: "images/drinks/sodas/7UP.jfif" // UPDATED path
},  
// Mocktails (30 items)
{ 
    id: 151, 
    name: "Virgin Sunrise", 
    category: "mocktails", 
    price: 350, 
    description: "A bright, layered drink of orange juice and a splash of grenadine.", 
    image: "images/drinks/mocktails/Virgin Sunrise.jfif" // UPDATED path
},
{ 
    id: 152, 
    name: "VirginNojito", 
    category: "mocktails", 
    price: 320, 
    description: "The classic Mojito flavour with fresh mint, lime, and soda water, minus the rum.", 
    image: "images/drinks/mocktails/VirginNojito.jfif" // UPDATED path
},
{ 
    id: 153, 
    name: "Strawberry Cooler", 
    category: "mocktails", 
    price: 380, 
    description: "A sweet and refreshing blend of crushed fresh strawberries and a hint of lime.", 
    image: "images/drinks/mocktails/Strawberry Cooler.jfif" // UPDATED path
},
{ 
    id: 154, 
    name: "Tropical Breeze", 
    category: "mocktails", 
    price: 360, 
    description: "A vibrant, fruity punch combining pineapple, orange, and a touch of sweetness.", 
    image: "images/drinks/mocktails/Tropical Breeze.jfif" // UPDATED path
},
{ 
    id: 155, 
    name: "Berry Blast", 
    category: "mocktails", 
    price: 370, 
    description: "A refreshing muddle of assorted seasonal berries topped with sparkling soda.", 
    image: "images/drinks/mocktails/Berry Blast.jfif" // UPDATED path
},
{ 
    id: 156, 
    name: "Mango Tango", 
    category: "mocktails", 
    price: 350, 
    description: "A rich, smooth fusion of sweet mango and tangy passion fruit juice.", 
    image: "images/drinks/mocktails/Mango Tango.jfif" // UPDATED path
},
{ 
    id: 157, 
    name: "Pineapple Paradise", 
    category: "mocktails", 
    price: 340, 
    description: "Pure pineapple juice blended with creamy coconut milk and a hint of spice.", 
    image: "images/drinks/mocktails/Pineapple Paradise.jfif" // UPDATED path
},
{ 
    id: 158, 
    name: "Citrus Splash", 
    category: "mocktails", 
    price: 330, 
    description: "An invigorating blend of lemon, lime, and orange juices served over ice.", 
    image: "images/drinks/mocktails/Citrus Splash.jfif" // UPDATED path
},
{ 
    id: 159, 
    name: "Cucumber Mint Refresher", 
    category: "mocktails", 
    price: 320, 
    description: "A super-cooling, detoxifying drink with fresh cucumber, mint, and soda.", 
    image: "images/drinks/mocktails/Cucumber Mint Refresher.jfif" // UPDATED path
},
{ 
    id: 160, 
    name: "Ginger Zinger", 
    category: "mocktails", 
    price: 340, 
    description: "A bold, tangy mix of ginger, pineapple, and citrus juices.", 
    image: "images/drinks/mocktails/Ginger Zinger.jfif" // UPDATED path
},       
    ];
}

// Get appropriate icon for drink category
function getDrinkIcon(category) {
    switch(category) {
        case 'cocktails': return 'martini';
        case 'beers': return 'beer';
        case 'wines': return 'wine-alt';
        case 'spirits': return 'whiskey';
        case 'sodas': return 'glass-cheers';
        case 'mocktails': return 'cocktail';
        default: return 'glass';
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                nav.classList.remove('active');
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            filterDrinks(searchTerm);
        });
        // Navigate to site-wide search on Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const term = searchInput.value.trim();
                if (term.length > 0) {
                    window.location.href = 'search.html?q=' + encodeURIComponent(term);
                }
            }
        });
    }
});

// Handle search form submit globally
function siteSearchSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('searchInput');
    const term = input ? input.value.trim() : '';
    if (term.length > 0) {
        window.location.href = 'search.html?q=' + encodeURIComponent(term);
    }
    return false;
}

// Filter drinks based on search term
function filterDrinks(searchTerm) {
    const allDrinks = document.querySelectorAll('.drink-card');
    
    allDrinks.forEach(card => {
        const drinkName = card.querySelector('h3').textContent.toLowerCase();
        if (drinkName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('mobile-active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                nav.classList.remove('mobile-active');
            }
        });
    }
});