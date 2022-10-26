const Privileges = rootRequire('structures/Privileges');
const Security = rootRequire('utilities/Security');

const ModelAlumno = require('./Alumno');
const ModelProfesor = require('./Profesor');
const ModelAdmin = require('./Admin');
const ModelGrado = require('./Grado');

/************************************************************************/
/*                                 Menus                                */
/************************************************************************/

const MenuAdmin = rootRequire('menus').Admin;
const MenuProfesor = rootRequire('menus').Usuario;
const MenuAlumno = rootRequire('menus').Usuario;

/*General, para uso privado???*/
module.exports = {

    Register: function(mail, pwd) {

    },

    Login: function(text, mail, pwd, accountType, cb) {

        let priv = Privileges.get(parseInt(accountType));
        let userMenu = null;
        switch (priv) {
            case Privileges.Alumno:
                ModelAlumno.Login(mail, pwd, (err, user) => {
                    if (err) throw err;
                    if (!user) cb(err);
                    else {
                        let p = Privileges.Alumno.key;
                        let id = Security.CryptoEncrypt(user._id.toString());
                        if(user.grado_id){
                          ModelGrado.GetDivision(user.grado_id).then(function(grado) {
                              if(grado) user.grado = grado.division;
                              cb(err, user, p, MenuAlumno.profile(p, id, text));
                          });
                        }else{
                          cb(err, user, p, MenuAlumno.profile(p, id, text));
                        }
                    }
                });
                break;
            case Privileges.Profesor:
                ModelProfesor.Login(mail, pwd, (err, user) => {
                    if (err) throw err;
                    if (!user) cb(err);
                    else {
                        let p = Privileges.Profesor.key;
                        let id = Security.CryptoEncrypt(user._id.toString());
                        cb(err, user, p,  MenuProfesor.profile(p, id, text));
                    }
                });
                break;
            case Privileges.Administrador:
                ModelAdmin.Login(mail, pwd, (err, user) => {
                    if (err) throw err;
                    if (!user) cb(err);
                    else {
                        let p = Privileges.Administrador.key;
                        let id = Security.CryptoEncrypt(user._id.toString());
                        cb(err, user, p, MenuAdmin.profile(p, id, text));
                    }
                });
                break;
            default:
                //Throw error
        }
    },

    ResetPassword: function(mail) {

    },
}
