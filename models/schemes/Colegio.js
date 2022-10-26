const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
//var Grados = require('./Grados');
var custom = require('./CustomSchema');

var colegioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, "Se precisa un nombre para el colegio."]
    },
    direction: {
        cp: String,
        address: String,
        city: String,
        country: String,
        state: String
    },
    contact: [{
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
        cargo: String, //Director, Supervisor, gerente. etc?
        social: {
            facebook: String,
            twitter: String,
            skype: String,
        },
        active: {
            type: Boolean,
            default: true,
        }
    }],
    active: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    created_by: {
        userId: Schema.Types.ObjectId,
        date: Date
    },
    modifiedy_by: [{
        userId: Schema.Types.ObjectId,
        date: Date
    }],
    payments: [{
        date: Date,
        status: String
    }],
    profile_picture: String,
    profesores: [{
        /*Profesores disponibles*/
        profesorId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true,
        }
    }],
    /* Listado de todos los grados que tiene el colegio */
    grados: [{
        gradoId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true
        }
    }],
    /* Listado de juegos que compro el colegio */
    juegos: [{
        juegoId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true
        }
    }]
});

colegioSchema.pre('save', function(next) {
    /*let curDate = new Date();
    this.updated_at = curDate;
    if (!this.created_at) this.created_at = curDate;*/
    next();
});

/** Verifica si el un colegio ya existe en base a al nombre
* @param nombre Del colegio a verificar
*/
colegioSchema.methods.uniqueCollege = function(nombre) {
   /*this.model('Colegios').count({nombre: nombre},function(err,colegios){
     if(err) cb(err);
     else cb(null, colegios > 0);
   });*/

   return this.model('Colegios').find({
       nombre: nombre
   }).exec().then(function(colegios) {
       return colegios && colegios.length > 0;
   });
};

/**
 * Verifica si el ID de un juego ya existe
 * @param gameId Id del juego a agregar al grado
 * @param cb Callback del proceso, true si no existe el dato (err,duplicated)
 */
colegioSchema.methods.uniqueGame = function(gameId, cb) {
    let duplicated = false;
    for (var i = 0; i < this.juegos.length; i++) {
        if (this.juegos[i].juegoId == gameId) {
            duplicated = true;
            break;
        }
    }
    cb(null, duplicated);
};

module.exports = mongoose.model('Colegios', colegioSchema);
