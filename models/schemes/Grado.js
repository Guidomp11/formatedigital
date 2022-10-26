const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
var custom = require('./CustomSchema');

var gradoSchema = new Schema({
    nombre: String,
    colegio_id: {
        type: Schema.Types.ObjectId
        /*required: [true, "Se precisa asignar un colegio al grado correspondiente."]*/
    },
    division: {
        type: String
        /*required: [true, "Se precisa asignar una division al grado."]*/
    },
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
    /* Profesor a cargo del grado y supervision del progreso */
    profesor_id: Schema.Types.ObjectId,
    /* Listado de alumnos que pertenecen a este grado  */
    alumnos_id: [{
        alumnoId: Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true
        }
    }],
    /* Referencia de los juegos que tiene el grado */
    juegos: [{
        juegoId: Schema.Types.ObjectId,
        settings: {
            difficult: Schema.Types.Difficult
            //Algo mas. ver que settings se pueden setear a los juegos...
        },
        active: {
            type: Boolean,
            default: true
        }
    }]
});

/*gradoSchema.pre('save', function(next) {
    next();
});*/
/**

 * Verifica si el un grado ya existe en un colegio en base a la division
 * @param colegioId Id del colegio a verificar
 * @param division Nombre de la division
 * @param cb Callback del proceso, true si no existe el dato (err,duplicated)
 */
gradoSchema.methods.uniqueDivision = function(/*colegioId, */division, cb) {
    /*this.model('Grados').count({colegio_id: colegioId, division: division},function(err,grados){
      if(err) cb(err);
      else cb(null, grados > 0);
    });*/

    return this.model('Grados').count({/*colegio_id: colegioId, */division: division}).then(function(grados){
      return grados && grados.length > 0;
    });

    /*return this.model('Grados').find({
        usuario: this.usuario
    }).exec().then(function(res) {
        return res && res.length > 0;
    });*/
};


/**
 * Verifica si el ID de un juego ya existe
 * @param gameId Id del juego a agregar al grado
 * @param cb Callback del proceso, true si no existe el dato (err,duplicated)
 */
gradoSchema.methods.uniqueGame = function(gameId, cb) {
    let duplicated = false;
    for (var i = 0; i < this.juegos.length; i++) {
        if (this.juegos[i].juegoId == gameId) {
            duplicated = true;
            break;
        }
    }
    cb(null, duplicated);
};

/**
 * Verifica si el ID de un Profesor ya existe
 * @param profesorId Id del Profesor a agregar al grado
 * @param cb Callback del proceso, true si no existe el dato (err,duplicated)
 */
gradoSchema.methods.uniqueProfesor = function(profesorId, cb) {
    cb(null, this.profesor_id == profesorId);
};

/**
 * Verifica si el ID de un Alumno ya existe
 * @param alumnoId Id del Alumno a agregar al grado
 * @param cb Callback del proceso, true si no existe el dato (err,duplicated)
 */
gradoSchema.methods.uniqueAlumno = function(alumnoId, cb) {
    let duplicated = false;
    for (var i = 0; i < this.alumnos_id.length; i++) {
        if (this.alumnos_id[i].alumnoId == alumnoId) {
            duplicated = true;
            break;
        }
    }
    cb(null, duplicated);
};

module.exports = mongoose.model('Grados', gradoSchema);
