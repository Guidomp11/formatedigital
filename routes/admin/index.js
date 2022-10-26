const General = require('express').Router();
const Controller = rootRequire('controllers/AdminController');
const Session = rootRequire('utilities').session;
const Multer = require('multer')();

/************************************************************************/
/*                                User                                  */
/************************************************************************/
General.use(Session.IsAuth, Controller.mid_get); //Procesa los datos
General.get('/', Controller.get_dashboard);
/*General.get('/:id/profile', Controller.get_id_profile); //Muestra nombre, telefono, etc
General.post('/:id/profile', Controller.post_id_profile);*/
General.get('/:id/settings', Controller.get_id_settings); //Muestra las opciones que puede modificar de su perfil
General.post('/:id/settings', Controller.post_id_settings);

/************************************************************************/
/*                              Dashboard                               */
/************************************************************************/
General.get('/dashboard', Controller.get_dashboard);

/************************************************************************/
/*                               Juegos                                 */
/************************************************************************/
General.get('/juegos', Controller.get_juegos);
General.get('/juegos/add', Controller.get_juegos_add);
General.post('/juegos/add', Multer.single('gamefile'), Controller.post_juegos_add);
General.post('/juegos/del', Controller.post_juegos_del);
General.post('/juegos/block', Controller.post_juegos_block);
General.get('/juegos/:id/mod', Controller.get_juegos_mod);
General.post('/juegos/:id/mod', Controller.post_juegos_mod);

General.get('/juegos/:id', Controller.get_juegos_info); //Muestra la info del juego

/************************************************************************/
/*                              Colegios                                */
/************************************************************************/
General.get('/colegios', Controller.get_colegios);
General.get('/colegios/add', Controller.get_colegios_add);
General.post('/colegios/add', Controller.post_colegios_add);
General.post('/colegios/del', Controller.post_colegios_del);
General.post('/colegios/block', Controller.post_colegios_block);
General.get('/colegios/:id/mod', Controller.get_colegios_mod);
General.post('/colegios/:id/mod', Controller.post_colegios_mod);

General.get('/colegios/:id', Controller.get_colegios_info); //Muestra prof, grados, juegos

/************************************************************************/
/*                             Profesores                               */
/************************************************************************/
General.get('/profesores', Controller.get_profesores);
General.get('/profesores/add', Controller.get_profesores_add);
General.post('/profesores/add', Controller.post_profesores_add);
General.post('/profesores/del', Controller.post_profesores_del);
General.post('/profesores/block', Controller.post_profesores_block);
General.get('/profesores/:id/mod', Controller.get_profesores_mod);
General.post('/profesores/:id/mod', Controller.post_profesores_mod);

General.get('/profesores/:id', Controller.get_profesores_info); //Muestra prof, grados, juegos

/************************************************************************/
/*                               Grados                                 */
/************************************************************************/
General.get('/grados', Controller.get_grados);
General.get('/grados/add', Controller.get_grados_add);
General.post('/grados/add', Controller.post_grados_add);
General.post('/grados/del', Controller.post_grados_del);
General.post('/grados/block', Controller.post_grados_block);
General.get('/grados/:id/mod', Controller.get_grados_mod);
General.post('/grados/:id/mod', Controller.post_grados_mod);

General.get('/grados/:id', Controller.get_grados_info);

/************************************************************************/
/*                               Alumnos                                */
/************************************************************************/
General.get('/alumnos', Controller.get_alumnos);
General.get('/alumnos/add', Controller.get_alumnos_add);
General.post('/alumnos/add', Controller.post_alumnos_add);
General.post('/alumnos/del', Controller.post_alumnos_del);
General.post('/alumnos/block', Controller.post_alumnos_block);
General.get('/alumnos/:id/mod', Controller.get_alumnos_mod);
General.post('/alumnos/:id/mod', Controller.post_alumnos_mod);

General.get('/alumnos/:id', Controller.get_alumnos_info);

/************************************************************************/
/*                               Admins                                 */
/************************************************************************/
General.get('/admins', Controller.get_admins);
General.post('/admins/add', Controller.post_admin_add);
General.post('/admins/del', Controller.post_admin_del);
General.post('/admins/block', Controller.post_admin_block);
General.get('/admins/:id/mod', Controller.get_admin_mod);
General.post('/admins/:id/mod', Controller.post_admin_mod);

/************************************************************************/
/*                              Settings                                */
/************************************************************************/
General.get('/settings', Controller.get_settings);
General.post('/settings', Controller.post_settings);

module.exports = General;
