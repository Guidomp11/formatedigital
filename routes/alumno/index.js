const General = require('express').Router();
const Controller = rootRequire('controllers/AlumnoController');
const Session = rootRequire('utilities').session;

General.use(Session.IsAuth, Controller.mid_get); //Procesa los datos
General.get('/', Controller.get_index);

General.get('/:id/profile', Controller.get_id_profile); //Muestra nombre, telefono, etc
General.post('/:id/profile/general', Controller.post_id_profile_general); //Actualiza la info del alumno
General.post('/:id/profile/contact', Controller.post_id_profile_contact); //Actualiza la info del alumno

General.get('/:id/settings', Controller.get_id_settings); //Muestra las opciones que puede modificar de su perfil
General.post('/:id/settings', Controller.post_id_settings);

General.get('/:gameId/play', Controller.get_gameid_play); //Juego seleccionado a jugar

module.exports = General;
