const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Languages = rootRequire('structures/Language');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAdmin = rootRequire('models/Admin');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlAdministrador = "/administrador";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    get_settings: (req, res, general) => {

        let id = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(id)) {
            ModelAdmin.GetSettings(id).then(function(userSettings) {
                if (userSettings) {
                    general.administrador = {
                        settings: userSettings.settings,
                        languages: Languages.enums,
                        routes: {
                            root: UrlAdministrador + "/",
                        }
                    };
                }
            }).then(function() {
                res.render(View + 'admin-settings', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlAdministrador);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAdministrador);
        }
    },

    post_settings: (req, res) => {
        //Actualiza configuracion del usuario y/o clave
        let adminId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(adminId)) {

            let settings = {
                receive_notifications: req.body.administradorSettingsNotification == '' ? true : false,
                public_profile: req.body.administradorSettingsPrivacy == '' ? true : false,
                language: req.body.administradorSettingsLang
            };

            let currentPwd = req.body.administradorSettingsPwd;
            let newPwd = req.body.administradorSettingsNPwd;
            let newRPwd = req.body.administradorSettingsRPwd;

            return ModelAdmin.SetSettings(adminId, settings, adminId).then(() => {
                if (currentPwd != '' && newPwd != '' && newRPwd != '')
                    return ModelAdmin.ChangePassword(adminId, currentPwd, newPwd, newRPwd, adminId);
                else {
                    req.session.info = [{
                        msg: "Actualizado correctamente!"
                    }];
                    //Seteo en la session los datos nuevos. (son levantados dinamicametne en Usuario despues)
                    req.session.user.settings = settings;
                    return res.redirect(req.originalUrl);
                }
            }).then((validPassword) => {
                if (currentPwd != '' && newPwd != '' && newRPwd != '') {
                    if (!validPassword) {
                        return new Promise(function(resolve, reject) {
                            reject("Contraseña no valida.");
                        });
                    } else {
                        req.session.info = [{
                            msg: "Actualizado correctamente!"
                        }];
                        return res.redirect(req.originalUrl);
                    }
                }
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "No se puedo actualizar."
            }];
            return res.redirect(req.originalUrl);
        }
    }

}
