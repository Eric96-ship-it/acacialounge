// Add Formspree endpoint constant
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwovkjw';


// Cart page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    updateCart();
    
    // Event listeners
    document.getElementById('clearCart')?.addEventListener('click', clearCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', processCheckout);
    
    // Payment method toggle
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => setPaymentMethod(option));
    });
    
    // Payment sub-method toggle (M-Pesa STK vs Code)
    document.querySelectorAll('.sub-option').forEach(option => {
        option.addEventListener('click', () => setPaymentSubMethod(option));
    });
    
    // Set initial payment method
    setInitialPaymentDisplay();
    
    // Use event delegation for dynamic cart items
    document.getElementById('cartItems').addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle minus button
        if (target.classList.contains('quantity-btn') && target.classList.contains('minus')) {
            const id = parseInt(target.getAttribute('data-id'));
            updateQuantity(id, -1);
        }
        
        // Handle plus button
        if (target.classList.contains('quantity-btn') && target.classList.contains('plus')) {
            const id = parseInt(target.getAttribute('data-id'));
            updateQuantity(id, 1);
        }
        
        // Handle remove item
        if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            const removeBtn = target.classList.contains('remove-item') ? target : target.closest('.remove-item');
            const id = parseInt(removeBtn.getAttribute('data-id'));
            removeFromCart(id);
        }
    });
});

// Mock drink data
const drinks = [
    { id: 1, name: "Mojito", price: 450, category: "cocktails" },
    { id: 2, name: "Tusker Lager", price: 300, category: "beers" },
    { id: 3, name: "South African Red Wine", price: 600, category: "wines" },
    { id: 4, name: "Johnnie Walker", price: 550, category: "spirits" }
];

// Calculate delivery fee based on total quantity
function calculateDeliveryFee(totalQuantity) {
    return totalQuantity < 5 ? 1000 : 800;
}

// Get drink by ID
function getDrinkById(id) {
    // NOTE: If you are using an API or a larger drink list, ensure getAllDrinks is defined elsewhere
    // For now, we use the local 'drinks' array
    return drinks.find(drink => drink.id === id) || { name: "Unknown Drink", category: "cocktails" };
}

// Get drink icon based on category
function getDrinkIcon(category) {
    const icons = {
        cocktails: "martini",
        beers: "beer",
        wines: "wine-glass",
        spirits: "whiskey"
    };
    return icons[category] || "martini";
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Update cart UI
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const totalEl = document.getElementById('total');
    const checkoutTotalEl = document.getElementById('checkoutTotal');
    const itemsCountEl = document.querySelector('.items-count');
    
    cartItems.innerHTML = '';
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    itemsCountEl.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="menu.html" class="btn btn-primary">Browse Our Menu</a>
            </div>
        `;
        subtotalEl.textContent = 'Ksh 0';
        deliveryFeeEl.textContent = 'Ksh 1000';
        totalEl.textContent = 'Ksh 1000';
        if (checkoutTotalEl) checkoutTotalEl.textContent = 'Ksh 1000';
        updateCartCount();
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const drink = getDrinkById(item.id);
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-img">
                ${drink.image ? 
                    `<img src="${drink.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                    ''
                }
                <div class="cart-item-icon-fallback" style="${drink.image ? 'display: none;' : ''}">
                    <i class="fas fa-glass-${getDrinkIcon(drink.category)}"></i>
                </div>
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">Ksh ${item.price}</div>
                <div class="cart-item-quantity">
                    <div class="quantity-btn minus" data-id="${item.id}">-</div>
                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                    <div class="quantity-btn plus" data-id="${item.id}">+</div>
                </div>
            </div>
            <div class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Calculate delivery fee and totals
    const deliveryFee = calculateDeliveryFee(totalQuantity);
    const total = subtotal + deliveryFee;
    
    subtotalEl.textContent = `Ksh ${subtotal}`;
    deliveryFeeEl.textContent = `Ksh ${deliveryFee}`;
    totalEl.textContent = `Ksh ${total}`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `Ksh ${total}`;
    
    // Show delivery fee notice
    showDeliveryFeeNotice(totalQuantity);
    
    updateCartCount();
}

