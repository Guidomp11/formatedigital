const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
var custom = require('./CustomSchema');

var alumnoSchema = new Schema({
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
    dni: String,
    colegio_id: Schema.Types.ObjectId,
    grado_id: Schema.Types.ObjectId,
    profile_picture: String,
    contact: {
        nombre: String,
        apellido: String,
        /*dni: String,*/
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
    stats: {
        /* Estadisticas generales del alumno */
        rank: Number,
        points: Number,
        /* Estadisticas de cada juego para el usuario */
        game_stats: [{
            game_id: Schema.Types.ObjectId,
            /*Estadisticas por nivel del juego*/
            level: [{
              /*level_id: Number/*Schema.Types.ObjectId,*/
              /*points: Number,
              complete: Boolean,
              played_times: Number,
              /* Tiempo total de juego */
              /*total_played: Number,
              fail_times: Number,
              succes_times: Number,
              help_times: Number,
              /* Peor tiempo */
              /*worst_time: Number,
              /* Mejor tiempo */
              /*best_time: Number,*/

              /*game_type: String,*/
              attempts: Number,
              wins: Number,
              calc_times: Number,
              stars: Number,
              unlocks: Number
            }]
        }]
    },
    settings: {
        receive_notifications: Boolean,
        public_profile: Boolean,
        language: String//Number//Schema.Types.Language
    }
});

alumnoSchema.pre('save', function(next) {
    /*let curDate = new Date();
    this.updated_at = curDate;
    if (!this.created_at) this.created_at = curDate;*/
    next();
});


/** Verifica si el un alumno ya existe en base a al usuario
 * @param nombre Del alumno a verificar
 */
alumnoSchema.methods.unique = function(usuario) {
    return this.model('Alumnos').find({
        usuario: usuario
    }).exec().then(function(alumno) {
        return alumno && alumno.length > 0;
    });
};

/**
 * Revisa que las claves sean iguales
 * @param  String   candidatePwd Clave ingresada
 * @param  {Function} cb           callback del proceso, (err, valid)
 */
alumnoSchema.methods.comparePassword = function(candidatePwd, cb) {
    cb(null, this.password == candidatePwd);
};


/**
 * Verifica que la clave de un usuario sea correcta
 * @param String Id del Usuario a verificar
 * @param Clave del usuario si a verificar
 */
alumnoSchema.methods.validPassword = function(id, pwd) {
    return this.model('Alumnos').find({
        _id: id,
        password: pwd
    }).exec().then((alumno) => {
        return alumno && alumno.length > 0;
    });
};

module.exports = mongoose.model('Alumnos', alumnoSchema);
