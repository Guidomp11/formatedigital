/**
 * Funciones de ayuda para el sitio, externas e independientes (lo mas posible)
 * Son funciones las cuales se usan en varios sectores, de manera repetida.
 */

const Config = rootRequire('config');
const File = rootRequire('utilities').file;
const Security = rootRequire('utilities/Security');
const Session = rootRequire('utilities').session;
const NodeMailer = require('nodemailer');

module.exports = {

    /************************************************************************/
    /*                             Installed                                */
    /************************************************************************/

    /**
     * Verifica que exista el archivo de config del site, sin eso no puede utilizarse
     */
    InstalledSystem() {
        return File.FileOrFolderExists(Config.settings.path + Config.settings.name);
    },

    /************************************************************************/
    /*                             Obfuscate                                */
    /************************************************************************/

    /**
     * Desencripta el ID obfuscado
     * @param obfuscatedId Id obfuscado a desencriptar
     */
    DeObfuscateId(obfuscatedId) {
        return Security.CryptoDecrypt(obfuscatedId ? obfuscatedId : "");
    },

    /**
     * Encripta el ID
     * @param idToObfuscate Id a ofuscar
     */
    ObfuscateId(idToObfuscate) {
        return Security.CryptoEncrypt(idToObfuscate ? idToObfuscate : "");
    },

    /**
     * Procesa una lista de objetos de mongoose, filtrando por activos solamente
     * Y encripta el ID de cada objeto para protegerlo de miradas externas
     * @param list Resultado de una query la cual se quiere ofuscar
     * @param removeActives Sacar los elementos inactivos de la lista
     */
    ObfuscateIds(list, removeActives = true) {
        /*list = JSON.parse(JSON.stringify(list));
        list.forEach(function(obj, index) {
            if (removeActives && obj.active == false) {
                list.splice(index, 1); //Saco el elemento 'no activo' de la lista
            }
            obj.id = Security.CryptoEncrypt(obj._id.toString());
        });
        return list;*/
        list = JSON.parse(JSON.stringify(list));
        list.map(function(obj, index) {
            obj.id = Security.CryptoEncrypt(obj._id.toString());
            if (removeActives && obj.active == false) {
                delete list[index];
                //list.splice(index, 1); //Saco el elemento 'no activo' de la lista
            } else {
                //obj.id = Security.CryptoEncrypt(obj._id.toString());
            }
        });
        return list.filter((n) => {
            return n != undefined
        });
    },

    /**
     * Procesa una lista de objetos de mongoose, filtrando por activos solamente
     * Y encripta el ID seleccionado de cada objeto para protegerlo de miradas externas
     * @param list Resultado de una query la cual se quiere ofuscar
     * @param idKey Custom id a remover. ej: game_id
     * @param removeActives Sacar los elementos inactivos de la lista
     */
    ObfuscateCustomIds(list, idKey, removeActives = true) {
        list = JSON.parse(JSON.stringify(list));
        list.forEach(function(obj, index) {
            if (removeActives && obj.active == false) {
                list.splice(index, 1); //Saco el elemento 'no activo' de la lista
            }
            if (obj[idKey]) {
                obj[idKey] = Security.CryptoEncrypt(obj[idKey].toString());
            }
            //obj.id = obj[idKey] ? Security.CryptoEncrypt(obj[idKey].toString()) : null;
        });
        return list;
    },

    /************************************************************************/
    /*                             Validators                               */
    /************************************************************************/

    /**
     * Verifica que el Id tenga un formato valido. Para evitar CastError
     */
    ValidateId(id) {
        return id.match(/^[0-9a-fA-F]{24}$/);
    },

    /************************************************************************/
    /*                              Helpers                                 */
    /************************************************************************/

    /**
     * Reemplaza todos los valores vacios o nullos del objeto por uno personalizado
     * @param list Objeto a las cuales se les va a cambiar las propiedades vacias
     * @param customValue Valor a darle a las propiedades vacias/nulas
     */
    ReplaceEmptyValueWithCustom(list, customValue) {
        list = JSON.stringify(list);
        list = list.replace(/\"\"/g, "\"" + customValue + "\"");
        list = JSON.parse(list);
        return list;
    },

    /************************************************************************/
    /*                              Language                                */
    /************************************************************************/

    /**
     * Setea el lenguage a utilizar
     * @param req Request realizado
     * @param newLang Idioma a setear, ej: 'es', 'en', etc
     */
    LanguageChange(req, newLang) {
        req.setLocale(newLang);
    },

    /**
     * Obtiene el lenguage actual
     * @param req Request realizado
     */
    LanguageCurrent(req) {
        return req.getLocale();
    },

    /************************************************************************/
    /*                                Email                                 */
    /************************************************************************/

    //Envia el mail para contacto
    /**
     * Envia el mail para solicitar mas informacion en el forumlario de contacto
     * name Nombre del que solicita
     * from Email del que solicita
     * cb Respuesta del envio de mails (error,info)
     */
    SendEmailContact(name, from, cb) {
        // create reusable transporter object using the default SMTP transport
        let transporter = NodeMailer.createTransport({
            host: 'smtp.webfaction.com',
            port: 465,
            secure: true, // secure:true for port 465, secure:false for port 587
            auth: {
                user: 'formatedigital_mail',
                pass: 'Formate16'
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: `"Formate Digital" <${Config.site.email}>`, //'"Formate Digital" <foo@blurdybloop.com>', // sender address
            to: Config.site.email + ", " + Config.developer.mail, // list of receivers
            subject: 'Solicitud de informacion - Formate Digital', // Subject line
            text: `Hola soy: ${name} y me gustaria recibir mas informacion sobre la plataforma, mi email es: ${from}`, // plain text body
        };
        // send mail with defined transport object
        return transporter.sendMail(mailOptions, (error, info) => {
            cb(error, info);
        });
    }
}
