const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Languages = rootRequire('structures/Language');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');

const View = rootPath() + 'views/profesor/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelProfesor = rootRequire('models/Profesor');
const ModelColegio = rootRequire('models/Colegio');
const ModelGrado = rootRequire('models/Grado');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlProfesor = "/profesor";
const UrlProfesorStats = "/stats";
const UrlProfesorGeneral = "/general";
const UrlProfesorContact = "/contact";

module.exports = {

    get: (req, res, general) => {
        general.profesor = {
            routes: {
                root: UrlProfesor + "/",
                college: UrlProfesor + UrlProfesorStats + "/college",
                alumns: UrlProfesor + UrlProfesorStats + "/alumns",
                games: UrlProfesor + "/games"
            }
        };
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        res.render(View + 'dashboard', general);

        delete res.locals.errors;
        delete res.locals.info;
    },

    get_profile: (req, res, general) => {
        /*Obtener perfil del usuario segun su ID*/
        let id = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(id)) {
            let profesor = null;
            ModelProfesor.GetInfo(id).then(function(profesorInfo) {
                if (profesorInfo) {
                    profesor = profesorInfo;
                    general.profesor = {
                        dato: profesor,
                        contact: profesor.contact,
                        routes: {
                            root: UrlProfesor,
                            general: req.originalUrl + UrlProfesorGeneral,
                            contact: req.originalUrl + UrlProfesorContact
                        }
                    };

                    if (profesor && profesor.colegios.length > 0) {
                        return ModelColegio.GetNames(profesor.colegios.map((colegio) => {
                            return colegio.active ? colegio.colegioId : null;
                        }));
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Profesor no existe.');
                    });
                }
            }).then(function(colegios) {
                if (colegios) {
                    let colegiosNames = "";
                    //Junto los colegios
                    colegios.map((colegio)=>{
                      colegiosNames += colegio.nombre + ', ';
                    });
                    general.profesor.colegios = colegiosNames.substring(0,colegiosNames.length - 2);
                }
                return ModelGrado.GetDivisions(profesor.grados.map((grado) => {
                    return grado.active ? grado.gradoId : null
                }));
            }).then(function(grados) {
                if (grados) {
                    general.profesor.grados = grados.sort(function(a, b) {
                        return parseInt(a.division - b.division);
                    });
                }
            }).then(function() {
                res.render(View + 'profile', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                console.log("perfil error ... ", errors);
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesor);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesor);
        }
    },

    post_profile_general: (req, res) => {
        let profesorId = Functions.DeObfuscateId(req.params.id);
        let usuario = req.body.profesorUser;

        if (Functions.ValidateId(profesorId)) {
            let pictureBase64 = req.body.profesorPictureResult; //base64
            let picture = "";
            let pictureName = "";

            return new Promise(function(resolve, reject) {
                if (pictureBase64) {
                    //Guardo la imagen si existe, sino
                    pictureName = picture = (Config.profesores.upload_dir + usuario + Config.profesores.upload_format).replace(/ /g, '');
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
                    pictureName = picture = (Config.profesores.root + "/" + usuario + Config.profesores.upload_format).replace(/ /g, '');
                    resolve();
                }
            }).then(function() {
                picture = "/" + picture;
                return ModelProfesor.SetProfilePicture(profesorId, picture, profesorId);
            }).then(function(data) {
                req.session.info = [{
                    msg: "Actualizado correctamente!"
                }];
                //Save ref to profilepicture en sessio...
                req.session.user.picture = picture;
                return res.redirect(UrlProfesor);
            }).catch(function(errors) {
                console.log("error: ", errors);
                req.session.errorMod = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(UrlProfesor);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesores);
        }
    },

    post_profile_contact: (req, res) => {
        let profesorId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(profesorId)) {
            let contacto = {
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
            return ModelProfesor.SetContact(profesorId, contacto, profesorId).then(function() {
                req.session.info = [{
                    msg: "Actualizado correctamente!"
                }];
                return res.redirect(UrlProfesor);
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(UrlProfesor);
            });
        } else {
            req.session.errors = [{
                msg: "No se puedo actualizar."
            }];
            return res.redirect(UrlProfesor);
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
            ModelProfesor.GetSettings(id).then(function(userSettings) {
                if (userSettings) {
                    general.profesor = {
                        settings: userSettings.settings,
                        languages: Languages.enums,
                        routes: {
                            root: UrlProfesor + "/"
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
                return res.redirect(UrlProfesor);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesor);
        }
    },

    post_settings: (req, res) => {
        //Actualiza configuracion del usuario y/o clave
        let profesorId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(profesorId)) {

            let settings = {
                receive_notifications: req.body.profesorSettingsNotification == '' ? true : false,
                public_profile: req.body.profesorSettingsPrivacy == '' ? true : false,
                language: req.body.profesorSettingsLang
            };

            let currentPwd = req.body.profesorSettingsPwd;
            let newPwd = req.body.profesorSettingsNPwd;
            let newRPwd = req.body.profesorSettingsRPwd;

            return ModelProfesor.SetSettings(profesorId, settings, profesorId).then(() => {
                if (currentPwd != '' && newPwd != '' && newRPwd != '')
                    return ModelProfesor.ChangePassword(profesorId, currentPwd, newPwd, newRPwd, profesorId);
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
};
