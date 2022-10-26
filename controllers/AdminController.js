const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Usuario = rootRequire('utilities').usuario;
const Privileges = rootRequire('structures/Privileges');
const Session = rootRequire('utilities').session;
const Menu = rootRequire('menus').Admin;

/************************************************************************/
/*                              CONTROLLERS                             */
/************************************************************************/

const ControllerAdmin = require('./admin/ControllerAdmin');
const ControllerDashboard = require('./admin/ControllerDashboard');
const ControllerJuegos = require('./admin/ControllerJuegos');
const ControllerColegios = require('./admin/ControllerColegios');
const ControllerProfesores = require('./admin/ControllerProfesores');
const ControllerGrados = require('./admin/ControllerGrados');
const ControllerAlumnos = require('./admin/ControllerAlumnos');
const ControllerAdministradores = require('./admin/ControllerAdministradores');
const ControllerSettings = require('./admin/ControllerSettings');

const MenuAdmin = rootRequire('menus').Admin;

var general = {};

module.exports = {

    mid_get: function(req, res, next) {

        Functions.InstalledSystem().then(function(exist) {
            if (!exist) res.redirect(Config.routes.install);
            else {
                //Revisar si su nivel de privilegios le permite estar aca
                if (!Session.GetPrivilege(req.session) || Session.GetPrivilege(req.session).toLowerCase() != Privileges.Administrador.key.toLowerCase()) {
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
                Usuario.setProfileMenu(MenuAdmin.profile(Usuario.getPrivilege(), Usuario.getId(), req.text)); //King villa

                general = {
                    title: Config.site.titulo,
                    slogan: Config.site.slogan,
                    url: Config.site.url,
                    email: Config.site.email_encode,
                    menu: Config.site.menu,
                    auth: Usuario.isAuth(),
                    username: Usuario.getUserName(),
                    userPicture: Usuario.getProfilePicture(),
                    profileMenu: Usuario.getProfileMenu(),
                    mainMenu: Menu.main(Usuario.privilege, req.text)
                };

                next();
            }
        });
    },

    /************************************************************************/
    /*                           Rutas del usuario                          */
    /************************************************************************/

    /*get_id_profile: function(req, res) {
        ControllerAdmin.get_profile(req, res, general);
    },

    post_id_profile: function(req, res) {
        ControllerAdmin.post_profile(req, res);
    },*/

    get_id_settings: function(req, res) {
        ControllerAdmin.get_settings(req, res, general);
    },

    post_id_settings: function(req, res) {
        ControllerAdmin.post_settings(req, res);
    },

    /************************************************************************/
    /*                        End Rutas del usuario                         */
    /************************************************************************/

    /************************************************************************/
    /*                           Opciones del menu                          */
    /************************************************************************/

    /************************************************************************/
    /*                              Dashboard                               */
    /************************************************************************/

    get_dashboard: function(req, res) {
        ControllerDashboard.get(req, res, general);
    },

    /************************************************************************/
    /*                           End Dashboard                              */
    /************************************************************************/

    /************************************************************************/
    /*                              Juegos                                  */
    /************************************************************************/

    get_juegos: function(req, res) {
        ControllerJuegos.get(req, res, general);
    },

    get_juegos_add: function(req, res) {
        ControllerJuegos.get_add(req, res, general);
    },

    post_juegos_add: function(req, res, next) {
        ControllerJuegos.post_add(req, res);
    },

    post_juegos_del: function(req, res, next) {
        ControllerJuegos.post_del(req, res);
    },

    post_juegos_block: function(req, res, next) {
        ControllerJuegos.post_block(req, res);
    },

    get_juegos_mod: function(req, res, next) {
        ControllerJuegos.get_mod(req, res, general);
    },

    post_juegos_mod: function(req, res, next) {
        ControllerJuegos.post_mod(req, res);
    },

    get_juegos_info: (req, res, next) => {
        ControllerJuegos.get_info(req, res, general);
    },

    /************************************************************************/
    /*                             End juegos                               */
    /************************************************************************/

    /************************************************************************/
    /*                               Colegios                               */
    /************************************************************************/

    get_colegios: function(req, res) {
        ControllerColegios.get(req, res, general);
    },

    get_colegios_add: function(req, res) {
        ControllerColegios.get_add(req, res, general);
    },

    post_colegios_add: function(req, res) {
        ControllerColegios.post_add(req, res);
    },

    post_colegios_del: function(req, res) {
        ControllerColegios.post_del(req, res);
    },

    post_colegios_block: function(req, res) {
        ControllerColegios.post_block(req, res);
    },

    get_colegios_mod: function(req, res) {
        ControllerColegios.get_mod(req, res, general);
    },

    post_colegios_mod: function(req, res) {
        ControllerColegios.post_mod(req, res);
    },

    get_colegios_info: function(req, res) {
        ControllerColegios.get_info(req, res, general);
    },

    /************************************************************************/
    /*                             End Colegios                             */
    /************************************************************************/

    /************************************************************************/
    /*                              Profesores                              */
    /************************************************************************/

    get_profesores: function(req, res) {
        ControllerProfesores.get(req, res, general);
    },

    get_profesores_add: function(req, res) {
        ControllerProfesores.get_add(req, res, general);
    },

    post_profesores_add: function(req, res) {
        ControllerProfesores.post_add(req, res);
    },

    post_profesores_del: function(req, res) {
        ControllerProfesores.post_del(req, res);
    },

    post_profesores_block: function(req, res) {
        ControllerProfesores.post_block(req, res);
    },

    get_profesores_mod: function(req, res) {
        ControllerProfesores.get_mod(req, res, general);
    },

    post_profesores_mod: function(req, res) {
        ControllerProfesores.post_mod(req, res);
    },

    get_profesores_info: function(req, res) {
        ControllerProfesores.get_info(req, res, general);
    },

    /************************************************************************/
    /*                            End Profesores                            */
    /************************************************************************/

    /************************************************************************/
    /*                                Grados                                */
    /************************************************************************/

    get_grados: function(req, res) {
        ControllerGrados.get(req, res, general);
    },

    get_grados_add: function(req, res) {
        ControllerGrados.get_add(req, res, general);
    },

    post_grados_add: function(req, res) {
        ControllerGrados.post_add(req, res);
    },

    post_grados_del: function(req, res) {
        ControllerGrados.post_del(req, res);
    },

    post_grados_block: function(req, res) {
        ControllerGrados.post_block(req, res);
    },

    get_grados_mod: function(req, res) {
        ControllerGrados.get_mod(req, res, general);
    },

    post_grados_mod: function(req, res) {
        ControllerGrados.post_mod(req, res);
    },

    get_grados_info: function(req, res) {
        ControllerGrados.get_info(req, res, general);
    },

    /************************************************************************/
    /*                              End Grados                              */
    /************************************************************************/

    /************************************************************************/
    /*                                Alumnos                               */
    /************************************************************************/

    get_alumnos: function(req, res) {
        ControllerAlumnos.get(req, res, general);
    },

    get_alumnos_add: function(req, res) {
        ControllerAlumnos.get_add(req, res, general);
    },

    post_alumnos_add: function(req, res) {
        ControllerAlumnos.post_add(req, res);
    },

    post_alumnos_del: function(req, res) {
        ControllerAlumnos.post_del(req, res);
    },

    post_alumnos_block: function(req, res) {
        ControllerAlumnos.post_block(req, res);
    },

    get_alumnos_mod: function(req, res) {
        ControllerAlumnos.get_mod(req, res, general);
    },

    post_alumnos_mod: function(req, res) {
        ControllerAlumnos.post_mod(req, res);
    },

    get_alumnos_info: function(req, res) {
        ControllerAlumnos.get_info(req, res, general);
    },

    /************************************************************************/
    /*                              End Alumnos                             */
    /************************************************************************/

    /************************************************************************/
    /*                           Administradores                              */
    /************************************************************************/

    get_admins: function(req, res) {
        ControllerAdministradores.get(req, res, general);
    },

    post_admin_add: function(req, res) {
        ControllerAdministradores.post_add(req, res);
    },

    post_admin_del: function(req, res) {
        ControllerAdministradores.post_del(req, res);
    },

    post_admin_block: function(req, res) {
        ControllerAdministradores.post_block(req, res);
    },

    get_admin_mod: function(req, res) {
        ControllerAdministradores.get_mod(req, res, general);
    },

    post_admin_mod: function(req, res) {
        ControllerAdministradores.post_mod(req, res);
    },

    /************************************************************************/
    /*                         End Administradores                          */
    /************************************************************************/

    /************************************************************************/
    /*                               Settings                               */
    /************************************************************************/

    get_settings: function(req, res) {
        ControllerSettings.get(req, res, general);
    },

    post_settings: function(req, res) {
        ControllerSettings.post(req, res);
    }

    /************************************************************************/
    /*                             End Settings                             */
    /************************************************************************/

    /************************************************************************/
    /*                           End Opciones                               */
    /************************************************************************/
};
