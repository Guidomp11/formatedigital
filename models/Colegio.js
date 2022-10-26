const ColegioSchema = require("./schemes/Colegio");

module.exports = {

    /**
     * Carga un nuevo Colegio a la base de datos
     * @param nombre Nombre del colegio
     * @param direction Direccion del colegio
     * @param profile_picture Imagen del colegio (base64)
     * @param contact Informacion del contacto (al menos 1)
     * @param profesores Lista de profesores disponibles para el colegio
     * @param grados Lista de grados disponibles para el colegio
     * @param juegos Lista de juegos disponibles para el colegio
     * @param created_by Id del usuario que va a cargar el colegio
     */
    New: function(nombre, direction, profile_picture, contact, /*profesores, grados,*/ juegos, created_by) {
        let colegio = new ColegioSchema({
            nombre: nombre,
            direction: direction,
            profile_picture: profile_picture,
            contact: contact,
            /*profesores: profesores,*/
            /*grados: grados,*/
            juegos: juegos,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return colegio.uniqueCollege(nombre).then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                colegio.save();
                return false;
            }
        });
    },

    Update: function(colegioId, nombre, direction, profile_picture, contact, /*profesores, grados,*/ juegos, userId) {
        ColegioSchema.findByIdAndUpdate(colegioId, {
            nombre: nombre,
            direction: {
                cp: direction.cp,
                address: direction.address,
                city: direction.city,
                country: direction.country,
                state: direction.state
            },
            profile_picture: profile_picture,
            contact: contact,
            /*profesores: profesores,*/
            /*grados: grados,*/
            juegos: juegos,
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }).exec();
    },

    /**
     * Desactiva/Activa un colegio
     * @param colegioId Id del colegio al cual se va a desactivar/activar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Block: function(colegioId, state, userId) {
        return ColegioSchema.findByIdAndUpdate(colegioId, {
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
     * Elimina/deselimina un colegio
     * @param colegioId Id del colegio al cual se va a elimina/deselimina
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Delete: function(colegioId, state, userId, cb) {
        return ColegioSchema.findByIdAndUpdate(colegioId, {
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
     * Obtiene una lista de todos los colegios que hay
     * @param cb Calback de la operacion, (err, colegios) => {}
     */
    /*List: function(cb) {
        ColegioSchema.find({
            deleted: false
        }, function(err, colegios) {
            if (err) cb(`No se pudo buscar los colegios disponibles.`);
            else if (!colegios || colegios && colegios.length == 0) cb(`No se encontraron colegios.`);
            else cb(null, colegios);
        });
    },*/

    /**
     * Obtiene una lista de todos los colegios que hay
     */
    List: function() {
        return ColegioSchema.find({
            deleted: false
        }).select({
            _id: 1,
            nombre: 1,
            active: 1
        }).exec();
    },

    /**
     * Obtiene informacion general del colegio
     * @param id Id del Colegio
     */
    GetInfo: function(id) {
        return ColegioSchema.findOne({
            _id: id,
            deleted: false
        }).select({
            nombre: 1,
            direction: 1,
            contact: 1,
            /*profesores: 1,*/
            /*grados: 1,*/
            juegos: 1
        }).exec();
    },

    /**
     * Obtiene informacion general de los colegio segun Id's
     * @param id Id del Colegio
     */
    GetInfos: function(idsMap) {
        return ColegioSchema.find({
          "_id": {
              $in: idsMap
          },
          deleted: false
        }).select({
            nombre: 1,
            /*direction: 1,
            contact: 1,*/
            profile_picture: 1,
            juegos: 1
        }).exec();
    },

    /**
     * Obtiene el nombre de un colegio en base a su ID
     */
    GetName: function(id) {
        return ColegioSchema.findById({
            _id: id
        }).select({
            nombre: 1
        }).exec();
    },

    /**
     * Obtiene los nombres de los colegios en base a los Ids
     */
    GetNames: function(idsMap) {
        return ColegioSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            nombre: 1,
        }).exec();
    },

    /**
     * Obtiene el ID de un colegio, en base a su nombre
     * @param Nombre del colegio a buscar
     * @param cb Callback de la operacion, (err,colegioId) => {}
     * @return Id del colegio encontrado
     */
    Id: function(colegioName, cb) {
        ColegioSchema.findOne({
            nombre: colegioName
        }, (err, colegio) => {
            if (!err && colegio) cb(null, colegio._id);
            else cb(`No se encontro un Colegio con el nombre: ${colegioName}`);
        });
    },

    /**
     * Agrega un juego al colegio seleccionado
     * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
     * @param juegoId Id del juego a agregarle al colegio
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    AddGame: function(colegioId, juegoId, userId, cb) {
        ColegioSchema.findOne({
            _id: colegioId,
        }, (err, colegio) => {
            if (!err && colegio) {
                colegio.uniqueGame(gameId, (err, duplicated) => {
                    if (!err && !duplicated) {
                        //Puedo actualizar el dato porque no existe ;)
                        ColegioSchema.findOneAndUpdate({
                            _id: colegioId
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
                        }, function(err, colegio) {
                            if (!err && colegio) cb(null, colegio); //Perfecto!
                            else cb(`No se puede agregar el juego: ${gameId} al colegio: ${colegioId}.`);
                        });
                    } else {
                        cb(`El juego: ${gameId} a agregar al colegio: ${colegioId} se encuentra duplicado.`);
                    }
                });
            } else {
                cb(`No se encontro un colegio con el ID: ${colegioId}`);
            }
        });
    },

    /**
     * Desactiva/Activa un juego para un colegio
     * @param colegioId Id del colegio al cual se va a desactivar/activar un juego
     * @param gameId Id del juego de arrays que se quiere operar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    RemoveGame: function(colegioId, gameId, state, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId,
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
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`Error al intentar actualizar el juego: ${gameId}, del colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Obtiene los juegos disponibles del colegio
     * @param colegioId Id del colegio al cual se va a buscar los profesores
     */
    GetGames: function(colegioId) {
        return ColegioSchema.findById({
            _id: colegioId
        }).select({
            juegos: 1,
            _id: 0
        }).exec();
    },

    //Obtiene todos los juegos del colegio, en base a un array de ids
    GetGamesByIds: function(idsMap) {
        return ColegioSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            juegos: 1,
        }).exec();
    },

    /**
     * Agrega a un profesor al colegio seleccionado
     * @param colegioId Id del colegio al cual se va a agregar al profesor
     * @param profesorId Id del profesor que va a representar al colegio
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    AddProfesor: function(colegioId, profesorId, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId
        }, {
            $push: {
                profesores: {
                    profesorId: profesorId
                }
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`Error al intentar agregar el profesor: ${profesorId}, en el colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Desactiva/Activa a un profesor del colegio seleccionado
     * @param colegioId Id del colegio al cual se va a remover al profesor
     * @param profesorId Id del profesor a desactivar/activar del colegio
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    RemoveProfesor: function(colegioId, profesorId, state, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId,
            "profesores.profesorId": profesorId
        }, {
            $set: {
                //$ resultado del query
                "profesores.$.active": state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`No se pudo modificar el profesor del colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Obtiene los profesores disponibles del colegio
     * @param colegioId Id del colegio al cual se va a buscar los profesores
     * @param cb Callback de la operacion, (err,profesores) => {}
     */
    GetProfesores: function(colegioId, cb) {
        ColegioSchema.findById({
            _id: colegioId
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio.profesores);
            else cb(`No se encontraron profesores en el colegio: ${colegioId}.`);
        });
    },

    /**
     * Actualiza la informacion del colegio seleccionado
     * @param colegioId Id del colegio al cual se va a agregar el contacto
     * @param nombre Nombre del colegio
     * @param profile Imagen del perfil
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    UpdateProfile: function(colegioId, nombre, profile, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId
        }, {
            $set: {
                nombre: nombre,
                profile_picture: profile
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio);
            else cb(`No se pudo actualizar el perfil del colegio: ${$colegioId}.`);
        });
    },

    /**
     * Actualiza la direccion del colegio seleccionado
     * @param colegioId Id del colegio al cual se va a agregar el contacto
     * @param direction Objecto con las propiedades necesariasp para la direccion a guardar
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    UpdateDirection: function(colegioId, direction, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId
        }, {
            $set: {
                direction: {
                    cp: direction.cp,
                    address: direction.address,
                    city: direction.city,
                    country: direction.country,
                    state: direction.state
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
            else cb(`No se pudo actualizar la direccion del colegio: ${$colegioId}.`);
        });
    },

    /**
     * Agrega un contacto al colegio seleccionado
     * @param colegioId Id del colegio al cual se va a agregar el contacto
     * @param contact Objecto con las propiedades necesariasp para el contacto a guardar
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    AddContact: function(colegioId, contact, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId
        }, {
            $push: {
                contact: {
                    nombre: contact.nombre,
                    apellido: contact.apellido,
                    phone: {
                        type: contact.phone.type,
                        number: contact.phone.number,
                        area: contact.phone.number
                    },
                    email: {
                        type: contact.email.type,
                        email: contact.email.email
                    },
                    fax: {
                        number: contact.fax.number,
                    },
                    cargo: contact.cargo,
                    social: {
                        facebook: contact.social.facebook,
                        twitter: contact.social.twitter,
                        skype: contact.social.skype,
                    }
                }
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`Error al intentar agregar el contacto: ${contact}, en el colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Desactiva/Activa a un contacto del colegio selecionado
     * @param colegioId Id del colegio al cual se va a remover al contacto
     * @param contactId Id del contacto a desactivar/activar del colegio
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    RemoveContact: function(colegioId, contactId, state, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId,
            "contact._id": contactId
        }, {
            $set: {
                //$ resultado del query
                "contact.$.active": state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`No se pudo modificar el contacto ${contactId} del colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Obtiene los grados disponibles del colegio
     * @param colegioId Id del colegio al cual se va a buscar los contactos
     * @param cb Callback de la operacion, (err,contact) => {}
     */
    GetContacts: function(colegioId, cb) {
        ColegioSchema.findById({
            _id: colegioId
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio.contact);
            else cb(`No se encontraron contactos en el colegio: ${colegioId}.`);
        });
    },

    /**
     * Agrega a un grado al colegio seleccionado
     * @param colegioId Id del colegio al cual se va a agregar al grado
     * @param gradoId Id del grado que va a representar al colegio
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    AddGrade: function(colegioId, gradoId, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId
        }, {
            $push: {
                grados: {
                    gradoId: gradoId
                }
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`Error al intentar agregar el grado: ${gradoId}, en el colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Desactiva/Activa a un grado del colegio selecionado
     * @param colegioId Id del colegio al cual se va a remover al grado
     * @param gradoId Id del grado a desactivar/activar del colegio
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,colegio) => {}
     */
    RemoveGrade: function(colegioId, gradoId, state, userId, cb) {
        ColegioSchema.findOneAndUpdate({
            _id: colegioId,
            "grados.gradoId": gradoId
        }, {
            $set: {
                //$ resultado del query
                "grados.$.active": state
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, colegio) {
            if (!err && colegio) {
                cb(null, colegio);
            } else {
                cb(`No se pudo modificar el grado ${gradoId} del colegio: ${colegioId}.`);
            }
        });
    },

    /**
     * Obtiene los grados disponibles del colegio
     * @param colegioId Id del colegio al cual se va a buscar los colegio
     * @param cb Callback de la operacion, (err,grados) => {}
     */
    GetGrades: function(colegioId, cb) {
        ColegioSchema.findById({
            _id: colegioId
        }, function(err, colegio) {
            if (!err && colegio) cb(null, colegio.grados);
            else cb(`No se encontraron grados en el colegio: ${colegioId}.`);
        });
    },

    Payment: function() {
        /* TODO VER COMO PROCESAR LOS PAGOS... */
    },

    IsOnDay: function() {
        //Revisar si su payment es valido.
    },

    Exist: function(nombre) {
        return ColegioSchema.count({
            nombre: nombre
        }).exec().then(function(colegio) {
            return colegio > 0;
        });
    }
};
