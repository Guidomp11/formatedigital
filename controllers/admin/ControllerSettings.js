const Config = rootRequire('config');
const File = rootRequire('utilities').file;

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlSettings = "/administrador/settings";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {
    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        general.settings = {
            routes: {
                root: UrlSettings + "/",
                add: UrlSettings + ActionAdd,
                del: UrlSettings + ActionDel,
                mod: "/" + ActionMod,
                block: UrlSettings + ActionBlock
            },
            datos: {
                security: Config.security,
                site: Config.site
            }
        };

        res.render(View + 'settings', general);
        delete res.locals.errors;
        delete res.locals.info;
    },

    post: (req, res) => {
        let dbName = req.body.installDbName;
        let dbHost = req.body.installDbHost;
        let dbPort = req.body.installDbPort ? req.body.installDbPort : "";
        let siteTitle = req.body.installGeneralTitle;
        let siteSlogan = req.body.installGeneralSlogan;
        let siteUrl = req.body.installGeneralUrl;
        let siteEmail = req.body.installGeneralAdminMail;

        //Security
        //let cryptoPwd = req.body.securityCrypt ? req.body.securityCrypt : Config.security.crypto.password;
        let sessionSecret = req.body.sessionSecret ? req.body.sessionSecret : Config.security.session.secret;
        let cookiesSecret = req.body.cookieSecret ? req.body.cookieSecret : Config.security.cookies.secretKey;
        let cookieKey = req.body.cookieKey ? req.body.cookieKey : Config.security.cookies.encryptKey;

        let settings = {}; //Config a guardar en el archivo

        settings.database = Config.database; //Tengo que mantenerlo o se rompe fulero

        settings.site = {
            titulo: siteTitle,
            slogan: siteSlogan,
            url: siteUrl,
            contacto: siteEmail
        };

        settings.security = {
            crypto: {
                password: Config.security.crypto.password //Esto no puede cambiar jamas una ves seteado
            },
            session: {
                secret: sessionSecret
            },
            cookies: {
                secretKey: cookiesSecret,
                encryptKey: cookieKey
            }
        };

        File.CreateFile(Config.settings.path + Config.settings.name, JSON.stringify(settings, null, "\t"), "utf-8").then(function(data) {
            req.session.info = [{
                msg: "Actualizado correctamente!"
            }];
            res.redirect(req.originalUrl);
        }).catch((errors) => {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    }
}
