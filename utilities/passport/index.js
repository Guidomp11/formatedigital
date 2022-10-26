/**
 * Se debe hacer app.use en app.js o cualquiera sea el punto de inicio
 * app.use(passport.passport.initialize());
 * app.use(passport.passport.session());
 */

const local = require('./local');

module.exports = {
    local: local
}
