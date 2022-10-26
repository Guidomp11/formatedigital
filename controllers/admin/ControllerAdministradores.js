const Config = rootRequire('config');
const Usuario = rootRequire('utilities').usuario;
const Functions = rootRequire('functions');
const jQuery = require('cheerio');
const Promise = require('bluebird');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAdmin = rootRequire('models/Admin');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlAdmins = "/administrador/admins";

/************************************************************************/
/*                                ACTIONS                              */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

/************************************************************************/
/*                                 FORMS                                */
/************************************************************************/

const FormNewAdmin = rootRequire('forms/adminNew');
const FormEditAdmin = rootRequire('forms/adminEdit');

module.exports = {

    /**
     * Muestra el listado de administradores disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        return ModelAdmin.List().then(function(administradores) {
            general.administradores = {
                list: administradores ? Functions.ObfuscateIds(administradores, false) : null,
                formNew: FormNewAdmin.form,
                routes: {
                    root: UrlAdmins + "/",
                    add: UrlAdmins + ActionAdd,
                    del: UrlAdmins + ActionDel,
                    mod: "/"+ActionMod,
                    block: UrlAdmins + ActionBlock
                },
            };

            res.render(View + 'administrators', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    post_add: (req, res) => {

        FormNewAdmin.validate(req).then(function() {
            let user = req.body.adminuser;
            let pwd = req.body.adminpwd;
            let mail = req.body.adminmail;
            let myId = Functions.DeObfuscateId(Usuario.getId());

            return ModelAdmin.New(user, pwd, mail, myId);
        }).then(function(duplicado) {
            if (duplicado) {
                return new Promise(function(resolve, reject) {
                    reject('El Administrador ya se encuentra cargado.');
                });
            } else {
                req.session.info = [{
                    msg: "Creado correctamente!"
                }];
                return res.redirect(UrlAdmins);
            }
        }).catch((errors) => {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(UrlAdmins);
        });
    },

    post_del: (req, res) => {
        //Alimina un administrador
        let adminToDelete = Functions.DeObfuscateId(req.body.adminId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelAdmin.Delete(adminToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlAdmins);
        });
    },

    post_block: (req, res) => {
        //Bloquea o desbloquea un administrador
        let adminToBlock = Functions.DeObfuscateId(req.body.adminId);
        let active = (req.body.adminActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelAdmin.Block(adminToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlAdmins);
        });
    },

    get_mod: (req, res, general) => {

        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        ModelAdmin.GetInfo(Functions.DeObfuscateId(req.params.id)).then(function(admin) {
            if (admin) {
                var $ = jQuery.load(FormEditAdmin.form);

                $("#register-admin-input-user").attr('readonly', true);
                $("#register-admin-input-user").val(admin.usuario);
                $("#register-admin-input-email").val(admin.email);
                $("#register-admin-input-current-password").val("");
                $("#register-admin-input-new-password").val("");

                general.error_message = res.locals.errorMod;
                general.info_message = res.locals.infoMod;

                general.administradores = {
                    usuario: admin.usuario,
                    formEdit: $.html(),
                    routes: {
                        root: UrlAdmins + "/"
                    }
                }

                res.render(View + 'administrators-edit', general);

                delete res.locals.errorMod;
                delete res.locals.infoMod;
            } else {
                return new Promise(function(resolve, reject) {
                    reject();
                });
            }
        }).catch((e) => {
            req.session.errors = [{
                msg: `No se encontro un administrador con el id: ${Functions.DeObfuscateId(req.params.id)}`
            }];
            return res.redirect(UrlAdmins);
        });
    },

    post_mod: (req, res) => {

        FormEditAdmin.validate(req).then(function() {

            let user = req.body.adminuser;
            let pwd = req.body.adminpwd;
            let mail = req.body.adminmail;
            let npwd = req.body.adminnewpwd;
            let myId = Functions.DeObfuscateId(Usuario.getId());

            return ModelAdmin.UpdateInfo(Functions.DeObfuscateId(req.params.id), pwd, mail, npwd, myId);

        }).then(function(validPassword) {
          if(!validPassword){
            return new Promise(function(resolve, reject) {
                reject("Datos invalidos");
            });
          }else{
            req.session.info = [{
                msg: "Usuario modificado correctamente!"
            }];
            return res.redirect(UrlAdmins);
          }
        }).catch((errors) => {
            req.session.errorMod = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    }

}
