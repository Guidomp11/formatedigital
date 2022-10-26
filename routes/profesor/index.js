const General = require('express').Router();
const Controller = rootRequire('controllers/ProfesorController');
const Session = rootRequire('utilities').session;

General.use(Session.IsAuth, Controller.mid_get); //Procesa los datos
General.get('/', Controller.get_index);

General.get('/:id/profile', Controller.get_id_profile); //Muestra nombre, telefono, etc
General.post('/:id/profile/general', Controller.post_id_profile_general); //Actualiza la info del profesor
General.post('/:id/profile/contact', Controller.post_id_profile_contact); //Actualiza la info del profesor

General.get('/:id/settings', Controller.get_id_settings); //Muestra las opciones que puede modificar de su perfil
General.post('/:id/settings', Controller.post_id_settings);

//Options availables

General.get('/stats/college', Controller.get_stats_college);
General.get('/stats/college/:collegeId/:gradoId/:gameId', Controller.get_stats_college_collegeId_gradoId);

General.get('/stats/alumns', Controller.get_stats_alumns);
General.get('/stats/alumns/:gameId/:alumnoId', Controller.get_stats_alumns_gameId_alumnId);

General.get('/games', Controller.get_games);
General.get('/games/:gameId/play/:grado', Controller.get_gameid_play); //Juego seleccionado a jugar

module.exports = General;
