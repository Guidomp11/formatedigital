const General = require('express').Router();
const Controller = rootRequire('controllers/InstallController');
const Config = rootRequire('config');

General.use(Controller.mid_get);
General.get('/', Controller.get_index);
General.post('/', Controller.post_index);
General.get('/success', Controller.get_success);
General.get('/fail', Controller.get_fail);

module.exports = General;
