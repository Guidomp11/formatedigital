const Singleton = require('./Singleton');
const moment = require('moment');

/**
 * @author Nicolas Perez
 * Administra el uso de cookies dentro de la aplicacion
 * Permite crear, destrurir y obtener cookies usando el modulo cookie-parser
 * TODO Ver de permitir setear la expiracion, si se desea que sea httpOnly, secure o signed
 */
class Cookie extends Singleton {
    
    constructor(){
        super();
    }
    
    /**
     * Limpia la cookie solicitada
     * @param name Nombre de la cookie a limpiar
     */
    Clear(name){
        clearCookie(name);
    }
    
    /**
     * Solicita la cookie al request
     * @param req Request
     * @param name Nombre de la cookie a solicitar
     * @param isSigned La cookie a buscar esta firmada
     * @return Dato de la cookie
     */
    Get(req,name,isSigned){
        if (req != null && name != null) {
            return isSigned ? req.signedCookies[name] : req.cookies[name];
        }
    }
    
    /**
     * Crea una cookie
     * @param res Response donde enviar la cookie
     * @param name Nombre a darle a la cookie para referencia
     * @param values Valores que va a guardar la cookie
     * @param expiresDays Tiempo de vida de la cooke (30 days default)
     */
    Set(res, name, values, expiresDays/* = 30*/) {
        if (res != null && name != null) {
            res.cookie(name, values, {
                expires: moment().add(expiresDays, 'days').toDate(),
                httpOnly: true, // The cookie only accessible by the web server
                secure: false, //TODO SET TRUE WHEN I HAVE AN HTTPS SERVER
                signed: true // Indicates if the cookie should be signed (req.signedCookies)
            }).status(200); //.send();
            //}).send();
        }
    }
}

module.exports = Cookie.GetInstance;