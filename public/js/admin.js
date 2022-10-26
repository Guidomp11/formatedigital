$(function() {

    /*DataTable*/

    $('.table-results').DataTable({
        language: {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
        render: $.fn.dataTable.render.text(),
        "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
        ],
        "pageLength": 25
    });

    /*Modal*/

    /*Llamado cuando se carga un modal de eliminar*/
    $("#modalConfirmDelete").on("show.bs.modal", function(e) {
        var id = $(e.relatedTarget).data('id');
        $(e.currentTarget).find('input').val(id);
    });
});

var maxField = 3;
var currentField = 1;

/**
 * Administra contenido que se puede agregar o remover dinamicamente
 * @param buttonAdd Boton que carga el contenido
 * @param buttonDel Nombre de boton que remueve el contenido
 * @param container Donde se aloja el contenido
 * @param content Contenido a agregar
 * @param totalContainer Donde almacenar el resultado de elementos totales
 */
function ManageContent(buttonAdd, buttonDel, container, content, totalContainer) {
    var delButton = $(buttonDel);
    $(buttonDel).addClass('hidden');
    $(buttonAdd).click(function() {
        if (currentField < maxField) {
            currentField++;
            $(container).append(content);
            $(buttonDel).last().click(function() {
                $(this).parent().parent().remove();
                currentField--;
                totalContainer.val(currentField);
            });
            totalContainer.val(currentField);
            $(".selectpicker").selectpicker('render');
        }
    });
    totalContainer.val(currentField);
}

/**
 * Administra contenido que se puede agregar o remover dinamicamente (para modificar)
 * @param buttonAdd Boton que carga el contenido
 * @param buttonDel Nombre de boton que remueve el contenido
 * @param container Donde se aloja el contenido
 * @param content Contenido a agregar
 * @param totalContainer Donde almacenar el resultado de elementos totales
 * @param classContainer Container que va a tener el contenido, util para poder eliminarlo por nodo
 */
function ManageContentMod(buttonAdd, buttonDel, container, content, totalContainer, classContainer) {
    var delButton = $(buttonDel);
    //$(buttonDel).addClass('hidden');
    $(buttonAdd).click(function() {
        if (currentField < maxField) {
            currentField++;
            $(container).append('<div class="' + classContainer + '">' + content + '</div>');
            $(buttonDel).last().removeClass('hidden');
            $(buttonDel).last().click(function() {
                $(this).parent().parent().remove();
                currentField--;
                totalContainer.val(currentField);
            });
            totalContainer.val(currentField);
            $(".selectpicker").selectpicker('render');
        }
    });

    $(buttonDel).last().click(function() {
        $(this).parent().parent().remove();
        currentField--;
        totalContainer.val(currentField);
    });
    currentField = totalContainer.val();
}

/**
 * Permite editar y guardar el resultado de la imagen procesada con croppie
 * en un <input> para un form
 * @param previewElementBase Ubicaciaon del preview generada por Croppie (.fileinput-preview > img)
 * @param inputPictureFinal Nombre del input de la imagen editada
 */
function PictureEditor(previewElementBase, inputPictureFinal) {
    var idPreview = "picturePreview";
    $(previewElementBase).attr("id", idPreview);

    $("#" + idPreview).croppie({
        enableExif: true,
        viewport: {
            width: 150,
            height: 150,
            type: 'square'
        },
        boundary: {
            width: 150,
            height: 150
        },
        update: function(data) {
            $("#" + idPreview).croppie('result', {
                type: 'base64',
                size: 'viewport'
            }).then(function(result) {
                $(`input[name="${inputPictureFinal}"]`).val(result);
            });
        }
    });
}

/**
 * Carga los datos de una tabla en otra tabla, basandose en los elementos 'checkeados'
 * Las tablas maneja 4 indices, ej: Titulo, nombre, remover, id
 * @param dataTable Tabla que va a contener los datos (debe usar .table-results para su inicializacion)
 * @param checkboxClassContainer Contenedor de los checkbox dentro de la tabla a copiar
 * @param nameForInputs Nombre para el <input> al cual se le asigna el ID del elemento (para un form)
 * @param indexArrayFirst Posicion del elemento en la tabla original (donde se encuentra Titulo por ejemplo)
 * @param indexArraySecond Posicion del elemento en la tabla original (donde se encuentra Nombre por ejemplo)
 * @param indexArrayId Posicion del ID en la tabla resultado
 */
