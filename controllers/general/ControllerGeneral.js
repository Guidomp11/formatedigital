const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Session = rootRequire('utilities').session;

const View = rootPath() + 'views/general/';

module.exports = {

    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        //Cargo las imagenes de /public/img/games-demos en un array para la vista

        File.ListFilesInFolder("public" + Config.public.demos).then((files) => {
            if (files) {
                //Preparo los archivos para el slider
                files = files.map((file) => {
                    return Config.public.demos + "/" + file;
                });
                general.webpage = {
                    games: files
                };
            }
            res.render(View + 'landpage.template.pug', general);

            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    post: (req, res) => {
        //Procesa el formulario de "contacto"
        let usuario = req.body.contactName;
        let email = req.body.contactEmail;

        if (usuario && usuario.length > 0 && email && email.length > 0) {
            Functions.SendEmailContact(usuario, email, (error, info) => {
                if (error) {
                    req.session.errors = [{
                        msg: "No se pudo enviar su email!"
                    }];
                } else {
                    req.session.info = [{
                        msg: "Gracias por su interes, sera respondido en la brevedad.!"
                    }];
                }
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "Por favor complete todos los campos!"
            }];
            return res.redirect(req.originalUrl + "contact");
        }
    },

    get_about: (req, res, general) => {
        res.render(View + 'about', general);
    },

    get_contact: (req, res, general) => {

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        res.render(View + 'contact', general);

        delete res.locals.errors;
        delete res.locals.info
    },

    get_privacy: (req, res, general) => {
        res.render(View + 'privacy', general);
    },

    get_support: (req, res, general) => {
        res.render(View + 'support', general);
    },

    get_tos: (req, res, general) => {
        res.render(View + 'termsofuse', general);
    },

    get_logout: (req, res, general) => {
        req.logout();
        Session.Destroy(req.session);
        res.redirect(Config.routes.login);
    }
};
