const Config = rootRequire('config');
const Usuario = rootRequire('utilities').usuario;
const Functions = rootRequire('functions');
const GameTypes = rootRequire('structures/GameTypes');
const File = rootRequire('utilities').file;
const jQuery = require('cheerio');
const Promise = require('bluebird');
const Decompress = require('decompress');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlGames = "/administrador/juegos";

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

const FormNewGame = rootRequire('forms/gameNew');
const FormEditGame = rootRequire('forms/gameEdit');
const FormInfoGame = rootRequire('forms/gameInfo');

module.exports = {

    /**
     * Muestra el listado de juegos disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        return ModelGames.List().then(function(juegos) {
            general.juegos = {
                list: juegos ? Functions.ObfuscateIds(juegos, false) : null,
                routes: {
                    root: UrlGames + "/",
                    add: UrlGames + ActionAdd,
                    del: UrlGames + ActionDel,
                    mod: "/" + ActionMod,
                    block: UrlGames + ActionBlock
                },
            };

            res.render(View + 'juegos-list', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Muestra el formulario de carga para un juego
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

        var $ = jQuery.load(FormNewGame.form);

        $('#game_add_type').addClass('selectpicker');
        $("#game_add_type").append('<option disabled selected value>Seleccione el tipo de juego</option>');
        GameTypes.enums.forEach(function(item) {
            $("#game_add_type").append('<option value="' + item.value + '">' + item.key + '</option>');
        });
        $("#game_add_tags").attr("data-role", "tagsinput");

        general.juego = {
            formNew: $.html(),
            routes: {
                add: UrlGames + ActionAdd,
                root: UrlGames
            }
        }

        if (general.error_message && general.error_message.length > 0) {
            let err = general.error_message[0].msg;
            res.status(406).send({
                errorMessage: err
            });
        } else if (general.info_message && general.info_message.length > 0) {
            let info = general.info_message[0].msg;
            res.status(200).send({
                infoMessage: info
            });
        } else {
            res.render(View + 'juegos-add', general);
            delete res.locals.errors;
            delete res.locals.info;
        }
    },

    /**
     * Carga un juego en el sistema, verifica que no exista, tanto fisicamente
     * como en la base de datos. Notifica cada resultado al usuario.
     * Una vez insertado, se descomprime.
     */
    post_add: (req, res) => {
        var file = {}; //Holder de la info del archivo
        FormNewGame.validate(req).then(function() {
            //Ver si el archivo es zip, analizar nombre, ver si existe. descomprimir y guardar en la DB
            let path = require('path');
            let sanitize = require('sanitize-filename');

            //Archivo
            file.name = sanitize(req.file.originalname);
            file.buffer = req.file.buffer;
            let rgx = new RegExp(Config.games.upload_format);
            let extname = rgx.test(path.extname(file.name).toLowerCase());
            file.name = path.join(Config.games.upload_dir, file.name);

            if (!extname) {
                return new Promise(function(resolve, reject) {
                    reject('Formato no soportado');
                });
            } else {
                return File.FileOrFolderExists(file.name);
            }
        }).then(function(duplicated) {
            if (duplicated) {
                return new Promise(function(resolve, reject) {
                    reject('El archivo ya existe, por favor intente otro.');
                });
            } else {
                return File.CreateFile(file.name, file.buffer, 'binary');
            }
        }).then(function(data) {
            //Archivo creado correctamente
            //Lo Inserto en la DB
            file.path_to_save = file.name.slice(0, -4);
            let title = req.body.gameTitle;
            let description = req.body.gameDescription;
            let tags = req.body.gameTags.split(',');
            let type = GameTypes.get(Number(req.body.gameType)).value;
            let myId = Functions.DeObfuscateId(Usuario.getId());
            return ModelGames.Add(title, description, tags, type, file.path_to_save, myId);
        }).then(function(duplicado) {
            if (duplicado) {
                //Eliminar el archivo que se guardo...no sirve.
                return File.DeleteFile(file.name).then(function() {
                    return new Promise(function(resolve, reject) {
                        reject('El juego ya se encuentra cargado.');
                    });
                });
            } else {
                //Descomprimo el archivo.
                Decompress(file.name, file.path_to_save).then(files => {
                    req.session.info = [{
                        msg: "Juego subido correctamente!"
                    }];
                    return res.redirect(req.originalUrl);
                }).catch((e) => {
                    req.session.errors = [{
                        msg: "No se pudo subir el archivo!"
                    }];
                    return res.redirect(req.originalUrl);
                });
            }
        }).catch((errors) => {
            res.status(406).send({
                errorMessage: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            });
        });
    },

    post_del: (req, res) => {
        let gameToDelete = Functions.DeObfuscateId(req.body.gameId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelGames.Delete(gameToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlGames);
        });
    },

    post_block: (req, res) => {
        //Bloquea o desbloquea un juego
        let gameToBlock = Functions.DeObfuscateId(req.body.gameId);
        let active = (req.body.gameActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelGames.Block(gameToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlGames);
        });
    },

    get_mod: (req, res, general) => {
        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        general.error_message = res.locals.errorMod;
        general.info_message = res.locals.infoMod;

        ModelGames.GetInfo(Functions.DeObfuscateId(req.params.id)).then(function(juego) {
            if (juego) {
                var $ = jQuery.load(FormEditGame.form);

                $("#game_edit_path").attr('readonly', true);
                $("#game_edit_path").val(juego.path_root);
                $("#game_edit_title").val(juego.title);
                $("#game_edit_description").val(juego.description);
                $("#game_edit_tags").val(juego.tags);

                $('#game_edit_type').addClass('selectpicker');
                $("#game_edit_type").append('<option disabled selected value>Seleccione el tipo de juego</option>');
                GameTypes.enums.forEach(function(item) {
                    if (item.key == juego.type)
                        $("#game_edit_type").append(`<option value="${item.value}" selected>${item.key}</option>`);
                    else {
                        $("#game_edit_type").append(`<option value="${item.value}">${item.key}</option>`);
                    }
                });
                $("#game_edit_tags").attr("data-role", "tagsinput");

                general.juego = {
                    formEdit: $.html(),
                    routes: {
                        mod: ActionMod,
                        root: UrlGames
                    },
                    title: juego.title
                }

                res.render(View + 'juegos-mod', general);

                delete res.locals.errorMod;
                delete res.locals.infoMod;
            } else {
                return new Promise(function(resolve, reject) {
                    reject();
                });
            }
        }).catch((e) => {
            req.session.errors = [{
                msg: `No se encontro un juego con el Id: ${Functions.DeObfuscateId(req.params.id)}`
            }];
            return res.redirect(UrlGames);
        });
    },

    post_mod: (req, res) => {
        //Verifico si es valido la data. Notifico la operacion
        FormEditGame.validate(req).then(function() {
            let gameId = Functions.DeObfuscateId(req.params.id);
            let title = req.body.gameTitle;
            let description = req.body.gameDescription;
            let tags = req.body.gameTags.split(',');
            let type = GameTypes.get(Number(req.body.gameType)).value;
            let myId = Functions.DeObfuscateId(Usuario.getId());

            return ModelGames.UpdateInfo(gameId, title, description, tags, type, myId);
        }).then(function(duplicado) {
            if (duplicado) {
                return new Promise(function(resolve, reject) {
                    reject('El juego ya se encuentra cargado.');
                });
            } else {
                req.session.infoMod = [{
                    msg: "Juego modificado correctamente!"
                }];
                return res.redirect(req.originalUrl);
            }
        }).catch((errors) => {
            req.session.errorMod = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    },

    /**
     * Muestra la informacion total de un colegio
     * Carga todos sus datos correspondientes (Profesores, Juegos, etc)
     */
    get_info: (req, res, general) => {
        let juegoId = Functions.DeObfuscateId(req.params.id);

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        if (Functions.ValidateId(juegoId)) {
            let juego = null;
            ModelGames.GetInfo(juegoId).then(function(juego) {
                if (juego) {
                    var $ = jQuery.load(FormInfoGame.form);

                    $("#game_info_path").attr('readonly', true);
                    $("#game_info_path").val(juego.path_root);
                    $("#game_info_title").attr('readonly', true);
                    $("#game_info_title").val(juego.title);
                    $("#game_info_description").attr('readonly', true);
                    $("#game_info_description").val(juego.description);
                    $("#game_info_tags").attr('disabled', 'disabled');
                    $("#game_info_tags").val(juego.tags);
                    $("#game_info_type").attr('readonly', true);
                    $("#game_info_type").val(juego.type);
                    $("#game_info_tags").attr("data-role", "tagsinput");

                    general.juego = {
                        formInfo: $.html(),
                        title: juego.title
                    }

                    res.render(View + 'juegos-info', general);
                    delete res.locals.errors;
                    delete res.locals.info;
                }
            });


        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlGames);
        }
    }
}
