const General = require('express').Router();
const Controller = rootRequire('controllers/AccountController');
const Session = rootRequire('utilities').session;

//General.use(Session.IsLogged); //Verifica si esta logeado, redirecciona
//General.use(Controller.mid_get); //Procesa los datos

/*General.get('/forgot', Controller.mid_get, Session.IsLogged, Controller.get_forgot);
General.post('/forgot', Controller.post_forgot);*/

General.get('/login', Controller.mid_get, Session.IsLogged, Controller.get_login);
General.post('/login', Controller.post_login);

/*General.get('/register', Controller.mid_get, Session.IsLogged, Controller.get_register);
General.post('/register', Controller.post_register);*/

module.exports = General;
