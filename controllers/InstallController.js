const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Usuario = rootRequire('utilities').usuario;

/************************************************************************/
/*                              CONTROLLERS                             */
/************************************************************************/

const ControllerInstall = require('./install/ControllerInstall');

var general = {};

module.exports = {

    mid_get: function(req, res, next) {
        //Revistar antes si ya fue instalado el sistema. Si fue instalado, redireccionar a un succes o algo.
        Functions.InstalledSystem().then(function(exist) {
            if (exist) {
                req.session.errors = [{
                    msg: "El archivo de configuracion ya se encuentra creado. Si desea reinstalar el sitio la configuracion debe ser eliminada."
                }];
            }
            general = {
                title: Config.site.titulo,
                slogan: Config.site.slogan,
                url: Config.site.url,
                menu: Config.site.menu,
                auth: Usuario.auth,
                profileMenu: Usuario.profileMenu,
                userPicture: Usuario.profilePicture
            };
            next();
        });
    },

    get_index: function(req, res) {
        ControllerInstall.get(req, res, general);
    },

    post_index: function(req, res) {
        ControllerInstall.post(req, res);
    },

    get_success: function(req, res) {
        ControllerInstall.get_success(req, res, general);
    },

    get_fail: function(req, res) {
        ControllerInstall.get_fail(req, res, general);
    }
};
