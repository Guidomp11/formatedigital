const mongoose = rootRequire('database').mongoose;
var Schema = mongoose.Schema;
var custom = require('./CustomSchema');

var gameSchema = new Schema({
    title: String,
    description: String,
    /*thumbnail: {
        mini: String,
        background: String
    },*/
    tags: Array,
    //difficult: Schema.Types.Difficult,
    type: Schema.Types.GameTypes,
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
    /* Ruta del archivo, o Url donde se aloja el Main del juego */
    path_root: String
});

gameSchema.pre('save', function(next) {
    /*let curDate = new Date();
    this.updated_at = curDate;
    if (!this.created_at) this.created_at = curDate;*/
    next();
});

gameSchema.methods.unique = function(title, isEdit = false) {
    if (isEdit && title == this.title) { //Si es edicion, el mismo titulo es aceptado.
        return new Promise(function(resolve, reject) {
            resolve(false);
        });
    } else {
        return this.model('Games').find({
            title: title
        }).exec().then(function(res) {
            return res && res.length > 0;
        });
    }
}

module.exports = mongoose.model('Games', gameSchema);
