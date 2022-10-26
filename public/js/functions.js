function DataTableProcess(dataTable){
  $(dataTable).DataTable({
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
}

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
