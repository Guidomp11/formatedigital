/*Distintos menus disponibles dentro de la aplicacion*/
const Usuario = require('./usuario');
const Profesor = require('./profesor');
const Admin = require('./admin');

module.exports = {
  Usuario: Usuario,
  Profesor: Profesor,
  Admin: Admin
}
