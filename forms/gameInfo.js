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

    var widget = '<div class="">' + object.widget.toHTML(name, object) + '</div>';
    return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>';
};

var form = forms.create({
    gamePath: fields.string({
        label: 'Ruta',
        widget: widgets.text(),
        errorAfterField: true,
        id: ['game_info_path'],
        cssClasses: {
            label: ['control-label']
        }
    }),
    gameTitle: fields.string({
        label: 'Titulo',
        required: true,
        widget: widgets.text({
            placeholder: "Titulo del juego"
        }),
        errorAfterField: true,
        id: ['game_info_title'],
        cssClasses: {
            label: ['control-label requiredField']
        }
    }),
    gameDescription: fields.email({
        label: 'Descripcion',
        widget: widgets.textarea({
            placeholder: "Descripcion corta del juego",
            cols: 40,
            rows: 10
        }),
        errorAfterField: true,
        id: ['game_info_description'],
        cssClasses: {
            label: ['control-label requiredField']
        }
    }),
    gameTags: fields.string({
        label: 'Etiquetas',
        required: true,
        widget: widgets.text(),
        errorAfterField: true,
        id: ['game_info_tags'],
        cssClasses: {
            label: ['control-label requiredField']
        }
    }),
    gameType: fields.string({
        label: 'Tipo de juego',
        widget: widgets.text(),
        errorAfterField: true,
        choices: {},
        id: ['game_info_type'],
        cssClasses: {
            label: ['control-label requiredField']
        }
    })
}); //.toHTML(boostrapField);

/**
 * Verifica que el formulario de registro tenga minimamente los valores correctos
 * Haciendo uso de express-validator para los campos y generando un listado de errores
 * @param req Request de la solicitud
 */
/*var verify = function(req) {

    return new Promise(function(resolve, reject) {
        req.check("gameTitle", "Se precisa una titulo para el juego.").notEmpty();
        req.check("gameDescription", "La descripcion debe ser un poco mas completa.").isLength({
            min: 10,
            max: 200
        });

        let tagsOver = req.body.gameTags ? req.body.gameTags.split(',').length : 0; //Veo si hay mas tags de los permitidos
        let tmsg = null;
        if (tagsOver > 3) tmsg = "Por favor ingrese maximo 3 tags.";
        else if (tagsOver == 0) tmsg = "Por favor ingrese un tag minimo.";

        req.check("gameType", "Seleccion el tipo de juego.").notEmpty();

        return req.getValidationResult().then(function(result) {
            if (tmsg) {
                result.array().push({
                    param: 'gameTags',
                    msg: tmsg,
                    value: ''
                });
            }

            if (result.array().length > 0) reject(result.array());
            else resolve();
        });
    });
}*/

module.exports = {
    form: form.toHTML(boostrapField),
    //validate: verify
}
