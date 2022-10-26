const Config = rootRequire('config');
const Headers = Config.api.header;
const Functions = rootRequire('functions');
const Usuario = rootRequire('utilities').usuario;
const Privileges = rootRequire('structures/Privileges');

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAlumno = rootRequire('models/Alumno');

var general = {};

module.exports = {

    mid_get: (req, res, next) => {
        next();
    },

    /**
     * Verifica que se reciban los headers esperados.
     * Usado en rutas especificas.
     */
    require_header: (req, res, next) => {
        if (req.headers[Headers.general.key] && req.headers[Headers.general.key] == Headers.general.value) {
            next()
        } else {
            return res.status(401).send({
                message: "Incorrect headers."
            }); //Unauthorized
        }
    },

    /************************************************************************/
    /*                                GAME                                  */
    /************************************************************************/

    get_info: (req, res) => {
        //let priv = Usuario.getPrivilege();

        let user = req.session.user;

        let priv = user.privilege;
        if (priv && priv.toLowerCase() == Privileges.Alumno.key.toLowerCase()) priv = "a";
        else if (priv && priv.toLowerCase() == Privileges.Profesor.key.toLowerCase()) priv = "p";
        else priv = null; //No mando nada...

        /*console.log("ControllerAPI");
        console.log("GetInfo ", new Date().toString());
        console.log("Info en el Objeto Usuario");
        console.log("--------------------------------------------------");
        console.log(Usuario);
        console.log("--------------------------------------------------");

        let user = req.session.user;
        console.log("");
        console.log("==================================================");
        console.log("==================================================");
        console.log("Info en la session directa");
        console.log(user);
        console.log("==================================================");
        console.log("==================================================");*/


        /*res.json({
            id: Usuario.getId() ? Usuario.getId() : null,
            gameId: Usuario.getGameId() ? Usuario.getGameId() : null,
            grade: Usuario.getGrado() ? Usuario.getGrado() : null,
            priv: priv ? priv : null
        });*/

        console.log("");
        console.log("==================================================");
        console.log("==================================================");
        console.log("Info en la session directa");
        console.log(user);
        console.log("==================================================");
        console.log("==================================================");

        res.json({
            id: user.id ? user.id : null,
            gameId: user.gameId ? user.gameId : null,
            grade:user.grado ? user.grado: null,
            priv: priv ? priv : null
        });
    },

    /*Obtiene las estadisticas del juego por nivel*/
    get_game_stats: (req, res) => {
        let alumnoId = Functions.DeObfuscateId(req.params.alumnoId);
        let gameId = Functions.DeObfuscateId(req.params.gameId);
        //let levelId = req.params.levelId;

        if (Functions.ValidateId(alumnoId) && Functions.ValidateId(gameId) /* && levelId*/ ) {
            ModelAlumno.GetGameStats(alumnoId, gameId /*, levelId*/ ).then(function(userGameData) {
                let gameStats = userGameData ? userGameData.stats.game_stats : null;
                gameStats = gameStats ? Functions.ObfuscateCustomIds(gameStats, "game_id", false) : null;
                res.json({
                    "stats": gameStats
                });
            });
        } else {
            res.status(400).send({
                error: "Parametros incorrectos :("
            });
        }
    },

    /*Guarda las estadisticas del usuario. segun el juego*/
    post_game_stats: (req, res) => {
        let alumnoId = Functions.DeObfuscateId(req.params.alumnoId);
        let gameId = Functions.DeObfuscateId(req.params.gameId);
        let levelId = req.params.levelId;
        let gameStats = JSON.parse(JSON.stringify(req.body));

        if (Functions.ValidateId(alumnoId) && Functions.ValidateId(gameId) && gameStats) {
            ModelAlumno.SetGameStats(alumnoId, levelId, gameId, gameStats).then(function() {
                //Ver la respuesta y enviarla...
                res.json({
                    "status": true
                });
            });
        } else {
            res.status(400).send({
                error: "Parametros incorrectos :("
            });
        }
    }
};
