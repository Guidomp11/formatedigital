$(document).ready(function() {

    var previewNode = document.querySelector("#template");
    var previewTemplate = previewNode.parentNode.innerHTML;
    var emsg = $('.dz-error-message .message');
    var ealert = $('.dz-error-message .alert');
    previewNode.parentNode.removeChild(previewNode);

    Dropzone.options.myAwesomeDropzone = {
        autoProcessQueue: false,
        uploadMultiple: false,
        parallelUploads: 1,
        maxFiles: 1,
        paramName: "gamefile",
        previewTemplate: previewTemplate,
        previewsContainer: "#previews", // Define the container to display the previews
        clickable: '.fileinput-button',

        init: function() {
            var self = this;
            self.on("addedfile", function(file) {
                emsg.text("");
                ealert.addClass("hidden");
                ealert.removeClass("visible");
                if (self.files.length > 1) {
                    self.removeFile(self.files[0]);
                }
                file.previewElement.querySelector(".start").onclick = function() {
                    self.processQueue();
                };
                file.previewElement.querySelector(".cancel").onclick = function() {
                    emsg.text("");
                    self.removeAllFiles(true);
                };
            });

            self.on("success", function(file,response){
              console.log("success");
                ealert.removeClass("alert-danger");
                ealert.addClass("alert-info");
                ealert.removeClass("hidden");
                ealert.addClass("visible");
                emsg.text(response.infoMessage);
                self.removeAllFiles(true);
            });

            self.on("error", function(file,response){
              console.log("error " , response);
              ealert.removeClass("alert-info");
              ealert.addClass("alert-danger");
              ealert.removeClass("hidden");
              ealert.addClass("visible");
              emsg.text(response.errorMessage);
              self.removeAllFiles(true);
            });

        }
    }
});
