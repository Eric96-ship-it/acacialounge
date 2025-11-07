// M-Pesa Payment Integration
// This file handles M-Pesa STK Push payments

const MPESA_CONFIG = {
    // In production, these should be set in your server environment
    businessShortCode: '174379', // Lipa Na M-Pesa Shortcode
    passkey: 'YOUR_MPESA_PASSKEY', // Your M-Pesa passkey
    consumerKey: 'YOUR_CONSUMER_KEY', // Your app consumer key
    consumerSecret: 'YOUR_CONSUMER_SECRET', // Your app consumer secret
    callbackURL: 'https://yourdomain.com/callback', // Your callback URL
};

// Generate M-Pesa password
function generateMpesaPassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(MPESA_CONFIG.businessShortCode + MPESA_CONFIG.passkey + timestamp).toString('base64');
    return { password, timestamp };
}

// Get M-Pesa access token
async function getMpesaAccessToken() {
    try {
        const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
        
        const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get access token');
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting M-Pesa access token:', error);
        throw error;
    }
}

// Process M-Pesa STK Push payment
async function processMpesaPayment(phoneNumber, amount, description) {
    try {
        // For demo purposes - in production, this should call your server
        // Here we'll simulate the API call
        
        console.log('Initiating M-Pesa payment:', {
            phoneNumber: formatPhoneForMpesa(phoneNumber),
            amount,
            description
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, you would:
        // 1. Get access token
        // 2. Initiate STK push
        // 3. Handle the callback
        
        // For demo, we'll return a success response
        // In production, you should implement proper error handling and actual API calls
        
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
            return {
                success: true,
                message: 'STK push initiated successfully. Check your phone to complete payment.',
                transactionId: 'MPE_' + Date.now()
            };
        } else {
            return {
                success: false,
                message: 'Failed to initiate payment. Please try again.'
            };
        }
        
    } catch (error) {
        console.error('M-Pesa payment error:', error);
        return {
            success: false,
            message: 'Payment processing error. Please try again later.'
        };
    }
}

// Format phone number for M-Pesa (254 format)
function formatPhoneForMpesa(phone) {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
        cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1);
    }
    
    return cleaned;
}

// Verify M-Pesa transaction (for manual code entry)
async function verifyMpesaTransaction(transactionCode, phoneNumber) {
    try {
        // This would typically verify with your server/database
        // For demo, we'll simulate verification
        
        console.log('Verifying M-Pesa transaction:', {
            transactionCode,
            phoneNumber: formatPhoneForMpesa(phoneNumber)
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const isValid = transactionCode.match(/^[A-Z0-9]{10}$/) !== null;
        
        return {
            success: isValid,
            message: isValid ? 'Transaction verified successfully' : 'Invalid transaction code',
            transactionData: isValid ? {
                amount: 0, // Would be actual amount from verification
                date: new Date().toISOString(),
                phoneNumber: formatPhoneForMpesa(phoneNumber)
            } : null
        };
        
    } catch (error) {
        console.error('Transaction verification error:', error);
        return {
            success: false,
            message: 'Verification failed. Please try again.'
        };
    }
}

// Check payment status (for pending payments)
async function checkPaymentStatus(transactionId) {
    try {
        // This would check with M-Pesa API or your server
        console.log('Checking payment status for:', transactionId);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate status check
        const statuses = ['completed', 'pending', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
            success: randomStatus === 'completed',
            status: randomStatus,
            message: `Payment ${randomStatus}`
        };
        
    } catch (error) {
        console.error('Payment status check error:', error);
        return {
            success: false,
            status: 'unknown',
            message: 'Status check failed'
        };
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processMpesaPayment,
        verifyMpesaTransaction,
        checkPaymentStatus,
        formatPhoneForMpesa
    };
}