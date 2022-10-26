const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');

const View = rootPath() + 'views/install/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelAdmin = rootRequire('models/Admin');
const ModelColegios = rootRequire('models/Colegio');
const ModelProfesores = rootRequire('models/Profesor');
const ModelGrados = rootRequire('models/Grado');
const ModelAlumnos = rootRequire('models/Alumno');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlInstall = "/install";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;

module.exports = {

    get: (req, res, general) => {
        res.locals.warning = req.session.warning;
        res.locals.errors = req.session.errors;
        delete req.session.warning;
        delete req.session.errors;

        general.error_message = res.locals.errors;
        general.warning_mesage = res.locals.warning;

        general.install = Config.install;
        res.render(View + 'index', general);
        delete res.locals.warning;
        delete res.locals.errors;
    },

    post: (req, res) => {
        //Crear archivo de configuracion
        let dbName = req.body.installDbName;
        let dbHost = req.body.installDbHost;
        let dbPort = req.body.installDbPort ? req.body.installDbPort : "";
        let siteTitle = req.body.installGeneralTitle;
        let siteSlogan = req.body.installGeneralSlogan;
        let siteUrl = req.body.installGeneralUrl;
        let siteEmail = req.body.installGeneralAdminMail;

        //Security
        let cryptoPwd = req.body.securityCrypt ? req.body.securityCrypt : Config.security.crypto.password;
        let sessionSecret = req.body.sessionSecret ? req.body.sessionSecret : Config.security.session.secret;
        let cookiesSecret = req.body.cookieSecret ? req.body.cookieSecret : Config.security.cookies.secretKey;
        let cookieKey = req.body.cookieKey ? req.body.cookieKey : Config.security.cookies.encryptKey;

        let settings = {}; //Config a guardar en el archivo

        /*settings.database = {
            host: `mongodb://${dbHost}:${dbPort}/${dbName}`
        };*/

        //Sanitizo la url
        if(!/^(f|ht)tps?:\/\//i.test(siteUrl)){
          siteUrl += "https://";
        }

        settings.site = {
            titulo: siteTitle,
            slogan: siteSlogan,
            url: siteUrl,
            contacto: siteEmail
        };

        settings.security = {
            crypto: {
                password: cryptoPwd
            },
            session: {
                secret: sessionSecret
            },
            cookies: {
                secretKey: cookiesSecret,
                encryptKey: cookieKey
            }
        };

        let credenciales = Config.install.credenciales;

        //Creo los directorios necesarios
        File.CreateFolder(Config.games.upload_dir).then(function() {
            console.log('CREANDO 1');
            return File.CreateFolder(Config.escuelas.upload_dir);
        }).then(function() {
            console.log('CREANDO 2');
            return File.CreateFolder(Config.profesores.upload_dir);
        }).then(function() {
            console.log('CREANDO 3');
            return File.CreateFolder(Config.alumnos.upload_dir);
        }).then(function() {
            console.log('CREANDO 4');
            return File.CreateFile(Config.settings.path + Config.settings.name, JSON.stringify(settings, null, "\t"), "utf-8");
        }).then(function(data) {
            console.log('CREANDO 5');
            //Creo registros por default en la base de datos
            return ModelAdmin.New(credenciales.administrador.usuario, credenciales.administrador.password, null, null);
        }).then(function(duplicado) {
            console.log('CREANDO 6');
            return ModelColegios.New(credenciales.colegio.nombre, null, null, null, null, null);
        }).then(function(duplicado) {
            console.log('CREANDO 7');
            return ModelProfesores.New(credenciales.profesor.usuario, credenciales.profesor.password, null, null, null, null, null);
        }).then(function(duplicado) {
            console.log('CREANDO 8');
            //return ModelGrados.New(credenciales.grado.nombre, null, 4 /*4to 5to ... etc*/, null, null, null, null);
            return ModelGrados.New(credenciales.grado.nombre, 5 /*4to 5to ... etc*/, null);
        }).then(function(duplicado) {
            console.log('CREANDO 9');
            return ModelAlumnos.New(credenciales.alumno.usuario, credenciales.alumno.password, null, null, null, null, null);
        }).then(function(duplicado) {
            console.log('CREANDO 10');
            req.session.install = true;
            return res.redirect(UrlInstall + Config.install.routes.success);
        }).catch((errors) => {
            console.log("Error to install: ", errors);
            req.session.install = true;
            return res.redirect(UrlInstall + Config.install.routes.fail);
        });
    },

    get_success: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.install = req.session.install;
        delete req.session.errors;
        delete req.session.install;

        general.error_message = res.locals.errors;
        general.developer = Config.developer;

        /*if (res.locals.install) res.render(View + 'success', general);
        else res.redirect(Config.install.routes.install);*/

        res.render(View + 'success', general);

        delete res.locals.errors;
        delete res.locals.install;
    },

    get_fail: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.install = req.session.install;
        delete req.session.errors;
        delete req.session.install;

        general.error_message = res.locals.errors;
        general.developer = Config.developer;

        if (res.locals.install) res.render(View + 'fail', general);
        else res.redirect(Config.install.routes.install);

        delete res.locals.errors;
        delete res.locals.install;
    }

};