// Show delivery fee notice based on quantity
function showDeliveryFeeNotice(totalQuantity) {
    // Remove any existing notice
    const existingNotice = document.querySelector('.delivery-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    if (totalQuantity > 0) {
        const deliveryFee = calculateDeliveryFee(totalQuantity);
        const notice = document.createElement('div');
        notice.className = 'delivery-notice';
        
        if (totalQuantity < 5) {
            notice.innerHTML = `
                <div class="delivery-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Minimum order: 5 drinks for reduced delivery. Add ${5 - totalQuantity} more drink${5 - totalQuantity === 1 ? '' : 's'} to save Ksh 200 on delivery!</span>
                </div>
            `;
        } else {
            notice.innerHTML = `
                <div class="delivery-success">
                    <i class="fas fa-check-circle"></i>
                    <span>You qualify for reduced delivery fee! 🎉</span>
                </div>
            `;
        }
        
        // Insert after cart items container
        const cartItemsContainer = document.querySelector('.cart-items-container');
        cartItemsContainer.parentNode.insertBefore(notice, cartItemsContainer.nextSibling);
    }
}

// Update item quantity in cart
function updateQuantity(id, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    }
}

// Remove item from cart
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        updateCart();
    }
}

// Set payment method (M-Pesa vs Airtel)
function setPaymentMethod(activeOption) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    activeOption.classList.add('active');
    
    const method = activeOption.getAttribute('data-method');
    
    // Hide all payment details
    document.querySelectorAll('.payment-details').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Show selected payment details
    if (method === 'mpesa') {
        document.getElementById('mpesaDetails').classList.add('active');
    } else if (method === 'airtel') {
        document.getElementById('airtelDetails').classList.add('active');
    }
}

// Set payment sub-method (M-Pesa STK vs Code)
function setPaymentSubMethod(activeOption) {
    document.querySelectorAll('.sub-option').forEach(option => {
        option.classList.remove('active');
    });
    activeOption.classList.add('active');
    
    const subMethod = activeOption.getAttribute('data-submethod');
    
    // Hide all payment fields
    document.querySelectorAll('.payment-field').forEach(field => {
        field.classList.remove('active');
    });
    
    // Show selected payment field
    if (subMethod === 'stk') {
        document.getElementById('mpesaStkField').classList.add('active');
    } else if (subMethod === 'code') {
        document.getElementById('mpesaCodeField').classList.add('active');
    }
}

// Set initial payment display
function setInitialPaymentDisplay() {
    document.querySelector('.payment-option[data-method="mpesa"]').classList.add('active');
    document.querySelector('.sub-option[data-submethod="stk"]').classList.add('active');
    document.getElementById('mpesaDetails').classList.add('active');
    document.getElementById('mpesaStkField').classList.add('active');
}

/**
 * MODIFIED PROCESS CHECKOUT FUNCTION
 * Constructs the full order object and calls the invoice generator on success.
 */
