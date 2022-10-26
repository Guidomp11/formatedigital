const Config = rootRequire('config');
const Usuario = rootRequire('utilities').usuario;
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAlumnos = rootRequire('models/Alumno');
const ModelColegios = rootRequire('models/Colegio');
const ModelGrados = rootRequire('models/Grado');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlAlumnos = "/administrador/alumnos";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    /**
     * Muestra el listado de alumnos disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        return ModelAlumnos.List().then(function(alumnos) {
            general.alumnos = {
                list: alumnos ? Functions.ObfuscateIds(alumnos, false) : null,
                routes: {
                    root: UrlAlumnos + "/",
                    add: UrlAlumnos + ActionAdd,
                    del: UrlAlumnos + ActionDel,
                    mod: "/" + ActionMod,
                    block: UrlAlumnos + ActionBlock
                },
            };

            res.render(View + 'alumnos-list', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Muestra el formulario de carga para un alumno
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

        general.alumnos = {
            routes: {
                add: UrlAlumnos + ActionAdd,
                root: UrlAlumnos
            },
            lists: {} //Cargar con listados de las queries
        }

        /* Solicito informacion para las listas */
        return ModelColegios.List().then(function(colegios) {
            general.alumnos.lists.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
            return ModelGrados.List();
        }).then(function(grados) {
            general.alumnos.lists.grados = grados ? Functions.ObfuscateIds(grados) : null;
            res.render(View + 'alumnos-add', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Carga el alumno segun el formulario en add
     */
    post_add: (req, res) => {
        let usuario = req.body.alumnoUser;
        let password = req.body.alumnoPwd;
        let rPassword = req.body.alumnoRPwd;

        if (password != rPassword) {
            req.session.errors = [{
                msg: "Las claves no coinciden!"
            }];
            return res.redirect(req.originalUrl);
        } else {

            let pictureBase64 = req.body.alumnoPictureResult; //base64
            let picture = "";
            let pictureName = "";
            let myId = Functions.DeObfuscateId(Usuario.getId());
            let colegioId = Functions.DeObfuscateId(req.body.colegioId);
            let gradoId = Functions.DeObfuscateId(req.body.gradoId);
            let contacto = null;

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.alumnos.root + usuario + Config.alumnos.upload_format).replace(/ /g, '');
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
                    nombre: req.body.alumnoContactoNombre,
                    apellido: req.body.alumnoContactoApellido,
                    email: req.body.alumnoContactoEmail,
                    /*Date?*/
                    birth: req.body.alumnoContactoBirth,
                    phone: {
                        p_number: req.body.alumnoContactoTelefono
                    },
                    fax: {
                        f_number: req.body.alumnoContactoFax
                    },
                    social: {
                        facebook: req.body.alumnoContactoSocialFb,
                        twitter: req.body.alumnoContactoSocialTw,
                        skype: req.body.alumnoContactoSocialSk
                    }
                }
                return ModelAlumnos.New(usuario, password, picture, colegioId, gradoId, contacto, myId);
            }).then(function(duplicado) {
                if (duplicado) {
                    req.session.errors = [{
                        msg: 'El alumno ya se encuentra cargado.'
                    }];
                    return res.redirect(req.originalUrl);
                } else {
                    req.session.info = [{
                        msg: "Creado correctamente!"
                    }];
                    return res.redirect(UrlAlumnos);
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
     * Elimina un alumno del sistema
     */
    post_del: (req, res) => {
        //Alimina un Colegio
        let alumnoToDelete = Functions.DeObfuscateId(req.body.alumnoId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelAlumnos.Delete(alumnoToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlAlumnos);
        });
    },

    /**
     * Bloquea un alumno del sistema
     */
    post_block: (req, res) => {
        //Bloquea o desbloquea un alumno
        let alumnoToBlock = Functions.DeObfuscateId(req.body.alumnoId);
        let active = (req.body.alumnoActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelAlumnos.Block(alumnoToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlAlumnos);
        });
    },

    /**
     * Muestra el formulario de edicion de un alumno
     * @param general Objeto con datos importantes para el sitio
     */
    get_mod: (req, res, general) => {
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        general.error_message = res.locals.errorMod;
        general.info_message = res.locals.infoMod;

        if (Functions.ValidateId(alumnoId)) {
            let alumno = null;
            ModelAlumnos.GetInfo(alumnoId).then(function(alumnoInfo) {

                if (alumnoInfo) {
                    alumno = alumnoInfo;

                    general.alumno = {
                        dato: alumno,
                        contact: alumno.contact,
                        routes: {
                            root: UrlAlumnos + "/",
                            add: UrlAlumnos + ActionAdd,
                            del: UrlAlumnos + ActionDel,
                            mod: ActionMod,
                            block: UrlAlumnos + ActionBlock
                        },
                        lists: {}
                    };

                    if (alumno.colegio_id && alumno.colegio_id !== undefined) {
                        return ModelColegios.GetName(alumno.colegio_id).then(function(colegioName) {

                            general.alumno.colegio = {
                                id: Functions.ObfuscateId(alumno.colegio_id.toString()),
                                name: colegioName.nombre
                            };

                            return ModelGrados.GetDivision(alumno.grado_id).then(function(gradoName) {

                                general.alumno.grado = {
                                    id: Functions.ObfuscateId(alumno.grado_id.toString()),
                                    division: gradoName.division
                                };

                                return new Promise(function(resolve, reject) {
                                    resolve();
                                });
                            });
                        });
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Alumno no existe.');
                    });
                }
            }).then(function() {
                return ModelColegios.List();
            }).then(function(colegios) {
                general.alumno.lists.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
                return ModelGrados.List();
            }).then(function(grados) {
                general.alumno.lists.grados = grados ? Functions.ObfuscateIds(grados) : null;
                res.render(View + 'alumnos-mod', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlAlumnos);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumnos);
        }
    },

    /**
     * Modifica un alumno del sistema
     */
    post_mod: (req, res) => {
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(alumnoId)) {
            let usuario = req.body.alumnoUser;
            let password = req.body.alumnoPwd;
            let nPassword = req.body.alumnoNPwd;


            let pictureBase64 = req.body.alumnoPictureResult; //base64
            let picture = "";
            let pictureName = "";
            let myId = Functions.DeObfuscateId(Usuario.getId());
            let colegioId = Functions.DeObfuscateId(req.body.colegioId);
            let gradoId = Functions.DeObfuscateId(req.body.gradoId);
            let contacto = null;

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.alumnos.root + usuario + Config.alumnos.upload_format).replace(/ /g, '');
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
                    nombre: req.body.alumnoContactoNombre,
                    apellido: req.body.alumnoContactoApellido,
                    email: req.body.alumnoContactoEmail,
                    /*Date?*/
                    birth: req.body.alumnoContactoBirth,
                    phone: {
                        p_number: req.body.alumnoContactoTelefono
                    },
                    fax: {
                        f_number: req.body.alumnoContactoFax
                    },
                    social: {
                        facebook: req.body.alumnoContactoSocialFb,
                        twitter: req.body.alumnoContactoSocialTw,
                        skype: req.body.alumnoContactoSocialSk
                    }
                }
                return ModelAlumnos.UpdateAdmin(alumnoId, password, nPassword, picture, colegioId, gradoId, contacto, myId);
            }).then(function(validPassword) {
                //Esto es si hay nueva password...
                if (!validPassword) {
                    return new Promise(function(resolve, reject) {
                        reject("Datos invalidos");
                    });
                } else {
                    //No se intento cambiar la password
                    req.session.info = [{
                        msg: "Alumno modificado correctamente!"
                    }];
                    return res.redirect(UrlAlumnos);
                }
            }).catch((errors) => {
                req.session.errorMod = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumnos);
        }
    },

    /**
     * Muestra la informacion total de un grado
     * Carga todos sus datos correspondientes
     */
    get_info: (req, res, general) => {
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(alumnoId)) {
            let alumno = null;

            ModelAlumnos.GetInfo(alumnoId).then(function(alumnoInfo) {
                if (alumnoInfo) {
                    alumno = alumnoInfo;

                    general.alumno = {
                        dato: Functions.ReplaceEmptyValueWithCustom(alumno, "---"),
                        contact: alumno.contact,
                    };

                    if (alumno.colegio_id && alumno.colegio_id !== undefined) {
                        return ModelColegios.GetName(alumno.colegio_id).then(function(nombre) {

                            general.alumno.colegio = {
                                id: Functions.ObfuscateId(alumno.colegio_id.toString()),
                                name: nombre.nombre
                            };

                            return ModelGrados.GetDivision(alumno.grado_id).then(function(gradoDivision) {

                                general.alumno.grado = {
                                    id: Functions.ObfuscateId(alumno.grado_id.toString()),
                                    division: gradoDivision.division
                                };
                            });
                        });
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Alumno no existe.');
                    });
                }
            }).then(function() {
                res.render(View + 'alumnos-info', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlAlumnos);
            });

        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumnos);
        }
    }

}
