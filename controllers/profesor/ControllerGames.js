const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');
const Usuario = rootRequire('utilities').usuario;
const Languages = rootRequire('structures/Language');

const View = rootPath() + 'views/profesor/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelProfesor = rootRequire('models/Profesor');
const ModelAlumno = rootRequire('models/Alumno');
const ModelColegio = rootRequire('models/Colegio');
const ModelGrado = rootRequire('models/Grado');
const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlProfesor = "/profesor/games";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    get: (req, res, general) => {
        //res.render(View + 'games', general);
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        //Obtengo los juegos disponibles segun el colegio
        let profesorId = Functions.DeObfuscateId(Usuario.getId());
        general.profesor = {};
        //Preciso el Id del colegio al que pertenece el profesor
        ModelProfesor.GetColegio(profesorId).then(function(colegio) {
            //Solicito los juegos del colegio;
            if (colegio && colegio.colegios && colegio.colegios.length > 0) /*return ModelColegio.GetGames(colegio.colegioId);*/
              return ModelColegio.GetGamesByIds(colegio.colegios.map((colegio) => {
                return colegio.active ? colegio.colegioId : null;
              }));
        }).then(function(gamesId) {
            //Solicito los datos de los juegos del colegio
            if (gamesId) {
                /*return ModelGames.GetGames(gamesId.juegos.map((obj) => {
                    return obj.active ? obj.juegoId : null
                }));*/

                let games = [];
                gamesId.map((game) => {
                  game.juegos.map((juego) => {
                    if(juego.active) games.push(juego.juegoId);
                  });
                });
                return ModelGames.GetGames(games);
            }
        }).then(function(games) {
            if (games) {
                games = JSON.parse(JSON.stringify(games));
                //Reviso si tiene thumbnails validos cada juego, y retorno la modificacion del array
                let noThumbnail = Config.public.img + "/" + Config.games.thumbnail_path;
                games = Functions.ObfuscateIds(games, false);
                return Promise.map(games, function(g) {
                    let thumbnail = g.path_root + "/" + Config.games.thumbnail_path;
                    return File.FileOrFolderExists(thumbnail).then(function(exist) {
                        g.thumbnail = exist ? "/" + (thumbnail).replace(/\\/g, "/") : noThumbnail;
                        g.url = UrlProfesor + "/" + g.id + "/play/"; //Para poder pasar por una ruta de filtrado, y no ir directo al juego
                        return g;
                    });
                });
            }
        }).then(function(games) {
            general.profesor.games = games ? Functions.ObfuscateIds(games, false) : null;
            return ModelProfesor.GetGrados(profesorId);
        }).then(function(profesorGrados) {
          if(profesorGrados && profesorGrados.grados.length > 0){
            return ModelGrado.GetGrados(profesorGrados.grados.map((grado) => {
                return grado.gradoId;
            }));
          }
        }).then(function(grados) {
            general.profesor.grados = grados || []; //listado de los grados que tiene el profesor (usar division a la hora de seleccionar el juego)
            res.render(View + 'games', general);
            delete res.locals.errors;
            delete res.locals.info;
        }).catch(function(errors) {
            console.log("Errors...", errors);
        });
    },

    get_gameid_play: (req, res, general) => {
        let gameId = Functions.DeObfuscateId(req.params.gameId);
        let grado = req.params.grado && Number(req.params.grado) ? req.params.grado : 1;
        if (Functions.ValidateId(gameId)) {
            //Aca se pasan los datos que el juego precisa para comunicarse con la API.
            ModelGames.GetInfo(gameId).then(function(game) {
                let gamePath = ("/" + game.path_root).replace(/\\/g, "/"); //Sanitizo la direccion
                Usuario.setGameId(req.params.gameId);
                //Usuario.setGrado(grado); //Es pisado asi que no sirve.
                req.session.user.grado = grado; //Es levantado en Session
                res.redirect(gamePath);
            });
        } else {
            res.redirect(UrlProfesor);
        }
    }

};
