const Struct = require('struct-type');
const type = Struct.types;

const Difficult = Struct('Difficult', {
    Facil: type.String,
    Medio: type.String,
    Dificil: type.String
});

//New instance
var d_instance = Difficult.make({
    Facil: "Facil",
    Medio: "Medio",
    Dificil: "Dificil"
});

module.exports = d_instance;
