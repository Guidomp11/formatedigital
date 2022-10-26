/**
 * Define CustomTypes para un Schema
 * Usado para poder usar las Strucutras de datos creadas como tipo requerido
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/************************************************************************/
/*                              Difficult                               */
/************************************************************************/

const structPrivileges = rootRequire('structures/Privileges');

function Privileges(key, options) {
    mongoose.SchemaType.call(this, key, options, "Privileges");
}

Privileges.prototype = Object.create(mongoose.SchemaType.prototype);

Privileges.prototype.cast = function(val) {
    var _val = structPrivileges[val];
    return _val === undefined ? -1 : _val;
}

mongoose.Schema.Types.Privileges = Privileges;

/************************************************************************/
/*                               Game Types                             */
/************************************************************************/

const structGameTypes = rootRequire('structures/GameTypes');

function GameTypes(key, options) {
    mongoose.SchemaType.call(this, key, options, "GameTypes");
}

GameTypes.prototype = Object.create(mongoose.SchemaType.prototype);

GameTypes.prototype.cast = function(val) {
    //return val ? structGameTypes.get(val).key : "";
    return structGameTypes.get(val) !== undefined ? structGameTypes.get(val).key : "";
}

mongoose.Schema.Types.GameTypes = GameTypes;

/************************************************************************/
/*                              Difficult                               */
/************************************************************************/

const structDifficult = rootRequire('structures/Difficult');

function Difficult(key, options) {
    mongoose.SchemaType.call(this, key, options, "Difficult");
}

Difficult.prototype = Object.create(mongoose.SchemaType.prototype);

Difficult.prototype.cast = function(val) {
    var _val = structDifficult[val];
    return _val === undefined ? -1 : _val;
}

mongoose.Schema.Types.Difficult = Difficult;
