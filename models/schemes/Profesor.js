const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
var custom = require('./CustomSchema');

var profesorSchema = new Schema({
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
    profile_picture: String,
    contact: {
        nombre: String,
        apellido: String,
        phone: {
            p_type: String,
            p_number: String,
            p_area: String
        },
        email: {
            type: String,
            email: String
        },
        fax: {
            f_type: String,
            f_number: String,
            f_area: String
        },
        birth: String,
        social: {
            facebook: String,
            twitter: String,
            skype: String,
        }
    },
    /* Colegio al que pertenece el profesor */
    /*colegio_id: Schema.Types.ObjectId,*/
    colegios: [{
        colegioId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true
        }
    }],
    /* Listado de todos los grados que tiene el profesor */
    grados: [{
        gradoId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true
        }
    }],
    settings: {
        receive_notifications: Boolean,
        public_profile: Boolean,
        language: String //Number//Schema.Types.Language
    }
}, {
    usePushEach: true
});

profesorSchema.pre('save', function(next) {
    /*let curDate = new Date();
    this.updated_at = curDate;
    if (!this.created_at) this.created_at = curDate;*/
    next();
});

/**
 * Verifica que la clave de un usuario sea correcta
 * @param String Id del Usuario a verificar
 * @param Clave del usuario si a verificar
 */
profesorSchema.methods.validPassword = function(id, pwd) {
    return this.model('Profesores').find({
        _id: id,
        password: pwd
    }).exec().then((profesor) => {
        return profesor && profesor.length > 0;
    });
};

/** Verifica si el un profesor ya existe en base a al nombre
 * @param nombre Del profesor a verificar
 */
profesorSchema.methods.unique = function(usuario) {
    return this.model('Profesores').find({
        usuario: usuario
    }).exec().then(function(profesores) {
        return profesores && profesores.length > 0;
    });
};

profesorSchema.methods.comparePassword = function(candidatePwd, cb) {
    cb(null, this.password == candidatePwd);
};

module.exports = mongoose.model('Profesores', profesorSchema);
