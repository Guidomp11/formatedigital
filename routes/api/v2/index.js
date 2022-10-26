const API = require('express').Router();

API.get('/', function(req, res, next) {
    res.send('API v2');
});

API.get('/version', function(req, res, next) {
    res.send('Version de la API: 2');
});

module.exports = API;
