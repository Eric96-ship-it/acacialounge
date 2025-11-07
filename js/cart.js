// Add Formspree endpoint constant
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwovkjw';


// Cart page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    updateCart();
    
    // Update order statistics
    updateOrderStatistics();
    
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

// Calculate delivery fee based on total quantity (increases by 500 for every 20 drinks)
function calculateDeliveryFee(totalQuantity) {
    // Calculate delivery fee increase: 500 for every 20 drinks in cart
    const drinkIncrease = Math.floor(totalQuantity / 20) * 500;
    
    // Base delivery fee: 1000 for orders under 5 drinks, 800 for 5+ drinks
    const baseFee = totalQuantity < 5 ? 1000 : 800;
    
    // Total delivery fee = base fee + drink quantity increase
    return baseFee + drinkIncrease;
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

// Update order statistics based on drink quantity
function updateOrderStatistics() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    const drinkIncrease = Math.floor(totalQuantity / 20) * 500;
    const nextIncreaseAt = (Math.floor(totalQuantity / 20) + 1) * 20;
    
    document.getElementById('totalOrders').textContent = totalQuantity;
    document.getElementById('deliveryIncrease').textContent = `Ksh ${drinkIncrease}`;
    document.getElementById('nextIncrease').textContent = `${nextIncreaseAt} drinks`;
}

