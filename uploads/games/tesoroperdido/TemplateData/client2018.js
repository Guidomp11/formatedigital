/* Acciones basicas que se le permiten al usuario para interactuar con el juego */

var fail_o = "_Error";
var fail_f = "Response";

var canvas = null;

/*Resize vars*/
var rtime;
var timeout = false;
var delta = 200;

/**
 * Request de los datos de la sesion
 * @param u Url to API ("/api/v1/alumno/getLoggedInfo/" DELETE)
 * @param go Obj to search in scene
 * @param f Function to call
 */
function GetData(u, go, f) {
    if (u && go && f) {
        $.get(u).done((d) => {
            gameInstance.SendMessage(go, f, JSON.stringify(d));
        }).fail(() => {
            gameInstance.SendMessage(fail_o, fail_f, JSON.stringify({
                msg: "Can't get info."
            }));
        });
    } else {
        gameInstance.SendMessage(fail_o, fail_f, JSON.stringify({
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
            gameInstance.SendMessage(fail_o, fail_f, JSON.stringify({
                msg: "Can't load script."
            }));
        });
    } else {
        gameInstance.SendMessage("_Error", fail_f, JSON.stringify({
            msg: "Invalid canvas."
        }));
    }
}

/* Go to root */
function Exit() {
    window.location = "/";
}
