const Promise = require('bluebird');
const forms = require('forms');
const widgets = forms.widgets;
const fields = forms.fields;

const boostrapField = function(name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }
    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="alert alert-error help-block">' + object.error + '</div>' : '';

    var validationclass = object.value && !object.error ? 'has-success' : '';
    validationclass = object.error ? 'has-error' : validationclass;

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>';
};

var form = forms.create({
    adminuser: fields.string({
        label: 'Usuario',
        required: true,
        widget: widgets.text({
            placeholder: "Usuario"
        }),
        errorAfterField: true,
        id: ['register-admin-input-user'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    }),
    adminmail: fields.email({
        label: 'Mail',
        required: true,
        widget: widgets.text({
            placeholder: "Email"
        }),
        errorAfterField: true,
        id: ['register-admin-input-email'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    }),
    adminpwd: fields.password({
        label: 'Password',
        required: true,
        widget: widgets.password({
            placeholder: "Contraseña"
        }),
        errorAfterField: true,
        id: ['register-admin-input-password'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    }),
    adminrpwd: fields.password({
        label: 'RepeatPassword',
        required: true,
        widget: widgets.password({
            placeholder: "Repetir Contraseña"
        }),
        errorAfterField: true,
        id: ['register-admin-input-repeat-password'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    })
}); //.toHTML(boostrapField);

/**
 * Verifica que el formulario de registro tenga minimamente los valores correctos
 * Haciendo uso de express-validator para los campos y generando un listado de errores
 * @param req Request de la solicitud
 */
var verify = function(req) {
    /*req.check("adminuser","Se precisa de un usuario valido").notEmpty();
    req.check("adminmail","Se precisa de un mail valido").isEmail();
    req.check("adminpwd", "Ingrese una contraseña").notEmpty();
    req.check("adminrpwd", "Repita la contraseña").notEmpty();
    req.check("adminpwd", "La contraseña debe tener 6 caracteres minimo").isLength({min: 6});
    req.check("adminpwd", "Las contraseñas no coinciden").equals(req.body.adminrpwd);

    req.getValidationResult().then(function(result) {
      cb(result.array().length > 0 ? result.array() : null, !(result.array().length > 0));
    });*/

    return new Promise(function(resolve, reject) {
        req.check("adminuser", "Se precisa de un usuario valido").notEmpty();
        req.check("adminmail", "Se precisa de un mail valido").isEmail();
        req.check("adminpwd", "Ingrese una contraseña").notEmpty();
        req.check("adminrpwd", "Repita la contraseña").notEmpty();
        req.check("adminpwd", "La contraseña debe tener 6 caracteres minimo").isLength({
            min: 6
        });
        req.check("adminpwd", "Las contraseñas no coinciden").equals(req.body.adminrpwd);

        return req.getValidationResult().then(function(result) {
            if (result.array().length > 0) reject(result.array());
            else resolve();
        });
    });
}

module.exports = {
    form: form.toHTML(boostrapField),
    validate: verify
}
