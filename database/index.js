const Config = rootRequire('config');
const Mongoose = require('mongoose');
Mongoose.Promise = require('bluebird');

if (Config.database && Config.database.host) {
    Mongoose.connect(Config.database.host, function(err) {
        console.log("------------------");
        console.log("Conectado a Mongo!");
        console.log("------------------");
    }).catch(err => {
        console.error("No se puede conectar a mongo: " /* , err.stack */ );
        process.exit(1);
    });
} else {
    console.error("Cuidado! No existe un host seteado en el archivo de configuracion.");
}

module.exports = {
    mongoose: Mongoose,
    store: function(session) {
        let connect_session = require('connect-mongodb-session')(session);
        return new connect_session({
            uri: Config.database ? Config.database.host : "mongodb://127.0.0.1:27017/",
            collection: 'user_session'
        });
    }
}
