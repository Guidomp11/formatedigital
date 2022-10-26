const API = require('express').Router();
const Controller = rootRequire('controllers/API/v1/ControllerAPI');
const Session = rootRequire('utilities').session;
//const CORS = require('cors');

/************************************************************************/
/*                                PATHS                                 */
/************************************************************************/

const UrlAlumno = "/alumno";
const UrlProfesor = "/profesor";
const UrlAdmin = "/admin";
const UrlGames = "/game";

/************************************************************************/
/*                               General                                */
/************************************************************************/

//API.use(CORS()); //Habilitado CORS para test fuera de la plataforma. bloquearlo despues
API.use(Session.IsAuthAPI, Controller.mid_get); //Procesa los datos, valida headers. etc

API.get('/', function(req, res, next) {
    res.send('API v1');
});

API.get('/version', function(req, res, next) {
    res.send('Version de la API: 1');
});

/************************************************************************/
/*                               Alumno                                 */
/************************************************************************/

/**
* Obtiene la informacion basica para poder operar con la API
* Retorna GameId y UserId
*/
//API.get(UrlAlumno + "/getLoggedInfo", Controller.get_info); //LLamada en el cliente con AJAX
API.get("/getLoggedInfo", Controller.get_info); //LLamada en el cliente con AJAX

/**
 * Obtiene las estadisticas del alumno, por nivel
 * @param alumnoId Id del alumno a solicitar la informacion
 * @param gameId Juego del alumno a solicitar
 * @param levelId Id del nivel para las estadisticas correspondientes
 */
API.post(UrlAlumno + "/:alumnoId/:gameId/stats", Controller.require_header, Controller.get_game_stats);

/**
 * Actualiza las estadisticas de un juego
 * Todos los IDs recibidos deben venir ofuscados. tal cual como son enviados (Es necesario?)
 * @param alumnoId Id del alumno a actualizar la infromacion
 * @param gameId Id del juego que el alumno jugo para actualizar
 * @param levelId Level del juego a actualizar las estadisticas
 * @param gameStats Estadisticas del juego a actualizar del nivel (Ver Schema del Alumno para referencias)
 */
API.post(UrlAlumno + "/:alumnoId/:gameId/stats/:levelId", Controller.require_header, Controller.post_game_stats);

/************************************************************************/
/*                              Profesor                                */
/************************************************************************/


/************************************************************************/
/*                                Admin                                 */
/************************************************************************/


/************************************************************************/
/*                                Games                                 */
/************************************************************************/

module.exports = API;
