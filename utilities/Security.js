const config = rootRequire('config');
const Singleton = require('./Singleton');

const Crypto = require('crypto');
const CryptoConfig = config.security.crypto;


class Security extends Singleton {
    constructor() {
        super();
    }

    CryptoEncrypt(text) {
        try {
            let cipher = Crypto.createCipher(CryptoConfig.algorithm, CryptoConfig.password);
            let crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        } catch (e) {
            return "";
        }
    }

    CryptoDecrypt(text) {
        try {
            let decipher = Crypto.createDecipher(CryptoConfig.algorithm, CryptoConfig.password);
            let dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        } catch (e) {
            return "";
        }
    }
}

module.exports = Security.GetInstance;
