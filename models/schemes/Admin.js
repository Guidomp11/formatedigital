const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
var custom = require('./CustomSchema');

var adminSchema = new Schema({
    created_by: {
        userId: Schema.Types.ObjectId,
        date: Date
    },
    modifiedy_by: [{
        userId: Schema.Types.ObjectId,
        date: Date
    }],
    active: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    privileges: Schema.Types.Privileges,
    usuario: String,
    password: String,
    passwords_old: Array,
    email: String,
    profile_picture: String,
    settings: {
        receive_notifications: Boolean,
        public_profile: Boolean,
        show_stats: Boolean
    }
});

/**
 * Verifica que no se repita un usuario
 */
adminSchema.methods.unique = function() {
    //return this.model('Administradores').find({usuario:this.usuario}, cb);
    return this.model('Administradores').find({
        usuario: this.usuario
    }).exec().then(function(res) {
        return res && res.length > 0;
    });
};

/**
 * Verifica que no la clave de un usuario sea correcta
 * @param String Id del Usuario a verificar
 * @param Clave del usuario si a verificar
 */
adminSchema.methods.validPassword = function(id, pwd) {
    //return this.model('Administradores').find({_id:id, password: pwd}, cb);
    return this.model('Administradores').find({
        _id: id,
        password: pwd
    }).exec().then((admin) => {
        return admin && admin.length > 0;
    });
};

/**
 * Revisa que las claves sean iguales
 * @param  String   candidatePwd Clave ingresada
 * @param  {Function} cb           callback del proceso, (err, valid)
 */
adminSchema.methods.comparePassword = function(candidatePwd, cb) {
    cb(null, this.password == candidatePwd);
};

module.exports = mongoose.model('Administradores', adminSchema);
