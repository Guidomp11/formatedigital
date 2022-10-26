const cookie = require('./cookie');
const tokens = require('./tokens');
const session = require('./session');
const passport = require('./passport');
const file = require('./file');
const usuario = require('./Usuario');

module.exports = {
    cookie: cookie,
    token: tokens,
    session: session,
    passport: passport,
    file: file,
    usuario: usuario
}
