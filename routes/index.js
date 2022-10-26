/**
 *   Rutas disponibles para la aplicacion
 */
const router = require('express').Router();

router.use('/api',require('./api'));
router.use('/install', require('./install')); //Usado para el primer uso, genera las bases necesarias.

router.use(require('./general')); //Landpage, about, contact, etc
router.use(require('./account')); //Login, Register, Forgot, etc
router.use(require('./protected')); //Rutas que solo puede ser accedidas bajo login
router.use(require('./changer')); //maneja los cambios de rutas ej: /uploads/games to /games
router.use('/administrador', require('./admin')); //Dashboard, setting,s profile
router.use('/alumno', require('./alumno')); //Dashboard, setting,s profile
router.use('/profesor', require('./profesor')); //Dashboard, setting,s profile

/*router.use('/games/:gameId/:userId',(req,res,next) => {
  console.log(".... ", );
  next();
});*/

module.exports = router;
