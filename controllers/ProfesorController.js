const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Usuario = rootRequire('utilities').usuario;
const Privileges = rootRequire('structures/Privileges');
const Session = rootRequire('utilities').session;

const MenuProfesor = rootRequire('menus').Usuario;

/************************************************************************/
/*                              CONTROLLERS                             */
/************************************************************************/

const ControllerProfesor = require('./profesor/ControllerProfesor');
const ControllerGames = require('./profesor/ControllerGames');
const ControllerStats = require('./profesor/ControllerStats');

var general = {};

module.exports = {

    mid_get: function(req, res, next) {

        Functions.InstalledSystem().then(function(exist) {
            if (!exist) res.redirect(Config.routes.install);
            else {
                //Revisar si su nivel de privilegios le permite estar aca
                if (!Session.GetPrivilege(req.session) || Session.GetPrivilege(req.session).toLowerCase() != Privileges.Profesor.key.toLowerCase()) {
                    return res.render('noauth', {
                        title: Config.site.titulo,
                        slogan: Config.site.slogan,
                        url: Config.routes.root
                    });
                }

                let settings = Usuario.getSettings();
                if (settings && settings.language != null) {
                    Functions.LanguageChange(req, settings.language);
                }

                //Set menu (cambia el lenguage. cambia el menu)
                Usuario.setProfileMenu(MenuProfesor.profile(Usuario.getPrivilege(), Usuario.getId(), req.text)); //King villa

                general = {
                    title: Config.site.titulo,
                    slogan: Config.site.slogan,
                    url: Config.site.url,
                    email: Config.site.email_encode,
                    /*menu: Config.site.menu,*/
                    menu: req.text('site').menu,
                    auth: Usuario.isAuth(),
                    username: Usuario.getUserName(),
                    userPicture: Usuario.getProfilePicture(),
                    profileMenu: Usuario.getProfileMenu()
                };
                next();
            }
        });
    },

    get_index: function(req, res) {
        ControllerProfesor.get(req, res, general);
    },

    //alumno/id/profile
    get_id_profile: function(req, res) {
        ControllerProfesor.get_profile(req, res, general);
    },

    post_id_profile_general: function(req, res) {
        ControllerProfesor.post_profile_general(req, res);
    },

    post_id_profile_contact: function(req, res) {
        ControllerProfesor.post_profile_contact(req, res);
    },

    get_id_settings: function(req, res) {
        ControllerProfesor.get_settings(req, res, general);
    },

    post_id_settings: function(req, res) {
        ControllerProfesor.post_settings(req, res);
    },

    /************************************************************************/
    /*                           Opciones del menu                          */
    /************************************************************************/

    get_stats_college: function(req, res) {
        ControllerStats.get_stats_college(req, res, general);
    },

    get_stats_college_collegeId_gradoId : function(req, res) {
        ControllerStats.get_stats_college_collegeId_gradoId(req, res, general);
    },

    get_stats_alumns: function(req, res) {
        ControllerStats.get_stats_alumns(req, res, general);
    },

    get_stats_alumns_gameId_alumnId: function(req, res) {
        ControllerStats.get_stats_alumns_gameId_alumnId(req, res, general);
    },

    get_games: function(req, res) {
        ControllerGames.get(req, res, general);
    },

    get_gameid_play: function(req, res) {
        ControllerGames.get_gameid_play(req, res, general);
    }

    /************************************************************************/
    /*                        End Opciones del menu                         */
    /************************************************************************/
}
