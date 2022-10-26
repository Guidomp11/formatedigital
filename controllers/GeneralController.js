const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Usuario = rootRequire('utilities').usuario;

/************************************************************************/
/*                              CONTROLLERS                             */
/************************************************************************/

const ControllerGeneral = require('./general/ControllerGeneral');

var general = {};

module.exports = {

    mid_get: function(req, res, next) {

        //Seteo la cokie de i18n
        //rootRequire('utilities').cookie.Set(res, Config.cookies.defaultName, 'es', 1);
        //rootRequire('utilities').cookie.Get(req,Config.cookies.defaultName, true);

        Functions.InstalledSystem().then(function(exist) {
            if (!exist) res.redirect(Config.routes.install);
            else {

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

        //rootRequire('utilities').cookie.Set(res, Config.cookies.defaultName, general, 1);
        //console.log(rootRequire('utilities').cookie.Get(req,Config.cookies.defaultName, true));
    },

    get_index: function(req, res) {
        ControllerGeneral.get(req, res, general);
    },

    post_index: function(req, res) {
        ControllerGeneral.post(req, res);
    },

    get_about: function(req, res) {
        ControllerGeneral.get_about(req, res, general);
    },

    get_contact: function(req, res) {
        ControllerGeneral.get_contact(req, res, general);
    },

    get_privacy: function(req, res) {
        ControllerGeneral.get_privacy(req, res, general);
    },

    get_support: function(req, res) {
        ControllerGeneral.get_support(req, res, general);
    },

    get_tos: function(req, res) {
        ControllerGeneral.get_tos(req, res, general);
    },

    get_logout: function(req, res) {
        Usuario.Reset();
        ControllerGeneral.get_logout(req, res, general);
    }
}
