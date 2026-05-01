const verificationCodes = {};

const storeCode = (phone, code) => {
    verificationCodes[phone] = code;
};

const getCode = (phone) => {
    return verificationCodes[phone];
};

module.exports = { storeCode, getCode };
