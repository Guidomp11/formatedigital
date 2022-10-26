/**
 * Carga las configuraciones generales del sistema y
 * las que el usuario creo al momento de instalar.
 * Ambas son combinadas y accedidas normalmente. La ultima configuracion
 * cargada es la que se utiliza, si todas las configuraciones tienen un dato
 * "nombre":"angel caido", y el ultimo incluido tiene "nombre" : "duraznito"
 * "duraznito" va a ser el valor valido para las configuraciones.
 */
var _ = require("lodash");
var defaults = require("./default");
var merged = _.merge({}, defaults);

try {
    //Revisa si es produccion, para cargar la configuracion necesaria
    merged = _.merge(require("./" + process.env.NODE_ENV));
} catch (err) {}

try {
    //Carga la config del usuario
    merged = _.merge(require('json-config-ext').config);
} catch (err) {}

module.exports = _.merge(defaults, merged);
