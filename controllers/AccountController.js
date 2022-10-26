const Config = rootRequire('config');
const Functions = rootRequire('functions');
const Usuario = rootRequire('utilities').usuario;
const View = rootPath() + 'views/account/';
const Session = rootRequire('utilities').session;
const Privileges = rootRequire('structures/Privileges');
const ModelAccount = rootRequire('models/Account');
const Security = rootRequire('utilities/Security');

const FormLogin = rootRequire('forms/login'); //Formulario de login
const FormRegister = rootRequire('forms/register');

var general = {};
var login_selected_option = null;

module.exports = {

    mid_get: function(req, res, next) {

        Functions.InstalledSystem().then(function(exist) {
            if (!exist) res.redirect(Config.routes.install);
            else {
                general = {
                    title: Config.site.titulo,
                    slogan: Config.site.slogan,
                    url: Config.site.url,
                    email: Config.site.email_encode,
                    menu: Config.site.menu,
                    form: null,
                    error_message: null,
                    success: null
                };
                next();
            }
        });
    },

    get_forgot: function(req, res) {
        res.render(View + 'forgot');
    },

    post_forgot: function(req, res) {

    },

    get_login: function(req, res, next) {

        res.locals.errors = req.session.errors;
        res.locals.success = req.session.success;
        delete req.session.errors;
        delete req.session.success;

        //jQuery
        var cheerio = require('cheerio');
        var $ = cheerio.load(FormLogin.form(req.text));

        //Hard mode to set  a class to form select
        $('#login-type').addClass('selectpicker');

        Privileges.enums.forEach(function(item) {
            if (item.value === login_selected_option)
                $("#login-type").append('<option value="' + item.value + '" selected>' + item.key + '</option>');
            else {
                $("#login-type").append('<option value="' + item.value + '">' + item.key + '</option>');
            }
        });

        general.form = $.html();
        general.error_message = res.locals.errors;
        general.success = res.locals.success;

        res.render(View + 'login', general);

        delete res.locals.errors;
        delete res.locals.success;
    },

    post_login: function(req, res) {

        if (FormLogin.validate(req, (errors, valid) => {
                req.session.errors = errors;
                if (!valid) return res.redirect(Config.routes.login);

                //Si estoy aca, el formulario es valido y puro, tengo que procesar los datos con la DB
                ModelAccount.Login(req.text, req.body.luser, req.body.lpwd, req.body.ltype, (err, user, userPrivilege, userMenu) => {
                    if (!err && user) {
                        let userId = Security.CryptoEncrypt(user._id.toString());
                        let userInfo = {
                            id: userId,
                            grado:  user.grado,
                            username: user.usuario,
                            privilege: userPrivilege,
                            menu: userMenu,
                            picture: user.profile_picture,
                            auth: true,
                            settings: user.settings
                        };

                        //Session.Start(req.session, Security.CryptoEncrypt(userId), userPrivilege);
                        Session.Start(req.session, userInfo); //Guardo en la session
                        //Guardo en mi clase local, para usar en cualquier lugar
                        Usuario.Init(userInfo.id, userInfo.username, userInfo.grado,  userInfo.privilege, userInfo.menu, userInfo.picture, userInfo.auth, userInfo.settings);

                        //Usuario.init(); //Hago un respaldo de los defaults
                        return res.redirect(Config.routes.root);
                    }
                    //No existe los datos
                    req.session.errors = [{
                        msg: req.text('invalid_data')
                    }];

                    login_selected_option = req.body.ltype;
                    return res.redirect(Config.routes.login);
                });
            }));
    },

    //login_validate: FormLogin.validate,

    get_register: function(req, res) {
        res.locals.errors = req.session.errors;
        res.locals.success = req.session.success;
        delete req.session.errors;
        delete req.session.success;

        general.form = FormRegister.form;
        general.error_message = res.locals.errors;
        general.success = res.locals.success;

        res.render(View + 'register', general);

        delete res.locals.errors;
        delete res.locals.success;
    },

    post_register: function(req, res) {

        if (FormRegister.validate(req, (errors, valid) => {
                req.session.errors = errors;

                if (!valid) return res.redirect(Config.routes.register);

                //Si estoy aca, el formulario es valido y puro, tengo que procesar los datos con la DB
                let m = req.body.rmail;
                let p = req.body.rpwd;

                console.log(m);
                console.log(p);
                //Darlo de alta...
                return res.redirect('/register');
            }));

        if (!req.session.success) return res.redirect(Config.routes.register); //i.e: Empty form


    },
};
