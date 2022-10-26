/* Acciones basicas que se le permiten al usuario para interactuar con el juego */

var fail_o = "_Error";
var fail_f = "Response";

var canvas = null;

/*Resize vars*/
var rtime;
var timeout = false;
var delta = 200;

$(() => {
    canvas = document.getElementById('canvas');
    var context = canvas.getContext('webgl', {
        preserveDrawingBuffer: true
    });

    /*Canvas drawin size*/
    canvas.width = 800;
    canvas.height = 600;

    CanvasResize(canvas);

    $(window).resize(function() {
        rtime = new Date();
        if (timeout === false) {
            timeout = true;
            setTimeout(ResizeEnd, delta);
        }
    });
});

function ResizeEnd() {
    if (new Date() - rtime < delta) {
        setTimeout(ResizeEnd, delta);
    } else {
        timeout = false;
        CanvasResize(canvas);
    }
}

function CanvasResize(c) {
    if (c) {
        var realToCSSPixels = window.devicePixelRatio;

        /*var displayWidth = c.clientWidth;
        var displayHeigh = c.clientHeight;*/
        var displayWidth = Math.floor(c.clientWidth * realToCSSPixels);
        var displayHeigh = Math.floor(c.clientHeight * realToCSSPixels);

        if (c.width != displayWidth || c.height != displayHeigh) {
            c.width = displayWidth;
            c.height = displayHeigh;
        }
    }
}

/* Game connector */
function SendMessage(gameObject, func, param) {
    if (param === undefined) {
        if (typeof this.SendMessage_vss != 'function')
            this.SendMessage_vss = Module.cwrap('SendMessage', 'void', ['string', 'string']);
        this.SendMessage_vss(gameObject, func);
    } else if (typeof param === "string") {
        if (typeof this.SendMessage_vsss != 'function')
            this.SendMessage_vsss = Module.cwrap('SendMessageString', 'void', ['string', 'string', 'string']);
        this.SendMessage_vsss(gameObject, func, param);
    } else if (typeof param === "number") {
        if (typeof this.SendMessage_vssn != 'function')
            this.SendMessage_vssn = Module.cwrap('SendMessageFloat', 'void', ['string', 'string', 'number']);
        this.SendMessage_vssn(gameObject, func, param);
    } else
        throw "" + param + " is does not have a type which is supported by SendMessage.";
}

/**
 * Request de los datos de la sesion
 * @param u Url to API ("/api/v1/alumno/getLoggedInfo/" DELETE)
 * @param go Obj to search in scene
 * @param f Function to call
 */
function GetData(u, go, f) {
    if (u && go && f) {
        $.get(u).done((d) => {
            SendMessage(go, f, JSON.stringify(d));
        }).fail(() => {
            SendMessage(fail_o, fail_f, JSON.stringify({
                msg: "Can't get info."
            }));
        });
    } else {
        SendMessage(fail_o, fail_f, JSON.stringify({
            msg: "Invalid params."
        }));
    }
}

/**
 * Guarda una screenshot del canvas actual
 * @param filename Nombre del screenshot
 */
function TakeSnapshot(filename) {
    if (canvas) {
        $.getScript('/js/reimg.js').done(() => {
            ReImg.fromCanvas(canvas).downloadPng(filename);
        }).fail(() => {
            SendMessage(fail_o, fail_f, JSON.stringify({
                msg: "Can't load script."
            }));
        });
    } else {
        SendMessage("_Error", fail_f, JSON.stringify({
            msg: "Invalid canvas."
        }));
    }
}

/* Go to root */
function Exit() {
    window.location = "/";
}
