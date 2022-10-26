/**
 *  privilegios para los usuarios, usados tambien en el login,
 *  para determinar donde logea o que Control usar.
 */

 const Enum = require('enum');

 const Privileges = new Enum({
   'Alumno': 1,
   'Profesor' : 2,
   'Administrador': 0
 });

 module.exports = Privileges;