async function processCheckout() {
    // 1. COLLECT AND VALIDATE DATA
    const clientName = document.getElementById('clientName').value.trim();
    const clientId = document.getElementById('clientId').value.trim();
    const clientPhone = document.getElementById('clientPhone').value.trim();
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const specialMessage = document.getElementById('specialMessage').value.trim();

    // Get payment method
    const activePayment = document.querySelector('.payment-option.active');
    const paymentMethod = activePayment ? activePayment.getAttribute('data-method') : 'mpesa';

    // Basic validation
    if (!clientName || !clientPhone || !deliveryAddress) {
        alert('Please fill in your Name, Phone Number, and Delivery Address.');
        return;
    }
    
    // ID Number validation (Optional: only check if a value is provided)
    const idRegex = /^\d{8}$/;
    if (clientId && !idRegex.test(clientId)) {
        alert('Please enter a valid Kenyan ID Number (8 digits) or leave it blank.');
        return;
    }

    // Phone number validation
    if (!isValidKenyanPhone(clientPhone)) {
        alert('Please enter a valid Kenyan phone number for your contact information.');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items to your cart before checking out.');
        return;
    }

    // Calculate order total with dynamic delivery fee
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = calculateDeliveryFee(totalQuantity);
    const total = subtotal + deliveryFee;

    // Payment method summary for the form
    let paymentDetails = 'N/A';
    let paymentProvider = '';
    const paymentPhoneField = document.getElementById('mpesaPhone') || document.getElementById('airtelPhone');
    const paymentPhone = paymentPhoneField ? paymentPhoneField.value.trim() : '';
    const mpesaCode = document.getElementById('mpesaCode')?.value.trim();


    if (paymentMethod === 'mpesa') {
        paymentProvider = 'M-Pesa (Code/STK)';
        const activeSubMethod = document.querySelector('.sub-option.active');
        const subMethod = activeSubMethod ? activeSubMethod.getAttribute('data-submethod') : 'stk';

        if (subMethod === 'stk') {
            if (!paymentPhone) { alert('Please enter your M-Pesa phone number for STK push'); return; }
            if (!isValidKenyanPhone(paymentPhone)) { alert('Please enter a valid M-Pesa phone number'); return; }
            paymentDetails = `STK Push requested to: ${formatPhoneNumber(paymentPhone)}`;
        } else {
            if (!mpesaCode) { alert('Please enter your M-Pesa transaction code'); return; }
            const mpesaCodeRegex = /^[A-Z0-9]{10}$/;
            if (!mpesaCodeRegex.test(mpesaCode)) { alert('Please enter a valid M-Pesa transaction code (10 characters)'); return; }
            paymentDetails = `M-Pesa Code provided: ${mpesaCode}`;
        }

    } else if (paymentMethod === 'airtel') {
        paymentProvider = 'Airtel Money';
        if (!paymentPhone) { alert('Please enter your Airtel Money phone number'); return; }
        if (!isValidKenyanPhone(paymentPhone)) { alert('Please enter a valid Airtel Money phone number'); return; }
        paymentDetails = `Airtel Money payment from: ${formatPhoneNumber(paymentPhone)}`;
    } else {
        paymentProvider = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
        paymentDetails = `Payment method: ${paymentProvider}`;
    }

    // CREATE ORDER OBJECT (FOR INVOICE) BEFORE SUBMITTING/CLEARING
    const orderId = 'ORD-' + Date.now().toString().slice(-6); // Generate a unique ID now
    const order = {
        id: orderId,
        clientName,
        clientId,
        clientPhone: formatPhoneNumber(clientPhone),
        deliveryAddress,
        specialMessage,
        cart,
        subtotal,
        deliveryFee,
        total,
        totalQuantity,
        paymentMethod,
        paymentProvider,
        paymentDetails,
        timestamp: new Date().toISOString(),
    };


    // 2. CONSTRUCT FORMSPREE PAYLOAD
    const cartItemsText = cart.map(item =>
        `${item.quantity} x ${item.name} @ Ksh ${item.price}`
    ).join('\n'); 

    const formData = {
        'Name': clientName,
        'Contact_Phone': order.clientPhone,
        'ID_Number': clientId || 'N/A (No ID Provided)',
        'Delivery_Address': deliveryAddress,
        'Payment_Method': paymentProvider,
        'Payment_Details_Submitted': paymentDetails,
        'Total_Amount': `Ksh ${total}`,
        'Subtotal': `Ksh ${subtotal}`,
        'Delivery_Fee': `Ksh ${deliveryFee}`,
        'Cart_Items_List': cartItemsText,
        'Total_Quantity_Items': totalQuantity,
        'Special_Instructions': specialMessage || 'None',
        // Important for Formspree: sets the email address to reply to
        '_replyto': 'info@acacialounge.co.ke'
    };

    // 3. SUBMIT TO FORMSPREE
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.innerHTML;
    const originalTotal = total; 
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Order...';

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // 4. SUCCESS: GENERATE INVOICE, SHOW CONFIRMATION, AND CLEAR CART
            
            // 4a. Auto-Generate Invoice
            generateAndDisplayInvoice(order);

            // 4b. Show Confirmation
            let confirmationMessage = ` ✅ Order placed successfully and submitted to Acacia Lounge!\n\n 📦 Order ID: ${order.id}\n 💰 Total Amount: Ksh ${total}\n\nThank you for your order. We'll be in touch!`;
            
            if (totalQuantity < 5) {
                confirmationMessage += `\n\n📝 Note: Delivery fee is Ksh 1000 for orders under 5 drinks. Order 5+ drinks to get Ksh 800 delivery!`;
            } else {
                confirmationMessage += `\n\n🎉 You qualified for reduced delivery fee!`;
            }

            alert(confirmationMessage);

            // 4c. Clear cart and reset form fields
            localStorage.removeItem('cart');
            updateCart();
            resetCheckoutForm();
            
            // Re-enable button
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Order & Pay <span id="checkoutTotal">Ksh 1000</span>';


        } else {
            // 4. FAILURE
            let errorText = 'Failed to submit order to Formspree. Please try again.';
            alert(errorText);
            
            // Restore button state
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Complete Order & Pay <span id="checkoutTotal">Ksh ${originalTotal}</span>`;
        }

    } catch (error) {
        console.error('Formspree network error:', error);
        alert('A network error occurred during order submission. Please try again.');
        
        // Restore button state
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Complete Order & Pay <span id="checkoutTotal">Ksh ${originalTotal}</span>`;
    }
}