// Show delivery fee notice based on drink quantity
function showDeliveryFeeNotice(totalQuantity) {
    // Remove any existing notice
    const existingNotice = document.querySelector('.delivery-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    if (totalQuantity > 0) {
        const deliveryFee = calculateDeliveryFee(totalQuantity);
        const drinkIncrease = Math.floor(totalQuantity / 20) * 500;
        const nextIncreaseAt = (Math.floor(totalQuantity / 20) + 1) * 20;
        
        const notice = document.createElement('div');
        notice.className = 'delivery-notice';
        
        if (totalQuantity < 5) {
            notice.innerHTML = `
                <div class="delivery-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Minimum order: 5 drinks for reduced delivery. Add ${5 - totalQuantity} more drink${5 - totalQuantity === 1 ? '' : 's'} to save Ksh 200 on delivery! Current delivery fee: Ksh ${deliveryFee}${drinkIncrease > 0 ? ` (includes Ksh ${drinkIncrease} quantity-based increase)` : ''}. Next increase at ${nextIncreaseAt} drinks.</span>
                </div>
            `;
        } else {
            notice.innerHTML = `
                <div class="delivery-success">
                    <i class="fas fa-check-circle"></i>
                    <span>You qualify for reduced delivery fee! 🎉 Current delivery fee: Ksh ${deliveryFee}${drinkIncrease > 0 ? ` (includes Ksh ${drinkIncrease} quantity-based increase)` : ''}. Next increase at ${nextIncreaseAt} drinks.</span>
                </div>
            `;
        }
        
        // Insert after cart items container
        const cartItemsContainer = document.querySelector('.cart-items-container');
        cartItemsContainer.parentNode.insertBefore(notice, cartItemsContainer.nextSibling);
    }
    
    // Update order statistics whenever delivery fee is updated
    updateOrderStatistics();
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

            // 4c. Show Confirmation
            const drinkIncrease = Math.floor(totalQuantity / 20) * 500;
            
            let confirmationMessage = ` ✅ Order placed successfully and submitted to Acacia Lounge!\n\n 📦 Order ID: ${order.id}\n 💰 Total Amount: Ksh ${total}\n\nThank you for your order. We'll be in touch!`;
            
            if (totalQuantity < 5) {
                confirmationMessage += `\n\n📝 Note: Delivery fee is Ksh 1000 for orders under 5 drinks, Order 5+ drinks to get reduced delivery!`;
            } else {
                confirmationMessage += `\n\n🎉 You qualified for reduced delivery fee!`;
            }
            
            if (drinkIncrease > 0) {
                confirmationMessage += `\n\n💡 Current delivery fee includes Ksh ${drinkIncrease} quantity-based increase (increases every 20 drinks).`;
            }

            alert(confirmationMessage);

            // 4d. Clear cart and reset form fields
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
 * Generates the professional receipt-sized HTML with download functionality
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
            <td class="item-name">${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${item.price.toLocaleString()}</td>
            <td class="text-right">${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    // Return the full HTML document for a professional receipt
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Receipt - Order ${order.id}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --primary: #2c3e50;
                    --secondary: #34495e;
                    --accent: #27ae60;
                    --light: #ecf0f1;
                    --gray: #7f8c8d;
                    --border: #bdc3c7;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    background: #f8f9fa;
                    padding: 20px;
                    color: #2c3e50;
                    line-height: 1.4;
                }
                
                .receipt-container {
                    max-width: 400px;
                    margin: 0 auto;
                    background: white;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .receipt-header {
                    text-align: center;
                    padding: 20px 15px 15px;
                    border-bottom: 2px dashed var(--border);
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                }
                
                .receipt-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    letter-spacing: 2px;
                }
                
                .receipt-subtitle {
                    font-size: 12px;
                    opacity: 0.9;
                    font-style: italic;
                }
                
                .receipt-info {
                    padding: 15px;
                    border-bottom: 1px dashed var(--border);
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                }
                
                .info-row:last-child {
                    margin-bottom: 0;
                }
                
                .info-label {
                    font-weight: bold;
                    color: var(--gray);
                }
                
                .info-value {
                    text-align: right;
                    font-weight: 500;
                }
                
                .receipt-section {
                    padding: 15px;
                    border-bottom: 1px dashed var(--border);
                }
                
                .section-title {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--primary);
                }
                
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                
                .receipt-table th {
                    border-bottom: 2px solid var(--border);
                    padding: 8px 4px;
                    text-align: left;
                    font-weight: bold;
                    color: var(--secondary);
                    font-size: 11px;
                    text-transform: uppercase;
                }
                
                .receipt-table td {
                    padding: 6px 4px;
                    border-bottom: 1px solid var(--light);
                }
                
                .receipt-table .text-center {
                    text-align: center;
                }
                
                .receipt-table .text-right {
                    text-align: right;
                }
                
                .item-name {
                    font-weight: 500;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .totals-section {
                    padding: 15px;
                    background: var(--light);
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 13px;
                }
                
                .total-row.final {
                    font-size: 16px;
                    font-weight: bold;
                    color: var(--primary);
                    border-top: 2px solid var(--border);
                    padding-top: 8px;
                    margin-top: 8px;
                }
                
                .receipt-footer {
                    text-align: center;
                    padding: 20px 15px;
                    background: var(--light);
                    border-top: 2px dashed var(--border);
                }
                
                .footer-text {
                    font-size: 11px;
                    color: var(--gray);
                    margin-bottom: 10px;
                    line-height: 1.3;
                }
                
                .footer-highlight {
                    font-size: 12px;
                    font-weight: bold;
                    color: var(--accent);
                    margin-bottom: 5px;
                }
                
                .qr-section {
                    text-align: center;
                    padding: 15px;
                    background: white;
                }
                
                .qr-placeholder {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 10px;
                    background: var(--light);
                    border: 2px solid var(--border);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--gray);
                }
                
                .download-section {
                    padding: 20px 15px;
                    text-align: center;
                    background: var(--primary);
                    color: white;
                }
                
                .download-btn {
                    background: var(--accent);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin: 5px;
                }
                
                .download-btn:hover {
                    background: #219a52;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
                }
                
                .download-btn.secondary {
                    background: transparent;
                    border: 2px solid white;
                }
                
                .download-btn.secondary:hover {
                    background: white;
                    color: var(--primary);
                }

                /* Mobile Responsive */
                @media (max-width: 480px) {
                    body {
                        padding: 10px;
                    }
                    
                    .receipt-container {
                        max-width: 100%;
                        margin: 0;
                    }
                    
                    .receipt-header {
                        padding: 15px 10px 12px;
                    }
                    
                    .receipt-title {
                        font-size: 20px;
                    }
                    
                    .receipt-info,
                    .receipt-section,
                    .totals-section,
                    .receipt-footer {
                        padding: 12px 10px;
                    }
                    
                    .info-row {
                        font-size: 12px;
                    }
                    
                    .receipt-table {
                        font-size: 11px;
                    }
                    
                    .receipt-table th,
                    .receipt-table td {
                        padding: 6px 3px;
                    }
                    
                    .item-name {
                        max-width: 100px;
                    }
                    
                    .total-row {
                        font-size: 12px;
                    }
                    
                    .total-row.final {
                        font-size: 14px;
                    }
                }

                /* Print Styles */
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .download-section {
                        display: none;
                    }
                    
                    .receipt-container {
                        box-shadow: none;
                        border: 1px solid #ddd;
                        max-width: 400px;
                        margin: 0 auto;
                    }
                }
            </style>

            <script>
                // Download functionality
                function downloadReceipt() {
                    if (window.__receiptDownloaded) return;
                    const element = document.querySelector('.receipt-container');
                    const opt = {
                        margin: 10,
                        filename: 'Acacia-Lounge-Receipt-' + new Date().toISOString().slice(0,10) + '.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
                    };

                    // Use html2pdf library
                    if (typeof html2pdf !== 'undefined') {
                        window.__receiptDownloaded = true;
                        html2pdf().set(opt).from(element).save();
                    } else {
                        // Fallback: Print to PDF
                        window.print();
                    }
                }

                function printReceipt() {
                    window.print();
                }

                function closeReceipt() {
                    window.close();
                }

                

                // Share PDF via Web Share API (Android Chrome and supported browsers)
                async function shareReceiptPDF() {
                    const element = document.querySelector('.receipt-container');
                    const filename = 'Acacia-Lounge-Receipt-' + new Date().toISOString().slice(0,10) + '.pdf';
                    const opt = {
                        margin: 10,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
                    };

                    if (typeof html2pdf === 'undefined' || !navigator.canShare) {
                        alert('Sharing files is not supported on this device. Please download and send via WhatsApp manually.');
                        return;
                    }

                    try {
                        const worker = html2pdf().set(opt).from(element).toPdf();
                        const pdf = await worker.get('pdf');
                        const blob = pdf.output('blob');
                        const file = new File([blob], filename, { type: 'application/pdf' });

                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Acacia Lounge Receipt',
                                text: 'Receipt PDF generated by Acacia Lounge.'
                            });
                        } else {
                            alert('Your device cannot share PDF files. Please use Download and send manually.');
                        }
                    } catch (err) {
                        console.error('Share failed:', err);
                        alert('Failed to prepare the PDF for sharing. Please try Download and send manually.');
                    }
                }

                // Add html2pdf library
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = function() {
                    console.log('html2pdf loaded successfully');
                    if (document.readyState === 'complete') {
                        // Auto-download once everything is ready
                        setTimeout(downloadReceipt, 0);
                    } else {
                        window.addEventListener('load', function() { setTimeout(downloadReceipt, 0); }, { once: true });
                    }
                };
                document.head.appendChild(script);

                // Auto-focus on download button
                document.addEventListener('DOMContentLoaded', function() {
                    const downloadBtn = document.querySelector('.download-btn');
                    if (downloadBtn) {
                        downloadBtn.focus();
                    }
                });
            </script>
        </head>
        <body>
            <div class="receipt-container">
                <div class="receipt-header">
                    <div class="receipt-title">ACACIA LOUNGE</div>
                    <div class="receipt-subtitle">Premium Bar Experience</div>
                    <div class="receipt-contact" style="font-size: 11px; color: var(--gray); margin-top: 4px;">
                        <span><strong>Owner:</strong> Salesio Muriuki</span> • 
                        <span><strong>Phone:</strong> 0721555163</span> • 
                        <span><strong>Email:</strong> muriukisalesio@gmail.com</span>
                    </div>
                </div>
                
                <div class="receipt-info">
                    <div class="info-row">
                        <span class="info-label">Receipt #:</span>
                        <span class="info-value">${order.id}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${date}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Customer:</span>
                        <span class="info-value">${order.clientName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${order.clientPhone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Delivery Address:</span>
                        <span class="info-value">${order.deliveryAddress || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Special Instructions:</span>
                        <span class="info-value">${order.specialMessage || 'None'}</span>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <div class="section-title">Order Details</div>
                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>
                </div>
                
                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>Delivery Fee:</span>
                        <span>${order.deliveryFee.toLocaleString()}</span>
                    </div>
                    <div class="total-row final">
                        <span>TOTAL:</span>
                        <span>${order.total.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <div class="footer-highlight">Payment: ${order.paymentProvider}</div>
                    <div class="footer-text">Thank you for choosing Acacia Lounge!</div>
                    <div class="footer-text">For inquiries: 0700 000 000</div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-placeholder">QR CODE</div>
                    <div style="font-size: 10px; color: var(--gray);">Scan for digital receipt</div>
                </div>
            </div>
            
            <div class="download-section">
                <button class="download-btn" onclick="downloadReceipt()">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                <button class="download-btn secondary" onclick="printReceipt()">
                    <i class="fas fa-print"></i> Print
                </button>
                <button class="download-btn secondary" onclick="shareReceiptPDF()">
                    <i class="fab fa-whatsapp"></i> Share receipt to AcaciaLounge
                </button>
                <button class="download-btn secondary" onclick="closeReceipt()">
                    <i class="fas fa-times"></i> Close
                </button>
        </div>
    </body>
    </html>
`;
}

/**
 * Opens a new window with the generated receipt HTML
 */
function generateAndDisplayInvoice(order) {
    const receiptHTML = generateInvoiceHTML(order);
    
    // Open a new window with receipt-sized dimensions
    const win = window.open('', '_blank', 'width=450,height=700,scrollbars=yes,resizable=yes');
    
    // Write content to the new window
    win.document.write(receiptHTML);
    win.document.close();
    
    // Focus on the new window
    win.focus();
}