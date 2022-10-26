const General = require('express').Router();
const Controller = rootRequire('controllers/GeneralController');
const Session = rootRequire('utilities').session;
const Config = rootRequire('config');

//General.use(Controller.mid_get); //Procesa los datos
General.get('/', Session.IsLogged, Controller.mid_get, Controller.get_index);
General.post('/', Session.IsLogged, Controller.mid_get, Controller.post_index); //Formulario de contacto del landpage
General.get('/about', Session.IsLogged, Controller.mid_get, Controller.get_about);
General.get('/contact', Session.IsLogged, Controller.mid_get, Controller.get_contact);
General.get('/privacy', Session.IsLogged, Controller.mid_get, Controller.get_privacy);
General.get('/support', Session.IsLogged, Controller.mid_get, Controller.get_support);
General.get('/termsofuse', Session.IsLogged, Controller.mid_get, Controller.get_tos);
General.get('/logout', Controller.mid_get, Controller.get_logout);

module.exports = General;
