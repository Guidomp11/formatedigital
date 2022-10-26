const AdminSchema = require("./schemes/Admin");

module.exports = {

    /**
     * Crea un nuevo administrador en el sistema relacionado a un colegio y un grado
     * @param usuario Nombre de usuario para ingresar al sistema
     * @param password Clave del usuario
     * @param email Mail del usuario
     * @param created_by Id del usuario que va a cargar el administrador
     */
    New: function(usuario, password, email, created_by) {
        let administrador = new AdminSchema({
            usuario: usuario,
            password: password,
            email: email,
            created_by: {
                userId: created_by,
                date: new Date()
            }
        });

        return administrador.unique().then(function(duplicado) {
            if (duplicado) return duplicado;
            else {
                administrador.save();
                return false;
            }
        });
    },

    /**
     * Desactiva/Activa un administrador
     * @param administradorId Id del administrador al cual se va a desactivar/activar
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     */
    Block: function(administradorId, state, userId) {
        return AdminSchema.findByIdAndUpdate(administradorId, {
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
     * Elimina/deselimina un administrador
     * @param administradorId Id del administrador al cual se va a elimina/deselimina
     * @param state Estado a setearle
     * @param userId Id del usuario que va a modificar el dato
     * @param cb Callback de la operacion, (err) => {}
     */
    Delete: function(administradorId, state, userId, cb) {
        return AdminSchema.findByIdAndUpdate(administradorId, {
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
     * Realiza el proceso de logeo en el sistema, como administrador
     * @param usuario Usuario del administrador
     * @param password Clave del administrador
     * @param cb Callback de la operacion, (err,userId) => {}
     */
    Login: function(usuario, password, cb) {
        AdminSchema.findOne({
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

    /**
     * Obtiene informacion general del administrador
     * @param id Id del administrador
     * @param cb Callback de la operacion, (err,userId) => {}
     */
    /*  GetInfo: function(id, cb) {
          AdminSchema.findOne({
              _id: id,
              deleted: false
          }, function(err, admin) {
              if (err) cb(`No se pudo encontrar el administrador ${id}.`);
              else if (!admin) cb(`El administrador ${id} fue borrado o bloqueado.`);
              else cb(null, admin);
          });
      },*/

    /**
     * Obtiene informacion general del administrador
     * @param id Id del administrador
     */
    GetInfo: function(id) {
        return AdminSchema.findOne({
            _id: id,
            deleted: false
        }).select("-modifiedy_by").exec();
    },

    /**
     * Setea la configuracion del administrador (nombre, mail, imagen, etc)
     * @param adminId Id del administrador a actualizar los datos
     * @param settings Configuracion del administrador (Ver el Schema de Admin para estructura)
     * @param userId Id del usuario que va a modificar el dato
     */
    SetSettings: function(adminId, settings, userId) {
        return AdminSchema.findOneAndUpdate({
            _id: adminId
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
     * Obtiene las configuraciones disponibles del administrador
     * @param adminId Id del administrador al cual se requerir la informacion
     */
    GetSettings: function(adminId) {
        return AdminSchema.findOne({
            _id: adminId
        }).select({
            _id: 0,
            settings: 1
        }).exec();
    },

    UpdateInfo: function(id, pwd, mail, newPwd, userId) {
        return new Promise(function(resolve, reject) {
            AdminSchema.findById(id).exec().then(function(admin) {

                return admin.validPassword(id, pwd).then(function(valid) {
                    if (valid) {
                        //Se puede operar esos datos
                        admin.email = mail;
                        admin.modifiedy_by.push({
                            userId: userId,
                            date: new Date()
                        });
                        if (newPwd && !/^\s*$/.test(newPwd)) {
                            if (newPwd != admin.password) {
                                admin.passwords_old.push(pwd)
                                admin.password = newPwd;
                            }
                        }
                        admin.save();
                        resolve(valid);
                    } else {
                        reject("Las clave no es valida.");
                    }
                });
            });
        });
    },

    ResetPassword: function(mail) {
        //TODO Send mail
    },

    /**
     * Setea una nueva clave al administrador
     * @param adminId Id del administrador a actualizar la clave
     * @param oldPassword Clave actual del administrador
     * @param newPassword Nueva clave del administrador
     * @param newRPassword Nueva clave del administrador, again
     * @param userId Id del usuario que va a modificar el dato
     */
    ChangePassword: function(adminId, oldPassword, newPassword, newRPassword, userId) {
        return new Promise(function(resolve, reject) {
            AdminSchema.findById(adminId).exec().then(function(administrador) {
                return administrador.validPassword(adminId, oldPassword).then(function(valid) {
                    if (valid) {
                        //Se puede operar esos datos
                        if (newPassword && !/^\s*$/.test(newPassword) && newPassword === newRPassword) {
                            administrador.modifiedy_by.push({
                                userId: userId,
                                date: new Date()
                            });
                            if (newPassword != administrador.password) {
                                administrador.passwords_old.push(oldPassword)
                                administrador.password = newPassword;
                            }
                            administrador.save();
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
     * Obtiene una lista de todos los administradores que hay
     * @param cb Calback de la operacion, (err, admins) => {}
     */
    /*List: function(cb) {
        AdminSchema.find({
            deleted: false
        }, function(err, admins) {
            if (!err && admins) cb(null, admins);
            else cb(`No se encontraron administradores.`);
        }).select("-password -passwords_old -modifiedy_by");
    },*/

    /**
     * Obtiene una lista de todos los administradores que hay
     */
    List: function() {
        return AdminSchema.find({
            deleted: false
        }).select("-password -passwords_old -modifiedy_by").exec();
    },

    Exist: function(usuario) {
        return AdminSchema.count({
            usuario: usuario
        }).exec().then(function(usuario) {
            return usuario > 0;
        });
    }
}
