const Config = rootRequire('config');
const Usuario = require('./Usuario');
const Singleton = require('./Singleton');
const ExpressSession = require('express-session');
const MongoStore = rootRequire('database').store(ExpressSession);

/**
 * @author Nicolas Perez
 * Administra el uso de sessiones dentro de la aplicacion
 * Permite crear, destrurir y obtener sessiones usando el modulo express-session
 * Para usarala se debe llamar y usar session.instance ya que hereda de Singleton
 */
class Session extends Singleton {

    constructor() {
        super();
    }

    /**
     * Incicializa el modulo para poder operar con las sesiones
     * @param app Referencia de la instancia de express
     */
    Init(app) {
        app.use(ExpressSession({
            name: Config.security.session.name,
            secret: Config.security.session.secret,
            saveUninitialized: false, //true,
            resave: true,
            store: MongoStore,
            sameSite: true,
            domain: Config.site.url
        }));
    }

    /**
     * Crea una session valida y setea valores globales de la session
     * Estas variables son almacenadas en la DB para las sessiones
     * @param session Session donde almacenar los datos
     * @param userId Id del usuario logeado
     * @param userPrivilege Privilegio del usuario (admin, alumno, etc).
     */
    //Start(session, userId, userPrivilege) {
    /**
     * Crea una session valida y setea valores globales de la session
     * Estas variables son almacenadas en la DB para las sessiones
     * @param session Session donde almacenar los datos
     * @param user Datos del usuario a mantener, pictre, menu, privilege, etc
     */
    Start(session, user) {
        session.user = user;
        /*session.user = {
            logged: true,
            id: userId,
            logged_at: new Date(),
            info: {
                privilege: userPrivilege.toLowerCase()
            }
        }*/
    }

    Get(session, value) {
        if (session.user)
            return session.user[value];
    }

    GetPrivilege(session) {
        return session.user ? session.user.privilege : null;
    }

    /*UpdateActive(session, data){

    }*/

    /**
     * Elimina la sesion y hace un unset de req.session
     * @param session Session a destruir (req.session)
     */
    Destroy(session) {
        session.destroy(function(err) {
            Usuario.Reset();
        });
    }

    /**
     * Middleware para verifcar si tiene una session sino lo llevo al login
     * Comprueba que este logeado y que tenga un UserId valido
     */
    IsLogged(req, res, next) {
        //console.log("IsLogged ", Usuario.getId());
        if (Session.GetInstance.Get(req.session, "id")) {
            //console.log("IsLogged DATA: " , req.session.user);
            //console.log("IsLogged UserData: " , Usuario.getId());
            //Si hay session, guardo en Usuario los datos obtenidos
            //if (Usuario.getId() === undefined || Usuario.getId() === null) {
            //console.log("IsLogged Seted User data.");
            let user = req.session.user;
            Usuario.Init(user.id, user.username, user.grado, user.privilege, user.menu, user.picture, user.auth, user.settings);
            //}
            if (req.originalUrl == Config.routes.root) //Redirecciona en Root nada mas al dashboard
                return res.redirect(Session.GetInstance.GetPrivilege(req.session));
            else return next();
        } else {
            Usuario.Reset();
            //Me aseguro de borrar la data bien copado. porque persiste el objeto User
        }
        next();
    }

    /**
     * Middleware para verifcar si esta autorizado a acceder a la url
     * Comprueba que este logeado y que tenga un UserId valido
     */
    IsAuth(req, res, next) {
        if (Session.GetInstance.Get(req.session, "id")) {
            //console.log("ISAUTH DATA: " , req.session.user);
            //console.log("ISAUTH UserData: " , Usuario.getId());
            //Setear en Usuario los datos de la session, si no tiene nada
            //if (Usuario.getId() === undefined || Usuario.getId() === null) {
            //console.log("IsAuth Seted User data.");
            let user = req.session.user;
            Usuario.Init(user.id, user.username, user.grado, user.privilege, user.menu, user.picture, user.auth, user.settings);
            //}
            next();
        } else {
            res.render('noauth', {
                title: Config.site.titulo,
                slogan: Config.site.slogan,
                url: Config.routes.root
            });
            return;
        }
    }

    /**
     * Middleware para verifcar si esta autorizado a acceder a la url (API ONLY)
     * Comprueba que tenga las credenciales necesarias
     */
    IsAuthAPI(req, res, next) {
        if (Session.GetInstance.Get(req.session, "id")) {
            next();
        } else {
            return res.status(400).send('Not Auth.');
        }
    }
}

module.exports = Session.GetInstance;
