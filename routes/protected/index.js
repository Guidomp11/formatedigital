const General = require('express').Router();
const Session = rootRequire('utilities').session;
const Config = rootRequire('config');

//Protejo la ruta donde se encuentran los datos sensibles, para que lo vea solo el autorizado

General.all(Config.games.root + '/*', Session.IsAuth);
General.all(Config.escuelas.root + '/*', Session.IsAuth);
General.all(Config.profesores.root + '/*', Session.IsAuth);
General.all(Config.alumnos.root + '/*', Session.IsAuth);

module.exports = General;