// Reset checkout form - UPDATED to include phone field
function resetCheckoutForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('clientId').value = '';
    document.getElementById('clientPhone').value = ''; 
    document.getElementById('deliveryAddress').value = '';
    document.getElementById('specialMessage').value = '';
    document.getElementById('mpesaPhone').value = '';
    document.getElementById('mpesaCode').value = '';
    document.getElementById('airtelPhone').value = '';
}

// Validate Kenyan phone numbers (all networks)
function isValidKenyanPhone(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    const phoneRegex = /^(?:254|\+254|0)?(7(?:(?:[012456789][0-9])|(3[0-9]))[0-9]{6})$/;
    return phoneRegex.test(cleaned);
}

// Format phone number to Kenyan standard
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to 254 format if it starts with 0 or 7
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
        cleaned = '254' + cleaned;
    }
    
    // Format for display: 254 XXX XXX XXX
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }
    
    return phone; 
}


// --- INVOICE GENERATION FUNCTIONS ---

/**
 * Opens a new window with the generated invoice HTML and triggers the print dialog.
 */
function generateAndDisplayInvoice(order) {
    const invoiceHTML = generateInvoiceHTML(order);
    
    // Open a new window
    // Set a default size for a better view before printing
    const win = window.open('', '_blank', 'width=800,height=800'); 
    
    // Write content to the new window
    win.document.write(invoiceHTML);
    win.document.close(); // Close the document stream
    
    // Optional: Auto-print on creation. Comment this line out if you prefer the user to click the print button.
    // setTimeout(() => { win.print(); }, 500); 
}


/**
 * Generates the clean, printable HTML structure for the stylish invoice,
 * including control buttons (Print, Download, Share) and inline styles.
 */
/**
 * Generates the mobile-responsive printable HTML structure for the stylish invoice
 */
/**
 * Generates the mobile-responsive printable HTML structure for the professional invoice
 */
