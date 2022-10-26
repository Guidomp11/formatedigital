const Config = rootRequire('config');
const Usuario = rootRequire('utilities').usuario;
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelColegios = rootRequire('models/Colegio');
const ModelProfesores = rootRequire('models/Profesor');
const ModelGrados = rootRequire('models/Grado');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlProfesores = "/administrador/profesores";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    /**
     * Muestra el listado de profesores disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        return ModelProfesores.List().then(function(profesores) {
            general.profesores = {
                list: profesores ? Functions.ObfuscateIds(profesores, false) : null,
                routes: {
                    root: UrlProfesores + "/",
                    add: UrlProfesores + ActionAdd,
                    del: UrlProfesores + ActionDel,
                    mod: "/" + ActionMod,
                    block: UrlProfesores + ActionBlock
                },
            };

            res.render(View + 'profesores-list', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Muestra el formulario de carga para un profesor
     * Solicita informacion a la base de datos necesarios para el formulario
     * @param general Objeto con datos importantes para el sitio
     */
    get_add: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        general.profesores = {
            routes: {
                add: UrlProfesores + ActionAdd,
                root: UrlProfesores
            },
            lists: {} //Cargar con listados de las queries
        }

        /* Solicito informacion para las listas */
        return ModelColegios.List().then(function(colegios) {
            general.profesores.lists.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
            return ModelGrados.List();
        }).then(function(grados) {
            general.profesores.lists.grados = grados ? Functions.ObfuscateIds(grados) : null;
            res.render(View + 'profesores-add', general);
            delete res.locals.errors;
            delete res.locals.info;
        }).catch((errors) => {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    },

    /**
     * Carga el profesor segun el formulario en add
     */
    post_add: (req, res) => {
        let usuario = req.body.profesorUser;
        let password = req.body.profesorPwd;
        let rPassword = req.body.profesorRPwd;

        if (password != rPassword) {
            req.session.errors = [{
                msg: "Las claves no coinciden!"
            }];
            return res.redirect(req.originalUrl);
        } else {

            let pictureBase64 = req.body.profesorPictureResult; //base64
            let picture = "";
            let pictureName = "";
            let myId = Functions.DeObfuscateId(Usuario.getId());
            //let colegioId = Functions.DeObfuscateId(req.body.colegioId);
            let contacto = null;
            let colegiosId = [];
            let gradosId = [];

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.profesores.root + usuario + Config.profesores.upload_format).replace(/ /g, '');
                    return File.FileOrFolderExists(pictureName).then(function(duplicated) {
                        if (!duplicated) {
                            pictureBase64 = pictureBase64.replace(/^data:image\/png;base64,/, "");
                            pictureBase64 += pictureBase64.replace('+', ' ');
                            let binaryPicture = new Buffer(pictureBase64, 'base64').toString('binary');
                            return File.CreateFile(pictureName, binaryPicture, 'binary');
                        }
                    }).then(function() {
                        resolve();
                    });
                } else {
                    //Ver que hago... next?
                    resolve();
                }
            }).then(function(data) {
                contacto = {
                    nombre: req.body.profesorContactoNombre,
                    apellido: req.body.profesorContactoApellido,
                    email: req.body.profesorContactoEmail,
                    /*Date?*/
                    birth: req.body.profesorContactoBirth,
                    phone: {
                        p_number: req.body.profesorContactoTelefono
                    },
                    fax: {
                        f_number: req.body.profesorContactoFax
                    },
                    social: {
                        facebook: req.body.profesorContactoSocialFb,
                        twitter: req.body.profesorContactoSocialTw,
                        skype: req.body.profesorContactoSocialSk
                    }
                }

                var gradosLength = Array.isArray(req.body.gradosId) ? req.body.gradosId.length : req.body.gradosId; //Total de grados a iterar.
                gradosLength = gradosLength === undefined ? 0 : gradosLength;

                if (gradosLength > 0) {
                    for (var i = 0; i < gradosLength; i++) {;
                        gradosId.push({
                            gradoId: Functions.DeObfuscateId(req.body.gradosId[i])
                        });
                    }
                } else if (req.body.gradosId !== undefined) {
                    gradosId.push({
                        gradoId: Functions.DeObfuscateId(req.body.gradosId)
                    });
                }

                //Colegios
                var colegiosLength = Array.isArray(req.body.colegiosId) ? req.body.colegiosId.length : req.body.colegiosId; //Total de grados a iterar.
                colegiosLength = colegiosLength === undefined ? 0 : colegiosLength;

                if (colegiosLength > 0) {
                    for (var i = 0; i < colegiosLength; i++) {;
                        colegiosId.push({
                            colegioId: Functions.DeObfuscateId(req.body.colegiosId[i])
                        });
                    }
                } else if (req.body.colegiosId !== undefined) {
                    colegiosId.push({
                        colegioId: Functions.DeObfuscateId(req.body.colegiosId)
                    });
                }
                return ModelProfesores.New(usuario, password, picture, contacto, colegiosId, gradosId, myId);
            }).then(function(duplicado) {
                if (duplicado) {
                    req.session.errors = [{
                        msg: 'El Profesor ya se encuentra cargado.'
                    }];
                    return res.redirect(req.originalUrl);
                } else {
                    req.session.info = [{
                        msg: "Creado correctamente!"
                    }];
                    return res.redirect(UrlProfesores);
                }
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        }
    },

    /**
     * Elimina un profesor del sistema
     */
    post_del: (req, res) => {
        //Alimina un Colegio
        let profesorToDelete = Functions.DeObfuscateId(req.body.profesorId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelProfesores.Delete(profesorToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlProfesores);
        });
    },

    /**
     * Bloquea un profesor del sistema
     */
    post_block: (req, res) => {
        //Bloquea o desbloquea un administrador
        let profesorToBlock = Functions.DeObfuscateId(req.body.profesorId);
        let active = (req.body.profesorActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelProfesores.Block(profesorToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlProfesores);
        });
    },

    /**
     * Muestra el formulario de edicion de un profesor
     * @param general Objeto con datos importantes para el sitio
     */
    get_mod: (req, res, general) => {
        let profesorId = Functions.DeObfuscateId(req.params.id);

        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        general.error_message = res.locals.errorMod;
        general.info_message = res.locals.infoMod;

        if (Functions.ValidateId(profesorId)) {
            let profesor = null;

            ModelProfesores.GetInfo(profesorId).then(function(profesorInfo) {
                if (profesorInfo) {
                    profesor = profesorInfo;

                    general.profesor = {
                        dato: profesor,
                        routes: {
                            root: UrlProfesores + "/",
                            add: UrlProfesores + ActionAdd,
                            del: UrlProfesores + ActionDel,
                            mod: ActionMod,
                            block: UrlProfesores + ActionBlock
                        },
                        lists: {}
                    };

                    if (profesor.colegios && profesor.colegios !== undefined) {
                      return ModelColegios.GetNames(profesor.colegios.map((obj) => {
                          return obj ? (obj.active && obj.colegioId ? obj.colegioId : null) : null;
                      }));
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Profesor no existe.');
                    });
                }
            }).then(function(colegios) {
                general.profesor.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
                return ModelProfesores.GetContact(profesorId);
            }).then(function(contact) {
                general.profesor.contact = contact ? contact.contact : null;
                return ModelProfesores.GetGrados(profesorId);
            }).then(function(profesorGrados) {
              if(profesorGrados.grados){
                return ModelGrados.GetGrados(profesorGrados.grados.map((obj) => {
                    return obj.gradoId
                }));
              }
            }).then(function(grados){
                general.profesor.grados = grados ? Functions.ObfuscateIds(grados) : null;//Functions.ReplaceEmptyValueWithCustom(grados, "---");
                //general.profesor.grados = grados
                return ModelGrados.List();
            }).then(function(listGrados) {
                listGrados = Functions.ReplaceEmptyValueWithCustom(listGrados, "---");
                general.profesor.lists.grados = listGrados ? Functions.ObfuscateIds(listGrados) : null;
                return ModelColegios.List();
            }).then(function(listColegios) {
                listColegios = Functions.ReplaceEmptyValueWithCustom(listColegios, "---");
                general.profesor.lists.colegios = listColegios ? Functions.ObfuscateIds(listColegios) : null;
                res.render(View + 'profesores-mod', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesores);
            });

        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesores);
        }

    },

    /**
     * Modifica un profesor del sistema
     */
    post_mod: (req, res) => {
        let profesorId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(profesorId)) {

            let usuario = req.body.profesorUser;
            let password = req.body.profesorPwd;
            let nPassword = req.body.profesorNPwd;

            let pictureBase64 = req.body.profesorPictureResult; //base64
            let picture = "";
            let pictureName = "";
            let myId = Functions.DeObfuscateId(Usuario.getId());
            //let colegioId = Functions.DeObfuscateId(req.body.colegioId);
            let contacto = null;
            let colegiosId = [];
            let gradosId = [];

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.profesores.root + usuario + Config.profesores.upload_format).replace(/ /g, '');
                    return File.FileOrFolderExists(pictureName).then(function(duplicated) {
                        if (!duplicated) {
                            pictureBase64 = pictureBase64.replace(/^data:image\/png;base64,/, "");
                            pictureBase64 += pictureBase64.replace('+', ' ');
                            let binaryPicture = new Buffer(pictureBase64, 'base64').toString('binary');
                            return File.CreateFile(pictureName, binaryPicture, 'binary');
                        }
                    }).then(function() {
                        resolve();
                    });
                } else {
                    pictureName = picture = (Config.profesores.root + "/" + usuario + Config.profesores.upload_format).replace(/ /g, '');
                    resolve();
                }
            }).then(function(data) {
                contacto = {
                    nombre: req.body.profesorContactoNombre,
                    apellido: req.body.profesorContactoApellido,
                    email: req.body.profesorContactoEmail,
                    /*Date?*/
                    birth: req.body.profesorContactoBirth,
                    phone: {
                        p_number: req.body.profesorContactoTelefono
                    },
                    fax: {
                        f_number: req.body.profesorContactoFax
                    },
                    social: {
                        facebook: req.body.profesorContactoSocialFb,
                        twitter: req.body.profesorContactoSocialTw,
                        skype: req.body.profesorContactoSocialSk
                    }
                }

                var gradosLength = Array.isArray(req.body.gradosId) ? req.body.gradosId.length : req.body.gradosId; //Total de grados a iterar.
                gradosLength = gradosLength === undefined ? 0 : gradosLength;

                if (gradosLength > 0) {
                    for (var i = 0; i < gradosLength; i++) {;
                        gradosId.push({
                            gradoId: Functions.DeObfuscateId(req.body.gradosId[i])
                        });
                    }
                } else if (req.body.gradosId !== undefined) {
                    gradosId.push({
                        gradoId: Functions.DeObfuscateId(req.body.gradosId)
                    });
                };

                //Colegios
                var colegiosLength = Array.isArray(req.body.colegiosId) ? req.body.colegiosId.length : req.body.colegiosId; //Total de grados a iterar.
                colegiosLength = colegiosLength === undefined ? 0 : colegiosLength;

                if (colegiosLength > 0) {
                    for (var i = 0; i < colegiosLength; i++) {;
                        colegiosId.push({
                            colegioId: Functions.DeObfuscateId(req.body.colegiosId[i])
                        });
                    }
                } else if (req.body.colegiosId !== undefined) {
                    colegiosId.push({
                        colegioId: Functions.DeObfuscateId(req.body.colegiosId)
                    });
                }

                return ModelProfesores.UpdateProfesor(profesorId, password, nPassword, picture, contacto, colegiosId, gradosId, myId);
            }).then(function(validPassword) {
                if (!validPassword) {
                    return new Promise(function(resolve, reject) {
                        reject("Datos invalidos");
                    });
                } else {
                    req.session.info = [{
                        msg: "Profesor modificado correctamente!"
                    }];
                    return res.redirect(UrlProfesores);
                }
            }).catch(function(errors) {
                req.session.errorMod = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesores);
        }
    },

    /**
     * Muestra la informacion total de un profesor
     * Carga todos sus datos correspondientes
     */
    get_info: (req, res, general) => {
        let profesorId = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(profesorId)) {
            let profesor = null;

            ModelProfesores.GetInfo(profesorId).then(function(profesorInfo) {
                if (profesorInfo) {
                    profesor = profesorInfo;

                    general.profesor = {
                        dato: Functions.ReplaceEmptyValueWithCustom(profesor, "---")
                    };

                    if (profesor.colegios && profesor.colegios !== undefined) {
                      return ModelColegios.GetNames(profesor.colegios.map((obj) => {
                          return obj ? (obj.active && obj.colegioId ? obj.colegioId : null) : null;
                      }));
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Profesor no existe.');
                    });
                }
            }).then(function(colegios) {
              general.profesor.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
                return ModelProfesores.GetContact(profesorId);
            }).then(function(contact) {
                general.profesor.contact = contact ? Functions.ReplaceEmptyValueWithCustom(contact.contact, "---") : null;
                return ModelProfesores.GetGrados(profesorId);
            }).then(function(profesorGrados) {
              if(profesorGrados.grados){
                  return ModelGrados.GetGrados(profesorGrados.grados.map((obj) => {
                      return obj.gradoId
                  }));
                }
            }).then(function(grados) {
                general.profesor.grados = grados ? Functions.ReplaceEmptyValueWithCustom(grados, "---") : null;
                res.render(View + 'profesores-info', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesores);
            });

        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesores);
        }
    }
}
