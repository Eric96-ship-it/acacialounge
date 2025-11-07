// Airtel Money Payment Integration
// This file handles Airtel Money payments

const AIRTEL_CONFIG = {
    // NOTE: These are PLACEHOLDERS and MUST be configured on a secure server.
    // Airtel payments cannot be processed securely from the client-side (browser).
    businessShortCode: 'YOUR_AIRTEL_BUSINESS_CODE',
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'https://yourdomain.com/airtel-callback',
    // Hardcoded number for manual pay instructions
    manualPayNumber: '0721555163', 
};

// Helper function to format phone number to Airtel API standard (2547XXXXXXXX)
function formatPhoneForAirtel(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
        cleaned = '254' + cleaned;
    }
    return cleaned.startsWith('254') ? cleaned : null;
}

// Process Airtel Money payment (Simulated API call for STK Push)
async function processAirtelPayment(phoneNumber, amount, invoiceNumber) {
    try {
        if (!phoneNumber) {
            throw new Error("Phone number is required for Airtel payment.");
        }

        // --- SIMULATION START ---
        console.log('Initiating Airtel Money payment (SIMULATED):', {
            phoneNumber: formatPhoneForAirtel(phoneNumber),
            amount,
            invoiceNumber
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
            // In a real API, this would return a transaction reference
            return {
                success: true,
                message: 'Airtel Money payment initiated successfully. Check your phone to complete payment.',
                transactionId: 'AIR' + Math.random().toString(36).substring(2, 12).toUpperCase(),
            };
        } else {
            return {
                success: false,
                message: 'Airtel Money initiation failed. Please check your phone number and try again.'
            };
        }
        // --- SIMULATION END ---

    } catch (error) {
        console.error('Airtel payment initiation error:', error);
        return {
            success: false,
            message: error.message || 'Airtel payment failed. Please try again.'
        };
    }
}

// Verify Airtel Transaction Code/Reference (Called in Step 2)
async function verifyAirtelTransaction(transactionCode, amount, invoiceNumber) {
    try {
        // In a real system, this calls your server to check the code against the gateway.
        console.log('Verifying Airtel Transaction Code (SIMULATED):', { transactionCode, amount, invoiceNumber });

        // Simulate successful verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const codeIsCorrect = transactionCode && transactionCode.length >= 8; // Simple check for demo
        
        if (codeIsCorrect) {
            return {
                success: true,
                message: 'Airtel Transaction verified successfully! Order is complete.',
                transactionDetails: {
                    code: transactionCode,
                    amount: amount,
                    invoice: invoiceNumber,
                    date: new Date().toISOString(),
                }
            };
        } else {
            return {
                success: false,
                message: 'Invalid Airtel Transaction Code. Please re-check the code and try again.'
            };
        }
        
    } catch (error) {
        console.error('Airtel transaction verification error:', error);
        return {
            success: false,
            message: 'Airtel verification failed. Please try again.'
        };
    }
}

// Export functions (if needed in a modular environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processAirtelPayment,
        verifyAirtelTransaction,
        formatPhoneForAirtel
    };
}