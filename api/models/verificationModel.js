// In-memory store for verification codes
// In production, consider using Redis or database
const verificationCodes = {};

/**
 * Store a verification code for a phone number
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 */
const storeCode = (phone, code) => {
    // Store code with 10-minute expiration
    verificationCodes[phone] = {
        code: code.toString(),
        expiresAt: Date.now() + 10 * 60 * 1000
    };
};

/**
 * Retrieve and validate a verification code for a phone number
 * @param {string} phone - Phone number
 * @returns {string|null} - Verification code if valid, null otherwise
 */
const getCode = (phone) => {
    const entry = verificationCodes[phone];
    
    if (!entry) {
        return null;
    }
    
    // Check if code has expired
    if (Date.now() > entry.expiresAt) {
        delete verificationCodes[phone];
        return null;
    }
    
    return entry.code;
};

/**
 * Delete a verification code (called after successful verification)
 * @param {string} phone - Phone number
 */
const deleteCode = (phone) => {
    delete verificationCodes[phone];
};

module.exports = { storeCode, getCode, deleteCode };