function LoadContentInTable(dataTable, checkboxClassContainer, nameForInputs, indexArrayFirst, indexArraySecond, indexArrayId) {
    var datos = []; /*Datos a ser agregados*/
    var buttonDelete = '<button class="btn btn-danger delete-dato" type="button" title="Eliminar"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';

    /*Obtengo los elementos a agregar*/
    var checkboxes = $(checkboxClassContainer + ":input:checkbox:checked");
    if (checkboxes.length > 0) {
        $(checkboxes).each(function() {
            var row = $(this).closest('tr');
            //var inputElement = `<input type="hidden" name="${nameForInputs}" value="${$(this).val()}" />`;
            var inputElement = `<input name="${nameForInputs}" value="${$(this).val()}" type="hidden">`;
            var elements = [];

            var d = row.find(`td:nth-child(${indexArrayFirst})`).text();
            if (d) elements.push(d);
            d = row.find(`td:nth-child(${indexArraySecond})`).text();
            if (d) elements.push(d);

            elements.push(buttonDelete);
            elements.push(inputElement);

            datos.push(elements);
            /*datos.push([
                row.find(`td:nth-child(${indexArrayFirst})`).text(),
                row.find(`td:nth-child(${indexArraySecond})`).text(),
                buttonDelete,
                inputElement
            ]);*/
        });
    } else {
        /*Es una carga directa, sin procesar checkbox, usado para mod*/
        dataTable.rows().data().each(function(value, index) {
            datos.push(value);
        });
    }

    /*Evito elementos ya cargados en la tabla*/
    var rows = dataTable.rows().data();
    rows.each(function(value, index) {
        var tableGameId = value[indexArrayId];
        datos.forEach(function(dato, indexDato) {
            //console.log("DATO: " , dato[indexArrayId] , " ---------- ", tableGameId);
            if (dato.indexOf(tableGameId) > -1) {
                datos.splice(indexDato, 1);
                //console.log("Contains ", tableGameId);
            }
        });
    });

    //console.log("DATOS; " , datos.length);

    /*Cargo la tabla*/
    datos.forEach(function(dato) {
        dataTable.row.add(dato).draw(false);
    });
    $(`input[name="${nameForInputs}"]`).parent().addClass('hidden'); /*Fix para el margin mistico resultante en la tabla*/

    /*Permite borrar el dato de la lista*/
    $('.delete-dato').on('click', function(e) {
        e.stopImmediatePropagation();
        /*dataTable.row($(this).parents('tr')).remove().draw(false);*/
        $(this).parents('tr').remove();
    });
}

/**
 * Carga los datos de una tabla en un input, basandose en el elemento 'checkeado'
 * El input que llama a la funcion recibe como valor el nombre del elemento seleccionado
 * @param resultContainer Id del elemento donde va a alojarse el input
 * @param radioClassContainer Contenedor de los radio dentro de la tabla a copiar
 * @param nameForInput Nombre para el <input> al cual se le asigna el ID del elemento (para un form)
 * @param indexArrayName Posicion del elemento en la tabla original (donde se encuentra ID por ejemplo)
 * @param result Input donde va el resultado de la seleccion
 */
function LoadOptionInElement(resultContainer, radioClassContainer, nameForInput, indexArrayName, resultInput) {
    var buttonDelete = '<button class="btn btn-danger delete-dato" type="button" title="Eliminar"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
    /*Obtengo el elemento a agregar*/
    var radioButton = $(radioClassContainer + ":input:radio:checked");
    if (radioButton.length > 0) {
        $(radioButton).each(function() {
            var row = $(this).closest('tr');
            var inputElement = `<input name="${nameForInput}" value="${$(this).val()}" type="hidden">`;
            /*Remuevo el anterior, si hay*/
            var input = resultContainer.find('input[name=' + nameForInput + "]")
            if (input.length > 0) input.remove();
            resultContainer.append(inputElement);
            resultInput.val(row.find(`td:nth-child(${indexArrayName})`).text());
        });
    }
}
