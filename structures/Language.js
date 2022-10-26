/**
 *  Lenguages disponibles para la plataforma, usado para custom profiles
 *  para determinar donde logea o que Control usar.
 */

 const Enum = require('enum');

 const Languages = new Enum({
   'Español': 'es',
   'Ingles' : 'en',
   'Italiano': 'it'
 });

 module.exports = Languages;
