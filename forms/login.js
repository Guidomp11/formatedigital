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

var form = function(text) {
    return forms.create({
        luser: fields.string({
            label: text('user'),
            required: true,
            widget: widgets.text({
                placeholder: text('user')
            }),
            errorAfterField: true,
            id: ['login-input-user'],
            cssClasses: {
                label: ['control-label sr-only']
            }
        }),
        lpwd: fields.password({
            label: text('password'),
            required: true,
            widget: widgets.password({
                placeholder: text('password')
            }),
            errorAfterField: true,
            id: ['login-input-password'],
            cssClasses: {
                label: ['control-label sr-only']
            }
        }),
        ltype: fields.string({
            label: text('acc_type'),
            required: true,
            choices: { /*one: 'item 1', two: 'item 2', three: 'item 3'*/ },
            widget: widgets.select(),
            id: ['login-type'],
            cssClasses: {
                label: ['control-label sr-only']
            }
        })
    }).toHTML(boostrapField);
}

/**
 * Verifica que el formulario de login tenga minimamente los valores correctos
 * Haciendo uso de express-validator para los campos y generando un listado de errores
 * @param req Request de la solicitud
 * @param cb Respuesta de la operacion (errors, valid)
 */
var verify = function(req, cb) {
    //req.check("lmail","Se precisa de un mail valido").isEmail();
    req.check("lpwd", req.text('invalid_pwd')).isLength({
        min: 6
    });

    req.getValidationResult().then(function(result) {
        cb(result.array(), !(result.array().length > 0));
    });
}

module.exports = {
    form: (text) => {
        return form(text)//form.toHTML(boostrapField)
    },
    validate: verify
}
