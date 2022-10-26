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
const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlColegios = "/administrador/colegios";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    /**
     * Muestra el listado de colegios disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        return ModelColegios.List().then(function(colegios) {
            general.colegios = {
                list: colegios ? Functions.ObfuscateIds(colegios, false) : null,
                routes: {
                    root: UrlColegios + "/",
                    add: UrlColegios + ActionAdd,
                    del: UrlColegios + ActionDel,
                    mod: "/" + ActionMod,
                    block: UrlColegios + ActionBlock
                },
            };

            res.render(View + 'colegios-list', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Muestra el formulario de carga para un colegio
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

        general.colegios = {
            routes: {
                add: UrlColegios + ActionAdd,
                root: UrlColegios
            },
            cargos: [ //TODO sacar de la base de datos. Poner la edicion en Settings
                "Director",
                "Subdirector",
                "Coordinador",
                "Secretaria"
            ],
            lists: {} //Cargar con listados de las queries (son disponibles, no los correspondientes al colegio)
        }

        /* Solicito informacion para las listas */
        /*return ModelProfesores.List().then(function(profesores) {
            general.colegios.lists.profesores = profesores ? Functions.ObfuscateIds(profesores) : null;
            return ModelGrados.List();
        }).then(function(grados) {
            general.colegios.lists.grados = grados ? Functions.ObfuscateIds(grados) : null;
            return ModelGames.List();
        })*/
        return ModelGames.List().then(function(juegos) {
            general.colegios.lists.juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
        }).then(function() {
            res.render(View + 'colegios-add', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Carga el colegio segun el formulario en add
     */
    post_add: (req, res) => {

        let nombre = req.body.colegioName;
        let pictureBase64 = req.body.colegioPictureResult; //base64
        let picture = "";
        let pictureName = "";
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return new Promise(function(resolve, reject) {
            if (pictureBase64) {
                //Guardo la imagen si existe, sino
                pictureName = picture = (Config.escuelas.root + nombre + Config.escuelas.upload_format).replace(/ /g, '');
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
            let direction = {
                cp: req.body.colegioCP,
                address: req.body.colegioAddress,
                city: req.body.colegioCity,
                country: req.body.colegioPais,
                state: req.body.colegioProv,
            };

            let contact = [];
            var contactLength = Number(req.body.colegioContactoTotal); //Total de contactos a iterar.
            let isArray = contactLength > 1;

            for (var i = 0; i < contactLength; i++) {
                let contacto = req.body;
                contact.push({
                    nombre: isArray ? contacto.colegioContactoNombre[i] : contacto.colegioContactoNombre,
                    apellido: isArray ? contacto.colegioContactoApellido[i] : contacto.colegioContactoApellido,
                    phone: {
                        p_type: "",
                        p_number: isArray ? contacto.colegioContactoTelefono[i] : contacto.colegioContactoTelefono,
                        p_area: ""
                    },
                    email: isArray ? contacto.colegioContactoEmail[i] : contacto.colegioContactoEmail,
                    fax: {
                        f_type: "",
                        f_number: isArray ? contacto.colegioContactoFax[i] : contacto.colegioContactoFax,
                        f_area: ""
                    },
                    cargo: isArray ? contacto.colegioContactoCargo[i] : contacto.colegioContactoCargo,
                    social: {
                        facebook: isArray ? contacto.colegioContactoSocialFb[i] : contacto.colegioContactoSocialFb,
                        twitter: isArray ? contacto.colegioContactoSocialTw[i] : contacto.colegioContactoSocialTw,
                        skype: isArray ? contacto.colegioContactoSocialSk[i] : contacto.colegioContactoSocialSk,
                    }
                });
            }

            /*let profesores = [];
            var profesoresLength = Array.isArray(req.body.profesorId) ? req.body.profesorId.length : req.body.profesorId; //Total de profesores a iterar.
            profesoresLength = profesoresLength === undefined ? 0 : profesoresLength;

            if (profesoresLength > 0) {
                for (var i = 0; i < profesoresLength; i++) {;
                    profesores.push({
                        profesorId: Functions.DeObfuscateId(req.body.profesorId[i])
                    });
                }
            } else if (req.body.profesorId !== undefined) {
                profesores.push({
                    profesorId: Functions.DeObfuscateId(req.body.profesorId)
                });
            }

            let grados = [];
            var gradosLength = Array.isArray(req.body.gradoId) ? req.body.gradoId.length : req.body.gradoId; //Total de grados a iterar.
            gradosLength = gradosLength === undefined ? 0 : gradosLength;

            if (gradosLength > 0) {
                for (var i = 0; i < gradosLength; i++) {;
                    grados.push({
                        gradoId: Functions.DeObfuscateId(req.body.gradoId[i])
                    });
                }
            } else if (req.body.gradoId !== undefined) {
                grados.push({
                    gradoId: Functions.DeObfuscateId(req.body.gradoId)
                });
            }*/

            let juegos = [];
            var juegosLength = Array.isArray(req.body.gameId) ? req.body.gameId.length : req.body.gameId; //Total de juegos a iterar.
            juegosLength = juegosLength === undefined ? 0 : juegosLength;

            if (juegosLength > 0) {
                for (var i = 0; i < juegosLength; i++) {;
                    juegos.push({
                        juegoId: Functions.DeObfuscateId(req.body.gameId[i])
                    });
                }
            } else if (req.body.gameId !== undefined) {
                juegos.push({
                    juegoId: Functions.DeObfuscateId(req.body.gameId)
                });
            }

            return ModelColegios.New(nombre, direction, picture, contact, /*profesores, grados,*/ juegos, myId).then(function(duplicado) {
                if (duplicado) {
                    //Borar imagen...
                    return File.DeleteFile(pictureName).then(function(error) {
                        if (!error) {
                            return new Promise(function(resolve, reject) {
                                reject('El Colegio ya se encuentra cargado.');
                            });
                        }
                    }).catch(function(error) {
                        req.session.errors = [{
                            msg: 'El Colegio ya se encuentra cargado.'
                        }];
                        return res.redirect(req.originalUrl);
                    });
                } else {
                    req.session.info = [{
                        msg: "Creado correctamente!"
                    }];
                    return res.redirect(UrlColegios);
                }
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        });
    },

    /**
     * Elimina un colegio del sistema
     */
    post_del: (req, res) => {
        //Alimina un Colegio
        let colegioToDelete = Functions.DeObfuscateId(req.body.colegioId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelColegios.Delete(colegioToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlColegios);
        });
    },

    /**
     * Bloquea un colegio del sistema
     */
    post_block: (req, res) => {
        //Bloquea o desbloquea un administrador
        let colegioToBlock = Functions.DeObfuscateId(req.body.colegioId);
        let active = (req.body.colegioActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelColegios.Block(colegioToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlColegios);
        });
    },

    /**
     * Muestra el formulario de edicion de un colegio
     * @param general Objeto con datos importantes para el sitio
     */
    get_mod: (req, res, general) => {
        let colegioId = Functions.DeObfuscateId(req.params.id);

        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        general.error_message = res.locals.errorMod;
        general.info_message = res.locals.infoMod;

        if (Functions.ValidateId(colegioId)) {
            let colegio = null;
            //Comienzo a solicitar los datos resferentes al colegio
            ModelColegios.GetInfo(colegioId).then(function(colegioInfo) {
                if (colegioInfo) {
                    colegio = colegioInfo;
                    general.colegio = {
                        dato: colegio,
                        routes: {
                            root: UrlColegios + "/",
                            add: UrlColegios + ActionAdd,
                            del: UrlColegios + ActionDel,
                            mod: ActionMod,
                            block: UrlColegios + ActionBlock
                        },
                        cargos: [ //TODO sacar de la base de datos. Poner la edicion en Settings
                            "Director",
                            "Subdirector",
                            "Coordinador",
                            "Secretaria"
                        ],
                        lists: {} //Lsita de datos a elegir, disponibles en el sistema
                    }
                    /*return ModelProfesores.GetProfesores(colegio.profesores ? colegio.profesores.map((obj) => {
                        return obj.active ? obj.profesorId : null
                    }) : null);*/
                    return ModelGames.GetGames(colegio.juegos ? colegio.juegos.map((obj) => {
                        return obj.active ? obj.juegoId : null
                    }) : null);
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Colegio no existe.');
                    });
                }
            })/*.then(function(profesores) {
                profesores = profesores ? Functions.ObfuscateIds(profesores) : null;
                general.colegio.profesores = Functions.ReplaceEmptyValueWithCustom(profesores, "---");
                return ModelGrados.GetGrados(colegio.grados ? colegio.grados.map((obj) => {
                    return obj.active ? obj.gradoId : null
                }) : null);
            }).then(function(grados) {
                grados = grados ? Functions.ObfuscateIds(grados) : null;
                general.colegio.grados = Functions.ReplaceEmptyValueWithCustom(grados, "---");
                return ModelGames.GetGames(colegio.juegos ? colegio.juegos.map((obj) => {
                    return obj.active ? obj.juegoId : null
                }) : null);
            })*/.then(function(juegos) {
                juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
                general.colegio.juegos = Functions.ReplaceEmptyValueWithCustom(juegos, "---");
                //Comienzo a solicitar los datos del sistema
                //return ModelProfesores.List();
                return ModelGames.List();
            })/*.then(function(listProfesores) {
                listProfesores = Functions.ReplaceEmptyValueWithCustom(listProfesores, "---");
                general.colegio.lists.profesores = listProfesores ? Functions.ObfuscateIds(listProfesores) : null;
                return ModelGrados.List();
            }).then(function(listGrados) {
                listGrados = Functions.ReplaceEmptyValueWithCustom(listGrados, "---");
                general.colegio.lists.grados = listGrados ? Functions.ObfuscateIds(listGrados) : null;
                return ModelGames.List();
            })*/.then(function(listJuegos) {
                listJuegos = Functions.ReplaceEmptyValueWithCustom(listJuegos, "---");
                general.colegio.lists.juegos = listJuegos ? Functions.ObfuscateIds(listJuegos) : null;

                res.render(View + 'colegios-mod', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                console.log(errors);
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlColegios);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlColegios);
        }
    },

    /**
     * Modifica un colegio del sistema
     */
    post_mod: (req, res) => {
        let colegioId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(colegioId)) {
            let nombre = req.body.colegioName;
            let pictureBase64 = req.body.colegioPictureResult; //base64
            let picture = "";
            let pictureName = "";
            let myId = Functions.DeObfuscateId(Usuario.getId());

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen, no le importa nada
                    pictureName = picture = (Config.escuelas.root + nombre + Config.escuelas.upload_format).replace(/ /g, '');
                    return File.FileOrFolderExists(pictureName).then(function(duplicated) {
                        pictureBase64 = pictureBase64.replace(/^data:image\/png;base64,/, "");
                        pictureBase64 += pictureBase64.replace('+', ' ');
                        let binaryPicture = new Buffer(pictureBase64, 'base64').toString('binary');
                        return File.CreateFile(pictureName, binaryPicture, 'binary');
                    }).then(function() {
                        resolve();
                    });
                } else {
                    pictureName = picture = (Config.escuelas.root + "/" + nombre + Config.escuelas.upload_format).replace(/ /g, '');
                    resolve();
                }
            }).then(function(data) {
                let direction = {
                    cp: req.body.colegioCP,
                    address: req.body.colegioAddress,
                    city: req.body.colegioCity,
                    country: req.body.colegioPais,
                    state: req.body.colegioProv,
                };

                let contact = [];
                var contactLength = Number(req.body.colegioContactoTotal); //Total de contactos a iterar.
                let isArray = contactLength > 1;

                for (var i = 0; i < contactLength; i++) {
                    let contacto = req.body;
                    contact.push({
                        nombre: isArray ? contacto.colegioContactoNombre[i] : contacto.colegioContactoNombre,
                        apellido: isArray ? contacto.colegioContactoApellido[i] : contacto.colegioContactoApellido,
                        phone: {
                            p_type: "",
                            p_number: isArray ? contacto.colegioContactoTelefono[i] : contacto.colegioContactoTelefono,
                            p_area: ""
                        },
                        email: isArray ? contacto.colegioContactoEmail[i] : contacto.colegioContactoEmail,
                        fax: {
                            f_type: "",
                            f_number: isArray ? contacto.colegioContactoFax[i] : contacto.colegioContactoFax,
                            f_area: ""
                        },
                        cargo: isArray ? contacto.colegioContactoCargo[i] : contacto.colegioContactoCargo,
                        social: {
                            facebook: isArray ? contacto.colegioContactoSocialFb[i] : contacto.colegioContactoSocialFb,
                            twitter: isArray ? contacto.colegioContactoSocialTw[i] : contacto.colegioContactoSocialTw,
                            skype: isArray ? contacto.colegioContactoSocialSk[i] : contacto.colegioContactoSocialSk,
                        }
                    });
                }

                /*let profesores = [];
                var profesoresLength = Array.isArray(req.body.profesorId) ? req.body.profesorId.length : req.body.profesorId; //Total de profesores a iterar.
                profesoresLength = profesoresLength === undefined ? 0 : profesoresLength;

                if (profesoresLength > 0) {
                    for (var i = 0; i < profesoresLength; i++) {;
                        profesores.push({
                            profesorId: Functions.DeObfuscateId(req.body.profesorId[i])
                        });
                    }
                } else {
                    if (req.body.profesorId != undefined) {
                        profesores.push({
                            profesorId: Functions.DeObfuscateId(req.body.profesorId)
                        });
                    }
                }

                let grados = [];
                var gradosLength = Array.isArray(req.body.gradoId) ? req.body.gradoId.length : req.body.gradoId; //Total de grados a iterar.
                gradosLength = gradosLength === undefined ? 0 : gradosLength;

                if (gradosLength > 0) {
                    for (var i = 0; i < gradosLength; i++) {;
                        grados.push({
                            gradoId: Functions.DeObfuscateId(req.body.gradoId[i])
                        });
                    }
                } else {
                    if (req.body.gradoId != undefined) {
                        grados.push({
                            gradoId: Functions.DeObfuscateId(req.body.gradoId)
                        });
                    }
                }*/

                let juegos = [];
                var juegosLength = Array.isArray(req.body.gameId) ? req.body.gameId.length : req.body.gameId; //Total de juegos a iterar.
                juegosLength = juegosLength === undefined ? 0 : juegosLength;

                if (juegosLength > 0) {
                    for (var i = 0; i < juegosLength; i++) {;
                        juegos.push({
                            juegoId: Functions.DeObfuscateId(req.body.gameId[i])
                        });
                    }
                } else {
                    if (req.body.gameId != undefined) {
                        juegos.push({
                            juegoId: Functions.DeObfuscateId(req.body.gameId)
                        });
                    }
                }
                //Actualizo
                return ModelColegios.Update(colegioId, nombre, direction, picture, contact, /*profesores, grados,*/ juegos, myId);
            }).then(function() {
                req.session.info = [{
                    msg: "Actualizado correctamente!"
                }];
                return res.redirect(UrlColegios);
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlColegios);
        }
    },

    /**
     * Muestra la informacion total de un colegio
     * Carga todos sus datos correspondientes (Profesores, Juegos, etc)
     */
    get_info: (req, res, general) => {
        let colegioId = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(colegioId)) {
            let colegio = null;
            ModelColegios.GetInfo(colegioId).then(function(colegioInfo) {
                if (colegioInfo) {
                    colegio = colegioInfo;
                    general.colegio = {
                        dato: Functions.ReplaceEmptyValueWithCustom(colegio, "---"),
                    }
                    /*return ModelProfesores.GetProfesores(colegio.profesores.map((obj) => {
                        return obj.profesorId
                    }));*/
                    return ModelGames.GetGames(colegio.juegos ? colegio.juegos.map((obj) => {
                        return obj.juegoId
                    }): null);
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Colegio no existe.');
                    });
                }
            })/*.then(function(profesores) {
                general.colegio.profesores = Functions.ReplaceEmptyValueWithCustom(profesores, "---");
                return ModelGrados.GetGrados(colegio.grados.map((obj) => {
                    return obj.gradoId
                }));
            }).then(function(grados) {
                general.colegio.grados = Functions.ReplaceEmptyValueWithCustom(grados, "---");
                return ModelGames.GetGames(colegio.juegos.map((obj) => {
                    return obj.juegoId
                }));
            })*/.then(function(juegos) {
                general.colegio.juegos = Functions.ReplaceEmptyValueWithCustom(juegos, "---");

                res.render(View + 'colegios-info', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlColegios);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlColegios);
        }
    }
}
