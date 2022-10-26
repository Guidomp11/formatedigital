/**
 * @author Nicolas Perez
 * Modulo passport-local para el manejo de sessiones
 * Verifica que los datos de inicio sean correctos
 * Almacena en la session los datos del usuario
 * Tiene que usar un Modelo de datos de Mongoose para el login y el registro????
 * @see https://github.com/jaredhanson/passport-local
 * Ejemplo de uso en una ruta
 *  app.post('/login', passport.authenticate('local-login', {
       successRedirect: '/dashboard',
       failureRedirect: '/login',
       failureFlash: true
 *     }));
 * @todo Revisar como manejo el logeo y el registro con la base de datos
 */

const passport = require('passport');
const passport_local = require('passport-local').Strategy;

/**
 *  Serializa la informacion del usuario en la session
 *  Es atachado en req.session.passport.user
 */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

/**
 *  Obtiene la informacion del usuario almacenada en base al user.id
 *  Esto varia segun lo que se guard en serializeUser
 *  El resultado es atachado a req.user
 */
passport.deserializeUser(function(user, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

/**
 * Estrategia de logeo, con el nombre puedo llamarlo como midleware en una ruta
 * Los parametros username y password son tomados automaticamente de la ruta.
 * En caso que sean distintos los datos a usar del formulario se puede especificar
 */
passport.use('local-login', new passport_local(function(username, password, done) {
    /*User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }
        if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Incorrect password.'
            });
        }
        return done(null, user);
    });*/
    /*    if (username != null && password != null) {
            return done(null, {
                usuario: 'nicx',
                password: 'admin123'
            });
        } else {
            return done(null, false);
        }*/

    return done(null, {
        usuario: 'nicx',
        password: 'admin123'
    });
}));

passport.use('local-signup', new passport_local(function(username, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    /*  process.nextTick(function() {
          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to login already exists
          User.findOne({
              username: username
          }, function(err, user) {
              if (err) return done(err);

              // check to see if theres already a user with that email
              if (user) {
                  return done(null, false, {
                      message: 'That email is already taken.'
                  });
              } else {

                  // if there is no user with that email
                  // create the user
                  var newUser = new User();

                  // set the user's local credentials
                  newUser.local.email = email;
                  newUser.local.password = newUser.generateHash(password);

                  // save the user
                  newUser.save(function(err) {
                      if (err)
                          throw err;
                      return done(null, newUser);
                  });
              }
          });
      });*/
}));

module.exports = passport;
