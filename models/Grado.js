const GradoSchema = require("./schemes/Grado");

module.exports = {

    /**
     * Carga un nuevo Grado a la base de datos, asociado a un colegio
     * @param nombre Nombre del curso
     * @param colegioId Id del colegio donde pertenece el Grado
     * @param division Nombre de la division (ej: 1ro 2da / 2B)
     * @param profesor_id Id del profesor que representa al grado
     * @param alumnos_id Id de los alumnos que forman parte del grado
     * @param juegos Juegos que tiene el grado
     * @param created_by Id del usuario que va a cargar el grado
     */
    /*New: function(nombre, colegioId, division, profesor_id, alumnos_id, juegos, created_by) {
        let grado = new GradoSchema({
            nombre: nombre,
            colegio_id: colegioId,
            division: division,
            profesor_id: profesor_id,
            alumnos_id: alumnos_id,
            juegos: juegos,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return grado.uniqueDivision(colegioId, division).then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                grado.save();
                return false;
            }
        });
    },*/

    New: function(nombre, division, created_by) {
        let grado = new GradoSchema({
            nombre: nombre,
            division: division,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return grado.uniqueDivision(division).then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                grado.save();
                return false;
            }
        });
    },

    /*Update: function(gradoId, nombre, colegio_id, division, profesor_id, alumnos_id, juegos, modifiedy_by) {
        console.log("juegos: ", juegos);
        return new Promise(function(resolve, reject) {
            GradoSchema.findById(gradoId).exec().then(function(grado) {
                if (grado) {
                    grado.nombre = nombre;
                    grado.colegio_id = colegio_id;
                    grado.division = division;
                    grado.profesor_id = profesor_id;
                    grado.alumnos_id = alumnos_id;
                    grado.juegos = juegos;

                    grado.modifiedy_by.push({
                        userId: modifiedy_by,
                        date: new Date()
                    })

                    grado.save();
                    resolve();
                } else {
                    reject("Grado Invalido.");
                }
            });
        });
    },*/
    Update: function(gradoId, nombre, division, modifiedy_by) {
        return new Promise(function(resolve, reject) {
            GradoSchema.findById(gradoId).exec().then(function(grado) {
                if (grado) {
                    grado.nombre = nombre;
                    grado.division = division;
                    grado.modifiedy_by.push({
                        userId: modifiedy_by,
                        date: new Date()
                    })
                    grado.save();
                    resolve();
                } else {
                    reject("Grado Invalido.");
                }
            });
        });
    },

    /**
     * Desactiva/Activa un grado
     * @param gradoId Id del grado al cual se va a desactivar/activar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Block: function(gradoId, state, userId) {
        return GradoSchema.findByIdAndUpdate(gradoId, {
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
     * Elimina/deselimina un grado
     * @param gradoId Id del grado al cual se va a elimina/deselimina
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Delete: function(gradoId, state, userId, cb) {
        return GradoSchema.findByIdAndUpdate(gradoId, {
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
     * Obtiene una lista de todos los profesores que hay
     * Solo retorna el ID y la informacion de contacto
     */
    List: function() {
        return GradoSchema.find({
            deleted: false
        }).select({
            _id: 1,
            nombre: 1,
            division: 1,
            colegio_id: 1,
            active: 1
        }).exec();
    },

    /**
     * Obtiene informacion general del grado
     * @param id Id del Colegio
     */
    GetInfo: function(id) {
        return GradoSchema.findOne({
            _id: id,
            deleted: false
        }).select({
            nombre: 1,
            division: 1,
            colegio_id: 1,
            profesor_id: 1,
            alumnos_id: 1,
            juegos: 1
        }).exec();
    },

    /**
     * Obtiene la division de un grado en base a su ID
     */
    GetDivision: function(id) {
        return GradoSchema.findById({
            _id: id
        }).select({
            _id: 0,
            division: 1
        }).exec();
    },

    /**
     * Obtiene el nombre de un grado en base a su ID
     */
    GetName: function(id) {
        return GradoSchema.findById({
            _id: id
        }).select({
            _id: 0,
            nombre: 1
        }).exec();
    },

    /**
     * Obtiene los nombres de los colegios en base a los Ids
     */
    GetNames: function(idsMap) {
        return GradoSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            nombre: 1,
        }).exec();
    },

    /**
     * Obtiene todos los grados encontrados en base a los Ids pasados
     */
    GetDivisions: function(idsMap) {
        return GradoSchema.find({
            "_id": {
                $in: idsMap
            },
            deleted: false
        }).select({
            _id: 1,
            division: 1
        }).exec();
    },

    /**
     * Obtiene la division de un grado en base a su ID
     */
    GetDivision: function(id) {
        return GradoSchema.findById({
            _id: id
        }).select({
            _id: 0,
            division: 1
        }).exec();
    },

    /**
     * Obtiene todos los alumnos encontrados en base a los Ids pasados
     */
    GetAlumnos: function(idsMap) {
        return GradoSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            title: 1,
            type: 1
        }).exec();
    },

    Id: function() {
        //TODO Ver como identificar el ID del grado buscado
    },

    /**
    * Agrega un juego al grado para que pueda ser accedido por Profesores y Alumnos
    * No permite agregar juegos duplicados al mismo grado
    * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
    * @param gradoId Id del grado al cual va a pertenecer el juego
    + @param gameId Id del juego a asociar
    * @param userId Id del usuario que va a modificar el dato
    * @param cb Callback de la operacion, (err,grado) => {}
    */
    AddGame: function(colegioId, gradoId, gameId, userId, cb) {
        GradoSchema.findOne({
            _id: gradoId,
            colegio_id: colegioId,
        }, (err, grado) => {
            if (!err && grado) {
                grado.uniqueGame(gameId, (err, duplicated) => {
                    if (!err && !duplicated) {
                        //Puedo actualizar el dato porque no existe ;)
                        GradoSchema.findOneAndUpdate({
                            _id: gradoId
                        }, {
                            $addToSet: {
                                modifiedy_by: {
                                    userId: userId,
                                    date: new Date()
                                },
                                juegos: {
                                    juegoId: gameId
                                }
                            }
                        }, function(err, grado) {
                            if (!err && grado) cb(null, grado); //Perfecto!
                            else cb(`No se puede agregar el juego: ${gameId} al colegio: ${colegioId} grado: ${gradoId}`);
                        });
                    } else {
                        cb(`El juego: ${gameId} a agregar al grado: ${gradoId} se encuentra duplicado.`);
                    }
                });
            } else {
                cb(`No se encontro un Grado con el ID: ${gradoId}`);
            }
        });
    },

    //gameId es el _id del array de Juegos

    /**
     * Desactiva/Activa un juego para un grado
     * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
     * @param gradoId Id del grado al cual se va a desactivar/activar un juego
     * @param gameId Id del juego de arrays que se quiere operar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,grado) => {}
     */
    RemoveGame: function(colegioId, gradoId, gameId, state, userId, cb) {
        GradoSchema.findOneAndUpdate({
            _id: gradoId,
            colegio_id: colegioId,
            "juegos.juegoId": gameId
        }, {
            $set: {
                //$ resultado del query
                "juegos.$.active": state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, grado) {
            if (!err && grado) {
                cb(null, grado);
            } else {
                cb(`Error al intentar actualizar el juego: ${gameId}, del colegio: ${colegioId}, grado: ${gradoId}`);
                //cb("No se pudo actualizar el estado del grado: " + gradoId);
            }
        });
    },

    /**
     * Obtiene los juegos disponibles del curso
     * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
     * @param gradoId Id del grado al cual se va a desactivar/activar un juego
     * @param cb Callback de la operacion, (err,games) => {}
     */
    GetGames: function(colegioId, gradoId, cb) {
        GradoSchema.findById({
            _id: gradoId,
            colegio_id: colegioId,
        }, function(err, games) {
            if (!err && games) cb(null, games.juegos);
            else cb(`No se encontraron juegos en el colegio: ${colegioId} para el grado: ${gradoId}`);
        });
    },

    /**
     * Agrega a un profesor al curso seleccionado
     * @param colegioId Id del colegio al cual se va a agregar al profesor
     * @param gradoId Id del grado al cual se va a agregar al profesor
     * @param profesorId Id del profesor que va a representar al grado
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,grado) => {}
     */
    AddProfesor: function(colegioId, gradoId, profesorId, userId, cb) {
        GradoSchema.findOneAndUpdate({
            _id: gradoId,
            colegio_id: colegioId
        }, {
            $set: {
                profesor_id: profesorId
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, grado) {
            if (!err && grado) {
                cb(null, grado);
            } else {
                cb(`Error al intentar actualizar el profesor: ${profesorId}, del colegio: ${colegioId},para el grado: ${gradoId}`);
            }
        });
    },

    /**
     * Remueve a un profesor del curso seleccionado
     * @param colegioId Id del colegio al cual se va a remover al profesor
     * @param gradoId Id del grado al cual se va a remover al profesor
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,grado) => {}
     */
    RemoveProfesor: function(colegioId, gradoId, userId, cb) {
        GradoSchema.findOneAndUpdate({
            _id: gradoId,
            colegio_id: colegioId
        }, {
            $set: {
                profesor_id: null
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, grado) {
            if (!err && grado) {
                cb(null, grado);
            } else {
                cb(`No se pudo modificar el profesor del colegio: ${colegioId} grado: ${gradoId}`);
            }
        });
    },

    /**
     * Obtiene el ID del profesor del curso seleccionado
     * @param colegioId Id del colegio al cual se va a obtener al profesor
     * @param gradoId Id del grado al cual se va a desactivar/activar un juego
     * @param cb Callback de la operacion, (err,profesorId) => {}
     */
    GetProfesor: function(colegioId, gradoId, cb) {
        GradoSchema.findOne({
            _id: gradoId,
            colegio_id: colegioId,
        }, (err, grado) => {
            if (!err && grado) cb(null, grado.profesor_id);
            else cb(`No se encontro el profesor del colegio: ${colegioId} del grado: ${gradoId}.`);
        });
    },

    /**
     * Obtiene todos los grados encontrados en base a los Ids pasados
     */
    GetGrados: function(idsMap) {
        return GradoSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            nombre: 1,
            division: 1
        }).exec();
    },

    /**
     * Agrega a un alumno al curso seleccionado
     * @param colegioId Id del alumno al cual se va a agregar el alumno
     * @param gradoId Id del grado al cual se va a agregar el alumno
     * @param alumnoId Id del alumno que va a agregarse al grado
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,grado) => {}
     */
    AddAlumno: function(colegioId, gradoId, alumnoId, userId, cb) {
        GradoSchema.findOne({
            _id: gradoId,
            colegio_id: colegioId,
        }, (err, grado) => {
            if (!err && grado) {
                grado.uniqueAlumno(alumnoId, (err, duplicated) => {
                    if (!err && !duplicated) {
                        //Puedo actualizar el dato porque no existe ;)
                        GradoSchema.findOneAndUpdate({
                            _id: gradoId
                        }, {
                            $addToSet: {
                                modifiedy_by: {
                                    userId: userId,
                                    date: new Date()
                                },
                                alumnos_id: {
                                    alumnoId: alumnoId
                                }
                            }
                        }, function(err, grado) {
                            if (!err && grado) cb(null, grado); //Perfecto!
                            else cb(`No se puede agregar el alumno: ${alumnoId} al colegio: ${colegioId} grado: ${gradoId}`);
                        });
                    } else {
                        cb(`El alumno: ${alumnoId} a agregar al grado: ${gradoId} se encuentra duplicado.`);
                    }
                });
            } else {
                cb(`No se encontro un Grado con el ID: ${gradoId}`);
            }
        });
    },

    /**
     * Desactiva/Activa un juego para un grado
     * @param colegioId Id del alumno al cual se va a agregar el alumno
     * @param gradoId Id del grado al cual se va a agregar el alumno
     * @param alumnoId Id del alumno que va a agregarse al grado
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,grado) => {}
     */
    RemoveAlumno: function(colegioId, gradoId, alumnoId, state, userId, cb) {
        GradoSchema.findOneAndUpdate({
            _id: gradoId,
            colegio_id: colegioId,
            "alumnos_id.alumnoId": alumnoId
        }, {
            $set: {
                //$ resultado del query
                "alumnos_id.$.active": state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, grado) {
            if (!err && grado) {
                cb(null, grado);
            } else {
                cb(`Error al intentar actualizar el alumno: ${alumnoId}, del colegio: ${colegioId}, grado: ${gradoId}`);
            }
        });
    },

    /**
     * Obtiene todos los alumnos encontrados en base a los Ids pasados
     */
    /*GetAlumnos: function(idsMap) {
        return GradoSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            contact: 1
        }).exec();
    },*/

    /**
     * Obtiene los alumnos disponibles del curso
     * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
     * @param gradoId Id del grado al cual se va a desactivar/activar un juego
     * @param cb Callback de la operacion, (err,alumnos) => {}
     */
    GetAlumnos: function(colegioId, gradoId, cb) {
        GradoSchema.findById({
            _id: gradoId,
            colegio_id: colegioId,
        }, function(err, alumnos) {
            if (!err && alumnos) cb(null, alumnos.alumnos_id);
            else cb(`No se encontraron alumnos en el colegio: ${colegioId} para el grado: ${gradoId}`);
        });
    },

    Exist: function(nombre) {
        return GradoSchema.count({
            nombre: nombre
        }).exec().then(function(grado) {
            return grado > 0;
        });
    }
};
