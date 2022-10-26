const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');
const Usuario = rootRequire('utilities').usuario;
const Languages = rootRequire('structures/Language');
const _ = require("lodash");

const View = rootPath() + 'views/alumno/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAlumno = rootRequire('models/Alumno');
const ModelColegio = rootRequire('models/Colegio');
const ModelGrado = rootRequire('models/Grado');
const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlAlumno = "/alumno";
const UrlAlumnoGeneral = "/general";
const UrlAlumnoContact = "/contact";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        //Obtengo los juegos disponibles segun el colegio
        let alumnoId = Functions.DeObfuscateId(Usuario.getId());
        general.alumno = {};
        //Preciso el Id del colegio al que pertenece el alumno
        ModelAlumno.GetColegio(alumnoId).then(function(colegio) {
            //Solicito los juegos del colegio
            if (colegio && colegio.colegio_id) return ModelColegio.GetGames(colegio.colegio_id);
        }).then(function(gamesId) {
            //Solicito los datos de los juegos del colegio
            if (gamesId) {
                return ModelGames.GetGames(gamesId.juegos.map((obj) => {
                    return obj.active ? obj.juegoId : null
                }));
            }
        }).then(function(games) {
            if (games) {
                games = JSON.parse(JSON.stringify(games));
                //Reviso si tiene thumbnails validos cada juego, y retorno la modificacion del array
                let noThumbnail = Config.public.img + "/" + Config.games.thumbnail_path;
                games = Functions.ObfuscateIds(games, false);
                return Promise.map(games, function(g) {
                    let thumbnail = g.path_root + "/" + Config.games.thumbnail_path;
                    return File.FileOrFolderExists(thumbnail).then(function(exist) {
                        g.thumbnail = exist ? (thumbnail).replace(/\\/g, "/") : noThumbnail;
                        g.url = UrlAlumno + "/" + g.id + "/play"; //Para poder pasar por una ruta de filtrado, y no ir directo al juego
                        return g;
                    });
                });
            }
        }).then(function(games) {
            general.alumno.games = games ? Functions.ObfuscateIds(games, false) : null;
            //general.alumno.id = Usuario.getId(); //Tengo que enviar este ID ofuscado al juego para que pueda procesar sus solicitudes a la API
            res.render(View + 'dashboard', general);

            delete res.locals.errors;
            delete res.locals.info;
        }).catch(function(errors) {
            console.log("Errors...", errors);
        });
    },

    get_profile: (req, res, general) => {
        /*Obtener perfil del usuario segun su ID*/
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(alumnoId)) {
            ModelAlumno.GetInfo(alumnoId).then(function(alumno) {
                if (alumno) {
                    general.alumno = {
                        dato: alumno,
                        contact: alumno.contact,
                        routes: {
                            root: UrlAlumno,
                            general: req.originalUrl + UrlAlumnoGeneral,
                            contact: req.originalUrl + UrlAlumnoContact
                        }
                    };

                    if (alumno.colegio_id && alumno.colegio_id !== undefined) {
                        return ModelColegio.GetName(alumno.colegio_id).then(function(nombre) {

                            general.alumno.colegio = {
                                /*id: Functions.ObfuscateId(alumno.colegio_id.toString()),*/
                                name: nombre.nombre
                            };

                            return ModelGrado.GetName(alumno.grado_id).then(function(gradoName) {

                                general.alumno.grado = {
                                    /*id: Functions.ObfuscateId(alumno.grado_id.toString()),*/
                                    name: gradoName.nombre
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
                res.render(View + 'profile', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlAlumno);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumno);
        }
    },

    post_profile_general: (req, res) => {
        let alumnoId = Functions.DeObfuscateId(req.params.id);
        let usuario = req.body.alumnoUser;

        if (Functions.ValidateId(alumnoId)) {
            let pictureBase64 = req.body.profesorPictureResult; //base64
            let picture = "";
            let pictureName = "";

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.alumnos.upload_dir + usuario + Config.alumnos.upload_format).replace(/ /g, '');
                    return File.FileOrFolderExists(pictureName).then(function(duplicated) {
                        //no revisa duplicado, no le importa nada.
                        pictureBase64 = pictureBase64.replace(/^data:image\/png;base64,/, "");
                        pictureBase64 += pictureBase64.replace('+', ' ');
                        let binaryPicture = new Buffer(pictureBase64, 'base64').toString('binary');
                        return File.CreateFile(pictureName, binaryPicture, 'binary');
                    }).then(function() {
                        resolve();
                    });
                } else {
                    pictureName = picture = (Config.alumnos.root + "/" + usuario + Config.alumnos.upload_format).replace(/ /g, '');
                    resolve();
                }
            }).then(function() {
                picture = "/" + picture;
                return ModelAlumno.SetProfilePicture(alumnoId, picture, alumnoId);
            }).then(function(){
              req.session.info = [{
                  msg: "Actualizado correctamente!"
              }];
              //Save ref to profilepicture en sessio...
              req.session.user.picture = picture;
              return res.redirect(UrlAlumno);
            }).catch(function(errors) {
                console.log("error: ", errors);
                req.session.errorMod = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(UrlAlumno);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumno);
        }
    },

    /**
     * Actualiza la informacion del usuario
     */
    post_profile_contact: (req, res) => {
        //Actualiza la informacion de contacto
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(alumnoId)) {

            let contacto = {
                /*nombre: req.body.alumnoContactoNombre,
                apellido: req.body.alumnoContactoApellido,*/ //No se alteran mas. lo actualiza la query
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
            return ModelAlumno.SetContact(alumnoId, contacto, alumnoId).then(() => {
                req.session.info = [{
                    msg: "Actualizado correctamente!"
                }];
                return res.redirect(UrlAlumno);
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(UrlAlumno);
            });
        } else {
            req.session.errors = [{
                msg: "No se puedo actualizar."
            }];
            return res.redirect(UrlAlumno);
        }
    },

    get_settings: (req, res, general) => {

        let id = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(id)) {
            ModelAlumno.GetSettings(id).then(function(userSettings) {
                if (userSettings) {
                    general.alumno = {
                        settings: userSettings.settings,
                        languages: Languages.enums,
                        routes: {
                            root: UrlAlumno + "/",
                            add: UrlAlumno + ActionAdd,
                            del: UrlAlumno + ActionDel,
                            /*mod: req.originalUrl + "/" + ActionMod,*/
                            block: UrlAlumno + ActionBlock
                        }
                    };
                }
            }).then(function() {
                res.render(View + 'settings', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlAlumno);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlAlumno);
        }
    },

    post_settings: (req, res) => {
        //Actualiza configuracion del usuario y/o clave
        let alumnoId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(alumnoId)) {

            let settings = {
                receive_notifications: req.body.alumnoSettingsNotification == '' ? true : false,
                public_profile: req.body.alumnoSettingsPrivacy == '' ? true : false,
                language: req.body.alumnoSettingsLang
            };

            let currentPwd = req.body.alumnoSettingsPwd;
            let newPwd = req.body.alumnoSettingsNPwd;
            let newRPwd = req.body.alumnoSettingsRPwd;

            return ModelAlumno.SetSettings(alumnoId, settings, alumnoId).then(() => {
                if (currentPwd != '' && newPwd != '' && newRPwd != '')
                    return ModelAlumno.ChangePassword(alumnoId, currentPwd, newPwd, newRPwd, alumnoId);
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
    },

    get_gameid_play: (req, res, general) => {
        let gameId = Functions.DeObfuscateId(req.params.gameId);
        /*
                console.log("GameID " , req.params.gameId);
                console.log("UserId " , Usuario.getId());*/
        if (Functions.ValidateId(gameId)) {
            //Aca se pasan los datos que el juego precisa para comunicarse con la API.
            ModelGames.GetInfo(gameId).then(function(game) {
              if(game){
                let gamePath = ("/" + game.path_root).replace(/\\/g, "/"); //Sanitizo la direccion
                //Arranco el socket
                //Socket.Connect(req.params.gameId);
                Usuario.setGameId(req.params.gameId);

                req.session.user.gameId = req.params.gameId; //TODO Test para evadir el holder Usuario
                
                res.redirect(gamePath);
              }else{
                req.session.errors = [{
                    msg: "No se puedo cargar el juego."
                }];
              }
            });
        } else {
            res.redirect(UrlAlumno);
        }
    }

};
