/************************************************************************/
/*                               Globals                                */
/************************************************************************/

global.rootPath = function() {
    return __dirname + '/';
}

global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
}

//Set Custom Config dir
process.env.CONF_EXT_NAME = "./f-config"; // Equals to /config/f-config.json

/************************************************************************/
/*                             End Globals                              */
/************************************************************************/

/************************************************************************/
/*                              Requires                                */
/************************************************************************/

/**
 *   Modulos propios
 */

const Config = rootRequire('config');
const Utilities = rootRequire('utilities');
const Routes = rootRequire('routes');

/**
 *   Modulos externos
 */

var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('cookie-encrypter');
//var flash = require('express-flash');
var helmet = require('helmet')
var favicon = require('serve-favicon');
var i18n = require('i18n'); //Language
var app = express();
var compression = require('compression'); //Support gzip (Production)

/**
 *   Logs
 */
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');
var logDirectory = path.join(__dirname, 'log');

/************************************************************************/
/*                              End Requires                            */
/************************************************************************/

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.basedir = app.get('views'); //base dir for each view

//Pretty output code
if (app.get('env') === 'development') {
    app.locals.pretty = true;
} else {
    //console.log = () => {};
}

/************************************************************************/
/*                              LOGS                                    */
/************************************************************************/

//Ensure log directory exist
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = rfs('access.log', {
    interval: '1d', //1 dia
    path: logDirectory
});
app.use(morgan('combined', {
    stream: accessLogStream
}));

console.log('DIRECCION: ', path.join(__dirname, 'bower_components'));

/************************************************************************/
/*                              END LOGS                                */
/************************************************************************/

/************************************************************************/
/*                              SESSION                                 */
/************************************************************************/

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
}));

app.use(expressValidator()); //Permite validar formularios

app.use(cookieParser(Config.security.cookies.secretKey));
app.use(cookieEncrypter(Config.security.cookies.encryptKey));

Utilities.session.Init(app);

//app.use(flash());

//Support compress
app.use(compression());

/************************************************************************/
/*                              END SESSION                             */
/************************************************************************/

/************************************************************************/
/*                              LOCALES                                 */
/************************************************************************/

i18n.configure({
    locales: ['es', 'en', 'it'],
    directory: __dirname + '/locales',
    defaultLocale: 'es',
    autoReload: true,
    cookie: Config.security.cookies.defaultName,
    api: {
        '__': 'text' //req.__ == req.text
    }
});

app.use(i18n.init);

//Remueve el header que botonea que usa expres js
app.disable('x-powered-by');

/************************************************************************/
/*                            END LOCALES                               */
/************************************************************************/

/************************************************************************/
/*                              ROUTES                                  */
/************************************************************************/

app.use(Routes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

//Path para los juegos protegido. Transalated as /games for /uploads/games
app.use(Config.games.root, express.static(path.join(__dirname, Config.games.upload_dir)));

//Path para las escuelas protegido. Transalated as /escuelas for /uploads/escuelas
app.use(Config.escuelas.root, express.static(path.join(__dirname, Config.escuelas.upload_dir)));

//Path para las profesores protegido. Transalated as /profesores for /uploads/profesores
app.use(Config.profesores.root, express.static(path.join(__dirname, Config.profesores.upload_dir)));

//Path para las alumnos protegido. Transalated as /alumnos for /uploads/alumnos
app.use(Config.alumnos.root, express.static(path.join(__dirname, Config.alumnos.upload_dir)));

app.use(favicon(path.join(__dirname, 'public/favicon', 'favicon.ico')));

/************************************************************************/
/*                              END ROUTES                              */
/************************************************************************/

/************************************************************************/
/*                              ERRORS                                  */
/************************************************************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);

    if (req.accepts('html')) {
        res.render('404', {
            title: Config.site.titulo,
            slogan: Config.site.slogan,
            url: Config.routes.root
        });
        return;
    }

    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
    }

    res.type('txt').send('Not found');
});

// catch 500 and forward to error handler
app.use(function(error, req, res, next) {
    res.status(500);

    if (req.accepts('html')) {
        res.render('500', {
            title: Config.site.titulo,
            slogan: Config.site.slogan,
            url: Config.routes.root,
            error: error
        });
        return;
    }

    if (req.accepts('json')) {
        res.send({
            error: 'Internal Server Error'
        });
        return;
    }

    return res.type('txt').send('Internal Server Error');
});

/************************************************************************/
/*                              END ERRORS                              */
/************************************************************************/

console.log("--------------------");
console.log("Aplicacion Iniciada!");
console.log("--------------------");

module.exports = app;
