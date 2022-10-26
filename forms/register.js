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
    rmail: fields.email({
        label: 'Mail',
        required: true,
        widget: widgets.text({placeholder: "Email"}),
        errorAfterField: true,
        id: ['register-input-email'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    }),
    rpwd: fields.password({
        label: 'Password',
        required: true,
        widget: widgets.password({placeholder: "Contraseña"}),
        errorAfterField: true,
        id: ['register-input-password'],
        cssClasses: {
            label: ['control-label sr-only']
        }
    }),
    rrpwd: fields.password({
      label: 'RepeatPassword',
      required: true,
      widget: widgets.password({placeholder: "Repetir Contraseña"}),
      errorAfterField: true,
      id: ['register-input-repeat-password'],
      cssClasses: {
          label: ['control-label sr-only']
      }
    })
}); //.toHTML(boostrapField);

/**
 * Verifica que el formulario de register tenga minimamente los valores correctos
 * Haciendo uso de express-validator para los campos y generando un listado de errores
 * @param req Request de la solicitud
 * @param cb Respuesta de la operacion (errors, valid)
 */
var verify = function(req, cb){
    req.check("rmail","Se precisa de un mail valido").isEmail();
    req.check("rpwd", "Ingrese una contraseña").notEmpty();
    req.check("rrpwd", "Repita la contraseña").notEmpty();
    req.check("rpwd", "La contraseña debe tener 6 caracteres minimo").isLength({min: 6});
    req.check("rpwd", "Las contraseñas no coinciden").equals(req.body.rrpwd);

    req.getValidationResult().then(function(result) {
      cb(result.array(), !(result.useFirstErrorOnly().length > 0));
    });
}

module.exports = {
    form: form.toHTML(boostrapField),
    validate: verify
}
