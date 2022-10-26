const ProfesorSchema = require("./schemes/Profesor");

module.exports = {

    /**
     * Crea un nuevo profesor en el sistema relacionado a un colegio y un grado
     * @param usuario Nombre de usuario para ingresar al sistema
     * @param password Clave del usuario
     * @param profile_picture Imagen del colegio (base64)
     * @param contact Informacion del contacto (al menos 1)
     * @param colegiosId Id de los colegio al que va a pertenecer el profesor
     * @param gradosId Ids de los grados donde va a estar asignado el profesor
     * @param created_by Id del usuario que va a cargar el profesor
     */
    New: function(usuario, password, profile_picture, contact, colegiosId, gradosId, created_by) {
        let profesor = new ProfesorSchema({
            usuario: usuario,
            password: password,
            profile_picture: profile_picture,
            contact: contact,
            colegios: colegiosId,
            grados: gradosId,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return profesor.unique(usuario).then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                profesor.save();
                return false;
            }
        });
    },

    UpdateProfesor: function(profesorId, password, newPassword, profile_picture, contact, colegiosId, gradosId, userId) {
        return new Promise(function(resolve, reject) {
            ProfesorSchema.findById(profesorId).exec().then(function(profesor) {
                let valid = true;
                profesor.profile_picture = profile_picture;
                profesor.contact = contact;
                profesor.colegios = colegiosId;
                profesor.grados = gradosId;
                profesor.modifiedy_by.push({
                    userId: userId,
                    date: new Date()
                });
                if (newPassword && !/^\s*$/.test(newPassword)) {
                    if (newPassword != profesor.password) {
                        profesor.passwords_old.push(password)
                        profesor.password = newPassword;
                    } else valid = false;
                }
                profesor.save();
                resolve(valid);
            });
        });
    },

    Update: function(profesorId, password, newPassword, profile_picture, contact, colegiosId, gradosId, userId) {
        return new Promise(function(resolve, reject) {
            ProfesorSchema.findById(profesorId).exec().then(function(profesor) {

                return profesor.validPassword(profesorId, password).then(function(valid) {
                    if (valid) {
                        profesor.profile_picture = profile_picture;
                        profesor.contact = contact;
                        profesor.colegios = colegiosId;
                        profesor.grados = gradosId;
                        profesor.modifiedy_by.push({
                            userId: userId,
                            date: new Date()
                        });
                        if (newPassword && !/^\s*$/.test(newPassword)) {
                            if (newPassword != profesor.password) {
                                profesor.passwords_old.push(password)
                                profesor.password = newPassword;
                            }
                        }
                        profesor.save();
                        resolve(valid);
                    } else {
                        reject("Las clave no es valida.");
                    }
                });
            });
        });
    },

    /**
     * Desactiva/Activa un profesor
     * @param profesorId Id del profesor al cual se va a desactivar/activar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Block: function(profesorId, state, userId) {
        return ProfesorSchema.findByIdAndUpdate(profesorId, {
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
     * Elimina/deselimina un profesor
     * @param profesorId Id del profesor al cual se va a elimina/deselimina
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Delete: function(profesorId, state, userId, cb) {
        return ProfesorSchema.findByIdAndUpdate(profesorId, {
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
        return ProfesorSchema.find({
            deleted: false
        }).select({
            _id: 1,
            contact: 1,
            active: 1
        }).exec();
    },

    /**
     * Obtiene informacion general del profesor
     * @param id Id del Profesor
     */
    GetInfo: function(id) {
        return ProfesorSchema.findOne({
            _id: id,
            deleted: false
        }).select({
            usuario: 1,
            profile_picture: 1,
            /*password: 1,*/
            colegios: 1,
            grados: 1,
            contact: 1
        }).exec();
    },

    /**
     * Realiza el proceso de logeo en el sistema, como profesor
     * @param usuario Usuario del profesor
     * @param password Clave del profesor
     * @param cb Callback de la operacion, (err,userId) => {}
     */
    Login: function(usuario, password, cb) {
        ProfesorSchema.findOne({
            usuario: usuario,
            active: true,
            deleted: false,
        }, function(err, user) {
            if (err) throw err;

            if (!user) cb(err);
            else {
                user.comparePassword(password, (err, isMatch) => {
                    if (err) cb(`No se pudo comprobar la clave ingresada.`);
                    cb(null, isMatch ? user : null);
                });
            }
        });
    },

    ResetPassword: function(mail) {
        //TODO Send mail
    },

    /**
     * Setea una nueva clave al profesor
     * @param profesorId Id del profesor a actualizar la clave
     * @param oldPassword Clave actual del profesor
     * @param newPassword Nueva clave del profesor
     * @param newRPassword Nueva clave del profesor, again
     * @param userId Id del usuario que va a modificar el dato
     */
    ChangePassword: function(profesorId, oldPassword, newPassword, newRPassword, userId) {
        return new Promise(function(resolve, reject) {
            ProfesorSchema.findById(profesorId).exec().then(function(profesor) {
                return profesor.validPassword(profesorId, oldPassword).then(function(valid) {
                    if (valid) {
                        //Se puede operar esos datos
                        if (newPassword && !/^\s*$/.test(newPassword) && newPassword === newRPassword) {
                            profesor.modifiedy_by.push({
                                userId: userId,
                                date: new Date()
                            });
                            if (newPassword != profesor.password) {
                                profesor.passwords_old.push(oldPassword)
                                profesor.password = newPassword;
                            }
                            profesor.save();
                            resolve(valid);
                        } else {
                            reject("La nueva clave no coincide.");
                        }
                    } else {
                        reject("Las clave no es valida.");
                    }
                });
            });
        });
    },

    /**
     * Setea los datos del profesor (nombre, mail, imagen, etc)
     * @param profesorId Id del profesor a actualizar los datos
     * @param contact Datos del profesor
     * @param userId Id del usuario que va a modificar el dato
     */
    SetContact: function(profesorId, contact, userId) {
        return ProfesorSchema.findOneAndUpdate({
            _id: profesorId
        }, {
            $set: {
                contact: contact
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
     * Obtiene los datos disponibles del profesor
     * @param profesorId Id del profesor al cual se requerir la informacion
     */
    GetContact: function(profesorId) {
        return ProfesorSchema.findOne({
            _id: profesorId
        }).select({
            contact: 1
        }).exec();
        /*, function(err, profesor) {
                    if (!err && profesor) cb(null, profesor.contact);
                    else cb(`No se encontraron datos en el profesor: ${profesorId}.`);
                });*/
    },

    /**
     * Obtiene todos los profesores encontrados en base a los Ids pasados
     */
    GetProfesores: function(idsMap) {
        return ProfesorSchema.find({
            "_id": {
                $in: idsMap
            }
        }).select({
            contact: 1
        }).exec();
    },

    /**
     * Setea la configuracion del alumno (nombre, mail, imagen, etc)
     * @param profesorId Id del alumno a actualizar los datos
     * @param settings Configuracion del alumno (Ver el Schema de Alumno para estructura)
     * @param userId Id del usuario que va a modificar el dato
     */
    SetSettings: function(profesorId, settings, userId) {
        return ProfesorSchema.findOneAndUpdate({
            _id: profesorId
        }, {
            $set: {
                settings: settings
            }
            /*$push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }*/
        }).exec();
    },

    /**
     * Obtiene las configuraciones disponibles del profesor
     * @param profesorId Id del profesor al cual se requerir la informacion
     */
    GetSettings: function(profesorId, cb) {
        return ProfesorSchema.findOne({
            _id: profesorId
        }).select({
            _id: 0,
            settings: 1
        }).exec();
    },

    /**
     * Actualiza la imagen de perfil del profesor
     * @param profesorId Id del profesor a actulizar la imagen
     * @param picture  Path de la imagen subida al servidor
     * @param userId   Id  del usuario que modifica el dato
     */
    SetProfilePicture: function(profesorId, picture, userId) {
        return new Promise(function(resolve, reject) {
            ProfesorSchema.findById(profesorId).exec().then(function(profesor) {
                profesor.profile_picture = picture;
                profesor.modifiedy_by.push({
                    userId: userId,
                    date: new Date()
                });
                profesor.save();
                resolve();
            });
        });
    },

    /**
     * Setea el colegio del profesor
     * @param profesorId Id del profesor a setearle el colegio
     * @param colegioId Id del colegio a setearle al profesor
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,profesor) => {}
     */
    SetColegio: function(profesorId, colegioId, userId, cb) {
        ProfesorSchema.findOneAndUpdate({
            _id: profesorId
        }, {
            $set: {
                colegio_id: colegioId
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, profesor) {
            if (!err && profesor) {
                cb(null, profesor);
            } else {
                cb(`Error al intentar setear el colegio al profesor: ${profesorId}.`);
            }
        });
    },

    /**
     * Obtiene los colegios del profesor
     * @param profesorId Id del profesor al cual se requerir la informacion
     */
    GetColegio: function(profesorId) {
        return ProfesorSchema.findOne({
            _id: profesorId
        }).select({
            colegios: 1,
            _id: 0
        }).exec();
    },

    /**
     * Setea el grado del profesor
     * @param profesorId Id del profesor a setearle el colegio
     * @param gradoId Id del colegio a setearle al profesor
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err,profesor) => {}
     */
    SetGrado: function(profesorId, gradoId, userId, cb) {
        ProfesorSchema.findOneAndUpdate({
            _id: profesorId
        }, {
            $set: {
                grado_id: gradoId
            },
            $push: {
                modifiedy_by: {
                    userId: userId,
                    date: new Date()
                }
            }
        }, function(err, profesor) {
            if (!err && profesor) {
                cb(null, profesor);
            } else {
                cb(`Error al intentar setear el grado al profesor: ${profesorId}.`);
            }
        });
    },

    /**
     * Obtiene los grados del profesor
     * @param profesorId Id del profesor al cual se requerir la informacion
     */
    GetGrados: function(profesorId) {
        return ProfesorSchema.findOne({
            _id: profesorId
        }).select({
            _id: 0,
            grados: 1
        }).exec();
    },

    Exist: function(usuario) {
        return ProfesorSchema.count({
            usuario: usuario
        }).exec().then(function(profesor) {
            return profesor > 0;
        });
    }
}
