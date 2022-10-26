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

    var widget = '<div class="col-sm-9">' + object.widget.toHTML(name, object) + '</div>';
    return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>';
};

var form = forms.create({
    adminuser: fields.string({
        label: 'Usuario',
        required: true,
        widget: widgets.text(),
        errorAfterField: true,
        id: ['register-admin-input-user'],
        cssClasses: {
            label: ['control-label col-sm-3']
        }
    }),
    adminmail: fields.email({
        label: 'Mail',
        widget: widgets.text(),
        errorAfterField: true,
        id: ['register-admin-input-email'],
        cssClasses: {
            label: ['control-label col-sm-3']
        }
    }),
    adminpwd: fields.password({
        label: 'Contraseña actual',
        required: true,
        widget: widgets.password(),
        errorAfterField: true,
        id: ['register-admin-input-current-password'],
        cssClasses: {
            label: ['control-label col-sm-3']
        }
    }),
    adminnewpwd: fields.password({
        label: 'Nueva Contraseña',
        widget: widgets.password(),
        errorAfterField: true,
        id: ['register-admin-input-new-password'],
        cssClasses: {
            label: ['control-label col-sm-3']
        }
    })
}); //.toHTML(boostrapField);

/**
 * Verifica que el formulario de registro tenga minimamente los valores correctos
 * Haciendo uso de express-validator para los campos y generando un listado de errores
 * @param req Request de la solicitud
 */
var verify = function(req) {

    return new Promise(function(resolve, reject) {

        //req.check("adminuser", "Se precisa de un usuario valido").notEmpty();
        req.check("adminpwd", "Ingrese su contraseña para validar los cambios").notEmpty();
        if (req.body.adminmail.length > 0) {
            req.check("adminmail", "Se precisa de un mail valido").isEmail();
        }

        if (req.body.adminnewpwd.length > 0) {
            req.check("adminnewpwd", "La nueva contraseña debe tener 6 caracteres minimo").isLength({
                min: 6
            });
        }

        //req.check("adminmail","Se precisa de un mail valido").notEmpty();
        //req.check("adminnewpwd", "La nueva contraseña debe tener 6 caracteres minimo").isLength({min: 6});

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