function generateInvoiceHTML(order) {
    // Format date nicely
    const date = new Date(order.timestamp).toLocaleDateString('en-KE', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Create the table rows for cart items
    const itemRows = order.cart.map((item, index) => `
        <tr class="item-row">
            <td>${index + 1}</td>
            <td class="item-name">${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">Ksh ${item.price.toLocaleString()}</td>
            <td class="text-right">Ksh ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    // Return the full HTML document for the invoice with mobile-responsive design
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice - Order ${order.id}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --primary: #8B4513; /* Acacia Brown */
                    --secondary: #D4AF37; /* Gold */
                    --accent: #2E8B57; /* Green */
                    --dark: #1a1a1a;
                    --light: #f5f5f5;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                    color: #333;
                    line-height: 1.5;
                }
                
                .invoice-wrapper {
                    max-width: 100%;
                    margin: 0 auto;
                    background: #fff;
                    min-height: 100vh;
                }
                
                .invoice-box {
                    padding: 30px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                
                /* Header */
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid var(--primary);
                }
                
                .logo-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary);
                }
                
                .invoice-header .details {
                    text-align: right;
                    font-size: 16px;
                }
                
                .invoice-header .details strong {
                    color: var(--dark);
                    font-size: 18px;
                    display: block;
                    margin-bottom: 5px;
                }

                /* Client/Business Info */
                .info-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 20px 0;
                    border-bottom: 1px dashed #ddd;
                }
                
                .client-info, .business-info {
                    width: 48%;
                }
                
                .business-info {
                    text-align: right;
                }
                
                .info-section h3 {
                    color: var(--accent);
                    margin-top: 0;
                    margin-bottom: 12px;
                    font-size: 18px;
                    border-left: 4px solid var(--accent);
                    padding-left: 10px;
                }
                
                .business-info h3 {
                    border-left: none;
                    border-right: 4px solid var(--accent);
                    padding-left: 0;
                    padding-right: 10px;
                    text-align: right;
                }

                /* Table */
                .table-container {
                    width: 100%;
                    overflow-x: auto;
                    margin: 20px 0;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                }
                
                .item-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 600px;
                }
                
                .item-table th, .item-table td {
                    padding: 14px 12px;
                    border-bottom: 1px solid #eee;
                    text-align: left;
                }
                
                .item-table th {
                    background-color: var(--primary);
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 13px;
                    letter-spacing: 0.5px;
                }
                
                .item-table .item-row:hover {
                    background-color: #fafafa;
                }
                
                .item-table td:first-child { 
                    width: 8%;
                    text-align: center;
                }
                
                .item-table .item-name {
                    width: 42%;
                }
                
                .item-table td:nth-child(3) { 
                    width: 15%;
                    text-align: center;
                }
                
                .item-table td:nth-child(4), 
                .item-table td:nth-child(5) { 
                    width: 17.5%;
                }

                /* Totals */
                .totals-box {
                    width: 100%;
                    max-width: 400px;
                    margin-left: auto;
                    margin-top: 25px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                
                .totals-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 14px 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .totals-row:last-child {
                    border-bottom: none;
                    background-color: #f7f3e8;
                    color: var(--dark);
                    font-weight: 700;
                    font-size: 1.2em;
                }
                
                .totals-row span:first-child {
                    font-weight: 500;
                }

                /* Footer */
                .invoice-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 25px;
                    border-top: 1px solid #ddd;
                    font-size: 13px;
                    color: #666;
                }
                
                .payment-info {
                    margin: 15px 0;
                    padding: 15px;
                    background: var(--light);
                    border-radius: 6px;
                    display: inline-block;
                    text-align: left;
                }

                /* Utility Classes */
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }

                /* Action Bar for buttons */
                .action-bar {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-bottom: 1px solid #eee;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    flex-wrap: wrap;
                }
                
                .action-bar button {
                    padding: 14px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    color: white;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 160px;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .action-bar .print-btn { 
                    background-color: #3498db; 
                }
                .action-bar .download-btn { 
                    background-color: var(--accent); 
                }
                .action-bar .share-btn { 
                    background-color: #f39c12; 
                }
                .action-bar .close-btn { 
                    background-color: #7f8c8d; 
                }
                .action-bar button:hover { 
                    opacity: 0.9; 
                    transform: translateY(-2px); 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                /* Mobile Styles */
                @media (max-width: 768px) {
                    .invoice-box {
                        padding: 20px 15px;
                    }
                    
                    .invoice-header {
                        flex-direction: column;
                        text-align: center;
                        gap: 15px;
                    }
                    
                    .logo-title {
                        font-size: 28px;
                    }
                    
                    .invoice-header .details {
                        text-align: center;
                        width: 100%;
                    }
                    
                    .info-section {
                        flex-direction: column;
                        gap: 25px;
                    }
                    
                    .client-info, .business-info {
                        width: 100%;
                    }
                    
                    .business-info {
                        text-align: left;
                    }
                    
                    .business-info h3 {
                        border-right: none;
                        border-left: 4px solid var(--accent);
                        padding-right: 0;
                        padding-left: 10px;
                        text-align: left;
                    }
                    
                    .info-section h3 {
                        font-size: 18px;
                    }
                    
                    .item-table {
                        min-width: 550px;
                    }
                    
                    .item-table th, .item-table td {
                        padding: 12px 10px;
                        font-size: 13px;
                    }
                    
                    .item-table th {
                        font-size: 12px;
                    }
                    
                    .totals-box {
                        width: 100%;
                        max-width: none;
                        margin: 25px auto 0;
                    }
                    
                    .totals-row {
                        padding: 12px 15px;
                        font-size: 15px;
                    }
                    
                    .action-bar {
                        padding: 15px;
                        gap: 10px;
                    }
                    
                    .action-bar button {
                        min-width: 140px;
                        padding: 12px 15px;
                        font-size: 13px;
                    }
                }
                
                @media (max-width: 480px) {
                    .invoice-box {
                        padding: 15px 10px;
                    }
                    
                    .logo-title {
                        font-size: 24px;
                    }
                    
                    .invoice-header .details strong {
                        font-size: 16px;
                    }
                    
                    .item-table {
                        min-width: 450px;
                    }
                    
                    .item-table th, .item-table td {
                        padding: 10px 8px;
                        font-size: 12px;
                    }
                    
                    .info-section {
                        padding: 15px 0;
                    }
                    
                    .totals-row {
                        padding: 10px 12px;
                        font-size: 14px;
                    }
                    
                    .action-bar {
                        flex-direction: column;
                    }
                    
                    .action-bar button {
                        width: 100%;
                        min-width: auto;
                    }
                    
                    .invoice-footer {
                        margin-top: 30px;
                        padding-top: 20px;
                    }
                }

                /* Print Styles */
                @media print {
                    .action-bar {
                        display: none;
                    }
                    
                    .invoice-wrapper {
                        box-shadow: none;
                        margin: 0;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    
                    .invoice-box {
                        padding: 0;
                        font-size: 12px;
                    }
                    
                    body {
                        background: white;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .info-section {
                        border: none;
                        padding: 15px 0;
                    }
                    
                    .invoice-footer {
                        background: white;
                        margin-top: 30px;
                    }
                    
                    .table-container {
                        overflow-x: visible;
                        border: 1px solid #ddd;
                    }
                    
                    .item-table {
                        min-width: 100%;
                    }
                    
                    .totals-box {
                        border: 1px solid #ddd;
                    }
                }
            </style>

            <script>
                // Functions for buttons
                function printInvoice() {
                    window.print();
                }

                function downloadInvoice() {
                    alert('Please select "Save as PDF" as your destination in the print dialog to download your invoice.');
                    window.print();
                }

                function shareInvoice() {
                    if (navigator.share) {
                        navigator.share({
                            title: 'Acacia Lounge Order Invoice',
                            text: 'My order invoice from Acacia Lounge.',
                            url: window.location.href 
                        }).catch(error => console.error('Error sharing:', error));
                    } else {
                        alert('Your browser does not support sharing. Please save the invoice as a PDF and share manually.');
                    }
                }
                
                function closeInvoice() {
                    window.close();
                }
                
                // Add event listener for Escape key to close
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closeInvoice();
                    }
                });
            </script>
        </head>
        <body>
            <div class="action-bar">
                <button class="print-btn" onclick="printInvoice()">
                    <i class="fas fa-print"></i> Print Invoice
                </button>
                <button class="download-btn" onclick="downloadInvoice()">
                    <i class="fas fa-download"></i> Save as PDF
                </button>
                <button class="share-btn" onclick="shareInvoice()">
                    <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="close-btn" onclick="closeInvoice()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
            
            <div class="invoice-wrapper">
                <div class="invoice-box">
                    <div class="invoice-header">
                        <div class="logo">
                            <div class="logo-title">Acacia <span style="color: var(--secondary);">Lounge</span></div>
                            <div style="font-size: 14px; color: #666; margin-top: 5px;">Premium Bar Experience</div>
                        </div>
                        <div class="details">
                            <strong>INVOICE</strong>
                            <div>Order #: ${order.id}</div>
                            <div>Date: ${date}</div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <div class="client-info">
                            <h3>Bill To:</h3>
                            <div><strong>${order.clientName}</strong></div>
                            <div>Phone: ${order.clientPhone}</div>
                            <div>Address: ${order.deliveryAddress}</div>
                            ${order.clientId ? `<div>ID Number: ${order.clientId}</div>` : ''}
                        </div>
                        <div class="business-info">
                            <h3>From:</h3>
                            <div><strong>Acacia Lounge</strong></div>
                            <div>Clay City, Nairobi</div>
                            <div>Phone: 0721555163</div>
                            <div>Email: info@acacialounge.co.ke</div>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="item-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Description</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-right">Unit Price</th>
                                    <th class="text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>
                    </div>

                    <div class="totals-box">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>Ksh ${order.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="totals-row">
                            <span>Delivery Fee:</span>
                            <span>Ksh ${order.deliveryFee.toLocaleString()}</span>
                        </div>
                        <div class="totals-row">
                            <span>Total Amount:</span>
                            <span>Ksh ${order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="invoice-footer">
                        <div class="payment-info">
                            <div><strong>Payment Method:</strong> ${order.paymentProvider}</div>
                            <div><strong>Payment Details:</strong> ${order.paymentDetails}</div>
                        </div>
                        <div style="margin: 15px 0;">
                            <strong>Special Instructions:</strong> ${order.specialMessage || 'None provided'}
                        </div>
                        <div style="margin-bottom: 15px;">
                            Total Items: ${order.totalQuantity} | Order Value: Ksh ${order.total.toLocaleString()}
                        </div>
                        <div style="border-top: 1px solid #eee; padding-top: 15px;">
                            <div>&copy; ${new Date().getFullYear()} Acacia Lounge. All Rights Reserved.</div>
                            <div style="margin-top: 8px; font-weight: 600;">Thank you for your business!</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Auto-focus on the print button for better accessibility
                document.addEventListener('DOMContentLoaded', function() {
                    const printBtn = document.querySelector('.print-btn');
                    if (printBtn) {
                        printBtn.focus();
                    }
                });
            </script>
        </body>
        </html>
    `;
}

/**
 * Opens a new window with the generated invoice HTML
 */
function generateAndDisplayInvoice(order) {
    const invoiceHTML = generateInvoiceHTML(order);
    
    // Open a new window with appropriate size
    const win = window.open('', '_blank', 'width=800,height=900,scrollbars=yes');
    
    // Write content to the new window
    win.document.write(invoiceHTML);
    win.document.close();
    
    // Focus on the new window
    win.focus();
}