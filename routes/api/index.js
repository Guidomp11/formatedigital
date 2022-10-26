const Router = require('express').Router();
const API = rootRequire('config').api;

for (var k in API.versions) {
    Router.use(API.versions[k], require("./" + API.versions[k]));
}

//Handle Missing requests
Router.use(function(req, res) {
    return res.status(400).send('Invalid Request, please be careful :)');
});

module.exports = Router;
