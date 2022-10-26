const General = require('express').Router();
const Session = rootRequire('utilities').session;
const Config = rootRequire('config');

General.all("/" + Config.games.upload_dir + '*', Session.IsAuth, (req, res, next) => {
    return res.redirect(Config.games.root + "/" + req.params[0]);
});

General.all("/" + Config.escuelas.upload_dir + '*', Session.IsAuth, (req, res, next) => {
    return res.redirect(Config.escuelas.root + "/" + req.params[0]);
});

General.all("/" + Config.profesores.upload_dir + '*', Session.IsAuth, (req, res, next) => {
    return res.redirect(Config.profesores.root + "/" + req.params[0]);
});

General.all("/" + Config.alumnos.upload_dir + '*', Session.IsAuth, (req, res, next) => {
    return res.redirect(Config.alumnos.root + "/" + req.params[0]);
});

module.exports = General;
