const GameSchema = require("./schemes/Games");

module.exports = {

    /**
     * Crea un nuevo juego en el sistema
     * @param title Nombre del juego
     * @param description Descripcion del juego
     * @param tags Tags para la busqueda
     * @param type Tipo de juego (sacado de Structures)
     * @param path Ruta donde se encuentra el archivo guardado
     * @param created_by Id del usuario que va a cargar el juego
     */
    Add: function(title, description, tags, type, path, created_by) {
        let game = new GameSchema({
            title: title,
            description: description,
            tags: tags,
            type: type,
            path_root: path,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return game.unique(title).then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                game.save();
                return false;
            }
        });
    },

    /**
     * Desactiva/Activa un juego
     * @param juegoId Id del juego al cual se va a desactivar/activar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Block: function(juegoId, state, userId, cb) {
        return GameSchema.findByIdAndUpdate(juegoId, {
            $set: {
                active: state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }).exec();
    },

    /**
     * Elimina/deselimina un juego
     * @param juegoId Id del juego al cual se va a elimina/deselimina
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Delete: function(juegoId, state, userId, cb) {
        return GameSchema.findByIdAndUpdate(juegoId, {
            $set: {
                deleted: state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }).exec();
    },

    /**
     * Obtiene una lista de todos los juegos que hay
     * @param cb Calback de la operacion, (err, games) => {}
     */
    /*List: function(cb) {
        GameSchema.find({
            deleted: false
        }, function(err, games) {
            if (err) cb(`No se pudo buscar los juegos disponibles.`);
            else if (!games || games && games.length == 0) cb(`No se encontraron juegos.`);
            else cb(null, games);
        });
    },*/

    /**
     * Obtiene una lista de todos los juegos que hay
     */
    List: function() {
        return GameSchema.find({
            deleted: false
        }).select({
            _id: 1,
            title: 1,
            type: 1,
            active: 1
        }).exec();
    },

    /**
     * Obtiene la informacion general de un juego
     * @param gameId Id del juego a buscar la informacion
     * @param cb Calback de la operacion, (err, juego) => {}
     */
    GetInfo: function(gameId) {
        return GameSchema.findOne({
            _id: gameId,
            deleted: false
        }).select({
          title: 1,
          description: 1,
          type: 1,
          path_root: 1,
          tags: 1
        }).exec();
    },

    /**
     * Obtiene todos los juegos encontrados en base a los Ids pasados
     */
    GetGames: function(idsMap) {
        return GameSchema.find({
            "_id": {
                $in: idsMap
            },
            deleted: false
        }).select({
            title: 1,
            description: 1,
            path_root: 1,
            active: 1,
            type: 1
        }).exec();
    },


    UpdateInfo: function(gameId, title, description, tags, type, userId) {
        return new Promise(function(resolve, reject) {
            GameSchema.findById(gameId).exec().then(function(game) {
                return game.unique(title, true).then(function(duplicado) {
                    if (duplicado) resolve(duplicado);
                    else {
                        game.title = title;
                        game.description = description;
                        game.tags = tags;
                        game.type = type;
                        game.modifiedy_by.push({
                            userId: userId,
                            date: new Date()
                        });
                        game.save();
                        resolve();
                    }
                });
            });
        });
    },





    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //----------------------------------BASURA BELOW--------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------



    /**
     * Setea la descripcion a un juego
     * @param gameId Id del juego a actualizar la descripcion
     * @param descripcion Descripcion a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,juego) => {}
     */
    SetDescription: function(gameId, description, userId, cb) {
        GameSchema.findOneAndUpdate({
            _id: gameId
        }, {
            $set: {
                description: description
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, juego) {
            if (!err && juego) cb(null, juego);
            else cb(`No se pudo actualizar la descripcion del juego: ${$gameId}.`);
        });
    },

    /**
     * Setea la el thumbnail para el juego (miniatura y background)
     * @param gameId Id del juego a actualizar el thumbnail
     * @param mini Imagen a mostrar general
     * @param background Image a mostrar cuando se selecciona el juego
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,juego) => {}
     */
    SetThumbnail: function(gameId, mini, background, userId, cb) {
        GameSchema.findOneAndUpdate({
            _id: gameId
        }, {
            $set: {
                thumbnail: {
                    mini: mini,
                    background: background
                }
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio);
            else cb(`No se pudo actualizar el thumbnail del juego: ${$gameId}.`);
        });
    },

    /**
     * Setea los tags a un juego
     * @param gameId Id del juego a actualizar los tags
     * @param tags Tags a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,juego) => {}
     */
    SetTags: function(gameId, tags, userId, cb) {
        GameSchema.findOneAndUpdate({
            _id: gameId
        }, {
            $set: {
                tags: tags
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio);
            else cb(`No se pudo actualizar los tags del juego: ${$gameId}.`);
        });
    },

    /**
     * Setea el tipo de juego
     * @param gameId Id del juego a actualizar el tipo de juego
     * @param type Tipo de juego a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,juego) => {}
     */
    SetType: function(gameId, type, userId, cb) {
        GameSchema.findOneAndUpdate({
            _id: gameId
        }, {
            $set: {
                type: type
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio);
            else cb(`No se pudo actualizar el tipo de juego: ${$gameId}.`);
        });
    }
};
