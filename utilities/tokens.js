/**
 * @author Nicolas Perez
 * Administra el uso de tokens con el modulo jsonwebtoken de jwt
 * TODO En el futuro ver de hacer la creacion mas dinamica, como setear el algorithm
 * A la hora de crear, tambien poder setear el periodo de vida (dias, meses, horas, etc)
 */

const config = rootRequire('config');
const moment = require('moment');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

/**
 * Verifica un token
 * Comprueba que no este expirado, que cumplia con la standarizacion de JWT
 * @param token El token que se va a verificar
 */
const Verify = function(token) {
    jwt.verify(token, config.session.jwtSecret, function(err, decoded) {
        if (err) {
            if (err.name == "TokenExpiredError") {
                return res.status(401).send({
                    message: "Session expired"
                });
            } else {
                return res.status(403).send({
                    message: "Failed to authenticate"
                });
            }
        } else {
            return res.status(200);
            //req.decoded = decoded; //Accesible globalmente en cada object request.
            //next(); //Tengo un rico token listo para usar
        }
    });
}

/**
 * Genera un token valido para el usuario
 * Alamacenar donde mas se quiera (DB, Cookie, etc)
 * Este token otorga acceso a un usuario, cada vez que lo requiera
 * @param userId Id del usuario para generar el token
 */
const Generate = function(userId) {
    return jwt.sign({
        userId,
        algorithm: 'RS512',
        iat: moment().unix(),
        expiresIn: moment().add(7, "days").unix()
    }, config.session.jwtSecret);
}

module.exports = {
    Generate: Generate,
    Verify: Verify
}
