/*const Struct = require('struct-type');
const type = Struct.types;

const GameType = Struct('GameType', {
    Matematica: type.String,
    Fisica: type.String,
    Logica: type.String
});

//New instance
var g_instance = GameType.make({
  Matematica: "Matematica",
  Fisica: "Fisica",
  Logica: "Logica"
});

module.exports = g_instance;*/

/**
 *  privilegios para los usuarios, usados tambien en el login,
 *  para determinar donde logea o que Control usar.
 */

 const Enum = require('enum');

 const GameType = new Enum({
   'Matematica': 1,
   'Fisica' : 2,
   'Logica': 0
 });

 module.exports = GameType;
